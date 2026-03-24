const { v4: uuidv4 } = require('uuid');
const personalPlaylistRepo = require('../db/personalPlaylists.repo');

const createPlaylist = async (req, res) => {
  try {
    const username = req.user.username;
    const { nameOfPlaylist, moods, songs } = req.body;
    const playlistId = uuidv4();

    const newPlaylist = await personalPlaylistRepo.createPersonalPlaylist(username, {
      playlistId,
      nameOfPlaylist,
      moods: moods || [],
      songs: songs || [],
      type: 'Personal'
    });

    res.status(201).json(newPlaylist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyPlaylists = async (req, res) => {
  try {
    const playlists = await personalPlaylistRepo.getPersonalPlaylists(req.user.username);
    res.status(200).json(playlists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPlaylist, getMyPlaylists };