// server.js
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
require('dotenv').config();
const chatSocket = require('./sockets/chat.socket'); // Ensure this path is correct based on your folder structure

const PORT = process.env.PORT || 3000;
const server = http.createServer(app); // <-- 1. You created the server here

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST']
  }
});

// Initialize socket handlers
chatSocket(io);

// 🚨 CRITICAL FIX: Change 'app.listen' to 'server.listen' 🚨
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});