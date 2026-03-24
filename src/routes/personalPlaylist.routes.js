const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/personalPlaylist.controller');
const authenticate = require('../middleware/auth.middleware');

router.post('/', authenticate, playlistController.createPlaylist);
router.get('/', authenticate, playlistController.getMyPlaylists);

module.exports = router;