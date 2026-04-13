const chatRepo = require('../db/chats.repo');
const friendsRepo = require('../db/friends.repo');
const userRepo = require('../db/users.repo'); // <-- 1. Import userRepo here

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
      
      // <-- 2. Fetch the full user profile from the users collection
      const friendProfile = await userRepo.getUserByUsername(friend.id);

      // Extract the fullname, falling back to their ID if missing
      const displayName = (friendProfile && friendProfile.fullname) ? friendProfile.fullname : friend.id; 

      return {
        id: chatId, 
        recipientUsername: friend.id,
        name: displayName,
        // <-- 3. Grab the profileImage directly from the user profile
        profileImage: friendProfile ? friendProfile.profileImage : null,
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

const shareMessage = async (req, res) => {
  try {
    const senderUsername = req.user.username;
    const { recipientUsername, ciphertext, iv, messageType } = req.body;

    if (!recipientUsername) {
      return res.status(400).json({ error: "recipientUsername is required" });
    }

    if (!ciphertext) {
      return res.status(400).json({ error: "ciphertext is required" });
    }

    const user = await friendsRepo.getUser(senderUsername);
    const friendsList = user?.friends || [];

    if (!friendsList.includes(recipientUsername)) {
      return res.status(403).json({ error: "You can only share with friends" });
    }

    const chatId = [senderUsername, recipientUsername].sort().join('_');
    const message = await chatRepo.saveMessage({
      chatId,
      senderUsername,
      recipientUsername,
      ciphertext,
      iv: iv || "default",
      messageType: messageType || "text",
    });

    return res.status(201).json(message);
  } catch (error) {
    console.error("Error sharing message:", error);
    return res.status(500).json({ error: "Failed to share message" });
  }
};

module.exports = { getChatHistory, getUserChats, shareMessage };
