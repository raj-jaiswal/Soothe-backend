const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
require('dotenv').config();
const chatSocket = require('./sockets/chat.socket');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Configure this to your frontend URL in production
    methods: ['GET', 'POST']
  }
});

// Initialize socket handlers
chatSocket(io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});