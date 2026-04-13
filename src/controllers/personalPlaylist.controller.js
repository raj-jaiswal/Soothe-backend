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

const addSongToPlaylist = async (req, res) => {
  try {
    const username = req.user.username;
    const { playlistId } = req.params;
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ error: "songId is required" });
    }

    const updated = await personalPlaylistRepo.addSongToPlaylist(
      username,
      playlistId,
      songId
    );

    res.status(200).json(updated);
  } catch (err) {
    console.error("Error adding song:", err);
    res.status(500).json({ error: "Failed to add song" });
  }
};

const renamePlaylist = async (req, res) => {
  try {
    const username = req.user.username;
    const { playlistId } = req.params;
    const { nameOfPlaylist } = req.body;
    const trimmedName = nameOfPlaylist?.trim();

    if (!playlistId) {
      return res.status(400).json({ error: "playlistId is required" });
    }

    if (!trimmedName) {
      return res.status(400).json({ error: "nameOfPlaylist is required" });
    }

    const updated = await personalPlaylistRepo.renamePersonalPlaylist(
      username,
      playlistId,
      trimmedName
    );

    return res.status(200).json(updated);
  } catch (err) {
    if (err.code === "ConditionalCheckFailedException") {
      return res.status(404).json({ error: "Playlist not found" });
    }

    console.error("Error renaming playlist:", err);
    return res.status(500).json({ error: "Failed to rename playlist" });
  }
};

const removeSongFromPlaylist = async (req, res) => {
  try {
    const username = req.user.username;
    const { playlistId, songId } = req.params;

    if (!playlistId) {
      return res.status(400).json({ error: "playlistId is required" });
    }

    if (!songId) {
      return res.status(400).json({ error: "songId is required" });
    }

    const updated = await personalPlaylistRepo.removeSongFromPlaylist(
      username,
      playlistId,
      songId
    );

    if (!updated) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    return res.status(200).json(updated);
  } catch (err) {
    console.error("Error removing song:", err);
    return res.status(500).json({ error: "Failed to remove song" });
  }
};

const deletePlaylist = async (req, res) => {
  try {
    const username = req.user.username;
    const { playlistId } = req.params;

    if (!playlistId) {
      return res.status(400).json({ error: "playlistId is required" });
    }

    const deleted = await personalPlaylistRepo.deletePersonalPlaylist(
      username,
      playlistId
    );

    return res.status(200).json(deleted);
  } catch (err) {
    console.error("Error deleting playlist:", err);
    return res.status(500).json({ error: "Failed to delete playlist" });
  }
};

module.exports = {
  createPlaylist,
  getMyPlaylists,
  addSongToPlaylist,
  renamePlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
};
