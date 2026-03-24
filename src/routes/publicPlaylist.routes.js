const express = require('express');
const router = express.Router();
const publicPlaylistController = require('../controllers/publicPlaylist.controller');
const authenticate = require('../middleware/auth.middleware');

// Optional: You might want to restrict POST to admins only later
router.post('/', authenticate, publicPlaylistController.createPlaylist);
router.get('/', authenticate, publicPlaylistController.getPlaylists);
router.get('/:id', authenticate, publicPlaylistController.getPlaylistById);

module.exports = router;