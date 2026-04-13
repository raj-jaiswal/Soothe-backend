const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/personalPlaylist.controller');
const authenticate = require('../middleware/auth.middleware');

router.post('/', authenticate, playlistController.createPlaylist);
router.get('/', authenticate, playlistController.getMyPlaylists);
router.patch('/:playlistId', authenticate, playlistController.renamePlaylist);
router.post('/:playlistId/songs', authenticate, playlistController.addSongToPlaylist);
router.delete('/:playlistId/songs/:songId', authenticate, playlistController.removeSongFromPlaylist);
router.delete('/:playlistId', authenticate, playlistController.deletePlaylist);

module.exports = router;
