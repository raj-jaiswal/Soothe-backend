const { v4: uuidv4 } = require('uuid');
const publicPlaylistRepo = require('../db/publicPlaylists.repo');

const createPlaylist = async (req, res) => {
  try {
    const { nameOfPlaylist, moods, songs, image } = req.body;
    const playlistId = uuidv4();

    const newPlaylist = await publicPlaylistRepo.createPublicPlaylist({
      playlistId,
      nameOfPlaylist,
      moods: moods || [],
      songs: songs || [],
      image,
      type: 'Public'
    });

    res.status(201).json(newPlaylist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPlaylists = async (req, res) => {
  try {
    const playlists = await publicPlaylistRepo.getAllPublicPlaylists();
    res.status(200).json(playlists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPlaylistById = async (req, res) => {
  try {
    const playlist = await publicPlaylistRepo.getPublicPlaylistById(req.params.id);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPlaylist, getPlaylists, getPlaylistById };