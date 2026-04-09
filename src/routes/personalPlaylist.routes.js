const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/personalPlaylist.controller');
const authenticate = require('../middleware/auth.middleware');

router.post('/', authenticate, playlistController.createPlaylist);
router.get('/', authenticate, playlistController.getMyPlaylists);
router.post('/:playlistId/songs', authenticate, playlistController.addSongToPlaylist);
router.delete('/:playlistId', authenticate, playlistController.deletePlaylist);

module.exports = router;