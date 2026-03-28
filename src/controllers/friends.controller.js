const friendsRepo = require('../db/friends.repo');

const search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json([]);
    
    const results = await friendsRepo.searchUsers(q, req.user.username);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFriendsList = async (req, res) => {
  try {
    const user = await friendsRepo.getUser(req.user.username);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const friendsList = await friendsRepo.getDetailedUsers(user.friends || []);
    const pendingList = await friendsRepo.getDetailedUsers(user.friendRequests || []);

    res.status(200).json({ friends: friendsList, pending: pendingList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sendRequest = async (req, res) => {
  try {
    const { receiverUsername } = req.body;
    console.log("Request Recieved for ", receiverUsername);
    await friendsRepo.sendFriendRequest(req.user.username, receiverUsername);
    res.status(200).json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const { senderUsername } = req.body;
    console.log("Accepted Request from  ", senderUsername);
    await friendsRepo.acceptFriendRequest(req.user.username, senderUsername);
    res.status(200).json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const { senderUsername } = req.body;
    await friendsRepo.rejectFriendRequest(req.user.username, senderUsername);
    res.status(200).json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { search, getFriendsList, sendRequest, acceptRequest, rejectRequest };