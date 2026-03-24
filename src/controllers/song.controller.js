const { s3 } = require('../config/aws');
const songRepo = require('../db/songs.repo');

const getSongStreamUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const song = await songRepo.getSongById(id);

    if (!song) return res.status(404).json({ error: 'Song metadata not found in database' });

    // s3Key represents the exact filename path in your S3 bucket
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: song.s3Key, 
      Expires: 60 // URL valid for 60 seconds
    };

    const url = await s3.getSignedUrlPromise('getObject', params);
    
    res.status(200).json({ 
      metadata: song,
      streamUrl: url 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getSongStreamUrl };