const chatRepo = require('../db/chats.repo');

const getChatHistory = async (req, res) => {
  try {
    const { chatId } = req.params;
    // In a production app, you would verify that req.user.username is a participant in this chatId
    const messages = await chatRepo.getChatMessages(chatId);
    
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getChatHistory };