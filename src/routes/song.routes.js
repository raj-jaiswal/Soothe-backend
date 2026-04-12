const express = require('express');
const router = express.Router();
const songController = require('../controllers/song.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/', authenticate, songController.getAllSongs);
router.get('/:id/stream', authenticate, songController.getSongStreamUrl);
router.get('/:id/metadata', authenticate, songController.getSongMetadata);
router.post('/suggest', authenticate, songController.suggestSongsByMood);

module.exports = router;