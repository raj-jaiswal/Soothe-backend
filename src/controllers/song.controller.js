// song.controller.js
const { s3 } = require('../config/aws');
const songRepo = require('../db/songs.repo');
const userRepo = require('../db/users.repo');
const favouritesRepo = require("../db/favourites.repo");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Pinecone } = require("@pinecone-database/pinecone");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const INDEX_NAME = "song-embeddings";

const getSongStreamUrl = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 👇 ADD THIS LINE RIGHT HERE 👇
    console.log(`[DEBUG] Backend received request for Song ID: ${id}`); 

    const song = await songRepo.getSongById(id);

    if (!song) {
      // If the log prints the ID, but the app crashes here, your database doesn't have a song with that ID!
      return res.status(404).json({ error: 'Song metadata not found in database' });
    }

    // s3Key represents the exact filename path in your S3 bucket
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: song.s3Key, 
      Expires: 60 // URL valid for 60 seconds
    };

    const url = await s3.getSignedUrlPromise('getObject', params);
    
    // Add to listening history asynchronously if authenticated
    if (req.user && req.user.username) {
      userRepo.addSongToHistory(req.user.username, song).catch(err => {
        console.error('[History] Failed to log song history:', err);
      });
    }


    res.status(200).json({ 
      metadata: song,
      streamUrl: url 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Add this below your existing getSongStreamUrl function
const getSongMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    
    const song = await songRepo.getSongById(id);

    if (!song) {
      return res.status(404).json({ error: 'Song metadata not found in database' });
    }

    // Return ONLY the metadata, skipping the S3 signed URL generation
    res.status(200).json({ 
      metadata: song 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const getAllSongs = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const songs = await songRepo.getAllSongs();
    const favourites = await favouritesRepo.getUserFavourites(userId);

    const favouriteSongIds = new Set(
      favourites.map((fav) => String(fav.songId))
    );

    const songsWithFavouriteFlag = (songs || []).map((song) => ({
      ...song,
      isFavourite: favouriteSongIds.has(
        String(song.song_ID || song.songId || song.id)
      ),
    }));

    res.status(200).json(songsWithFavouriteFlag);
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({ error: "Failed to fetch songs" });
  }
};

// Helper: cosine similarity between two vectors
const cosineSimilarity = (a, b) => {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

const ALL_MOODS = ['love', 'calm', 'euphoric', 'upbeat', 'angry', 'anxious', 'grief'];

const suggestSongsByMood = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text input is required" });
    }

    console.log(`[DEBUG] Searching Pinecone for mood: "${text}"`);

    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

    // 1. Generate embedding for user's text
    const userResult = await model.embedContent({
      content: { parts: [{ text }] },
      outputDimensionality: 768,
    });
    const userEmbedding = userResult.embedding.values;

    // 2. Generate embeddings for all 7 mood prototypes in parallel
    const moodEmbeddingResults = await Promise.all(
      ALL_MOODS.map(mood =>
        model.embedContent({
          content: { parts: [{ text: mood }] },
          outputDimensionality: 768,
        })
      )
    );

    // 3. Compute raw cosine similarities for each mood
    const rawScores = moodEmbeddingResults.map((r, i) => ({
      mood: ALL_MOODS[i],
      score: cosineSimilarity(userEmbedding, r.embedding.values), // range ~[-1, 1]
    }));

    // Min-max normalization: stretch actual range to [0, 1] so the spread is meaningful.
    // Mood embeddings cluster tightly (e.g. 0.70–0.90), so dividing by max would push
    // everything near 100%. Min-max ensures the dominant mood = 1.0 and the weakest = 0.0.
    const scoreValues = rawScores.map(m => m.score);
    const minScore = Math.min(...scoreValues);
    const maxScore = Math.max(...scoreValues);
    const range = maxScore - minScore || 1;
    const moodScores = {};
    rawScores.forEach(({ mood, score }) => {
      moodScores[mood] = parseFloat(((score - minScore) / range).toFixed(3));
    });

    // 4. Query Pinecone with user's embedding
    const index = pc.index(INDEX_NAME);
    const queryResponse = await index.query({
      vector: userEmbedding,
      topK: 5,
      includeMetadata: true
    });

    const suggestedSongs = queryResponse.matches.map(match => ({
      songId: match.id,
      score: match.score,
      metadata: match.metadata
    }));

    res.status(200).json({ suggestions: suggestedSongs, moodScores });
  } catch (error) {
    console.error("Error suggesting songs by mood:", error);
    res.status(500).json({ error: "Failed to suggest songs based on mood" });
  }
};

// Update your exports to include the new function
module.exports = { getSongStreamUrl, getSongMetadata, getAllSongs, suggestSongsByMood };