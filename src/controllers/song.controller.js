// song.controller.js
const { s3 } = require('../config/aws');
const songRepo = require('../db/songs.repo');
const userRepo = require('../db/users.repo');

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
    const songs = await songRepo.getAllSongs();
    res.status(200).json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
};

// Update your exports to include the new function
module.exports = { getSongStreamUrl, getSongMetadata, getAllSongs };