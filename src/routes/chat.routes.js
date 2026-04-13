const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/', authenticate, chatController.getUserChats);
router.post('/share', authenticate, chatController.shareMessage);
router.get('/:chatId/messages', authenticate, chatController.getChatHistory);

module.exports = router;