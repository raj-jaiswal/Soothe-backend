const path = require('path');
const fs = require('fs');

// 1. MUST BE FIRST LINE: Load environment variables robustly
const findEnv = () => {
  let dir = __dirname;
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, '.env');
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  return null;
};
const envPath = findEnv();
if (!envPath) { console.error('❌ Could not find .env file'); process.exit(1); }
require('dotenv').config({ path: envPath });
console.log(`✅ Loaded .env from: ${envPath}`);

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Pinecone } = require("@pinecone-database/pinecone");

// Import songs directly from seedsongs.js
const { songs } = require('./seedsongs.js');

// 2. Initialize Clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// 3. Configuration
const INDEX_NAME = "song-embeddings";
const DIMENSION = 768;

// Helper function to pause execution (used when creating a new index)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function ensureIndexExists() {
  console.log(`Checking for Pinecone index: "${INDEX_NAME}"...`);
  
  const list = await pc.listIndexes();
  const indexExists = list.indexes.some(idx => idx.name === INDEX_NAME);

  if (!indexExists) {
    console.log(`Index not found. Creating "${INDEX_NAME}" now...`);
    await pc.createIndex({
      name: INDEX_NAME,
      dimension: DIMENSION,
      metric: 'cosine',
      spec: { 
        serverless: { 
          cloud: 'aws', 
          region: 'us-east-1' 
        }
      }
    });
    console.log("Index created! Waiting 45 seconds for Pinecone to initialize it...");
    await delay(45000); // Wait 45 seconds for the index to be fully ready
  } else {
    console.log(`Index "${INDEX_NAME}" is ready.`);
  }
}

async function main() {
  try {
    // Step A: Make sure the database is ready
    await ensureIndexExists();

    // Step B: Connect to the specific index and load the Gemini model
    const index = pc.index(INDEX_NAME);
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

    const vectorsToUpsert = [];
    console.log(`\nStarting embedding generation for ${songs.length} songs...`);

    // Step D: Generate embeddings for each song
    for (const song of songs) {
      try {
        // Extract moods from the DynamoDB format [{ S: 'mood1' }, ...]
        const moodString = song.moods && Array.isArray(song.moods) 
            ? song.moods.map(m => m.S).join(', ') 
            : '';

        // Combine title, artist, description, and mood for a rich semantic embedding
        const textToEmbed = `Title: ${song.name}. Artist: ${song.artist}. Description: ${song.description}. Moods: ${moodString}`;

        // Generate embedding and force it to 768 dimensions
        const result = await model.embedContent({
            content: { parts: [{ text: textToEmbed }] },
            outputDimensionality: DIMENSION,
        });
        
        const embedding = result.embedding.values;

        if (embedding) {
          vectorsToUpsert.push({
            id: song.songId,
            values: embedding,
            metadata: { 
              title: song.name, 
              artist: song.artist,
              description: song.description,
              moods: moodString
            }
          });
          console.log(`✓ Successfully embedded: ${song.name}`);
        }
        
        // Wait ~600ms between calls to avoid Gemini's "100 requests per minute" limit
        await delay(650);
      } catch (embedError) {
        console.error(`X Failed to embed ${song.name}:`, embedError.message);
      }
    }

    // Step E: Send to Pinecone in batches
    if (vectorsToUpsert.length > 0) {
      console.log(`\nUpserting ${vectorsToUpsert.length} records to Pinecone...`);
      
      // Upserting in batches to avoid payload size errors (Pinecone limit is usually ~100-1000 items per request)
      const BATCH_SIZE = 50;
      for (let i = 0; i < vectorsToUpsert.length; i += BATCH_SIZE) {
        const batch = vectorsToUpsert.slice(i, i + BATCH_SIZE);
        await index.upsert({ records: batch }); // Pinecone needs an object with the "records" array
        console.log(`Upserted batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} records)`);
      }

      console.log("🎉 Success! All data is now securely stored in your vector database.");
    } else {
      console.log("\nNo vectors were generated. Nothing to upsert.");
    }

  } catch (error) {
    console.error("A fatal error occurred:", error);
  }
}

// Run the script
main();
