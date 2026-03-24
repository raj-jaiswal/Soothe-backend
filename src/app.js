const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const songRoutes = require('./routes/song.routes');
const userRoutes = require('./routes/user.routes');
const personalPlaylistRoutes = require('./routes/personalPlaylist.routes');
const publicPlaylistRoutes = require('./routes/publicPlaylist.routes');
const chatRoutes = require('./routes/chat.routes');

const app = express();

app.use(cors());
app.use(express.json()); // Parses JSON request bodies

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/user', userRoutes);
app.use('/api/personal-playlists', personalPlaylistRoutes);
app.use('/api/public-playlists', publicPlaylistRoutes);
app.use('/api/chats', chatRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

module.exports = app;