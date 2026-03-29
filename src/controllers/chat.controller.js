const chatRepo = require('../db/chats.repo');
const friendsRepo = require('../db/friends.repo');

const getChatHistory = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await chatRepo.getChatMessages(chatId);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserChats = async (req, res) => {
  try {
    const myUsername = req.user.username;
    const user = await friendsRepo.getUser(myUsername);
    const friendsList = user.friends || [];

    const detailedFriends = await friendsRepo.getDetailedUsers(friendsList);

    const chats = await Promise.all(detailedFriends.map(async (friend) => {
      const chatId = [myUsername, friend.id].sort().join('_');
      const latestMsg = await chatRepo.getLatestMessage(chatId);
      
      // friend.name is now guaranteed to exist by the repo mapping
      const displayName = friend.name; 

      return {
        id: chatId, 
        recipientUsername: friend.id,
        name: displayName,
        // Safely parse the display name for the avatar API
        avatar: `https://ui-avatars.com/api/?name=${displayName.replace(/\s+/g, '+')}`,
        message: latestMsg ? latestMsg.ciphertext : "Start a conversation...", 
        timestamp: latestMsg ? latestMsg.timeStamp : 0,
        unread: 0
      };
    }));

    // Sort inbox by most recent message
    chats.sort((a, b) => b.timestamp - a.timestamp);

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getChatHistory, getUserChats };