const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/:chatId/messages', authenticate, chatController.getChatHistory);

module.exports = router;