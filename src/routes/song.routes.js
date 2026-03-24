const express = require('express');
const router = express.Router();
const songController = require('../controllers/song.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/stream/:id', authenticate, songController.getSongStreamUrl);

module.exports = router;