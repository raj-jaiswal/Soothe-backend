const { verifyToken } = require('../utils/jwt');
const { dynamoDB } = require('../config/aws');
const { v4: uuidv4 } = require('uuid');

module.exports = (io) => {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: No token'));
    try {
      const decoded = verifyToken(token);
      socket.user = decoded; // attach user info to socket
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username}`);

    socket.on('join', ({ chatId }) => {
      socket.join(chatId);
      console.log(`${socket.user.username} joined chat: ${chatId}`);
    });

    socket.on('sendMessage', async (data) => {
      // data expects: { chatId, recipientUsername, ciphertext, iv, messageType }
      const { chatId, recipientUsername, ciphertext, iv, messageType } = data;
      const timeStamp = Date.now();
      
      const messageRecord = {
        PK: `CHAT#${chatId}`,
        SK: `MSG#${timeStamp}#${uuidv4()}`,
        chatId,
        senderUsername: socket.user.username,
        recipientUsername,
        ciphertext,
        iv,
        messageType,
        timeStamp
      };

      try {
        // 1. Persist encrypted payload to DynamoDB
        await dynamoDB.put({
          TableName: process.env.CHATS_TABLE,
          Item: messageRecord
        }).promise();

        // 2. Broadcast to everyone in the room (including sender to confirm)
        io.to(chatId).emit('receiveMessage', messageRecord);
      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username}`);
    });
  });
};