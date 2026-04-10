const friendsRepo = require('../db/friends.repo');
const userRepo = require('../db/users.repo'); // <-- 1. Import userRepo

// Helper function to attach full profiles to a list of friends
const attachUserProfiles = async (usersList) => {
  return await Promise.all(
    usersList.map(async (user) => {
      // user.id is typically the username in your setup
      const profile = await userRepo.getUserByUsername(user.id);
      
      return {
        ...user,
        // Override name with fullname if it exists, otherwise fallback
        name: (profile && profile.fullname) ? profile.fullname : user.name,
        // Grab the profile image
        profileImage: profile ? profile.profileImage : null,
      };
    })
  );
};

const search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json([]);
    
    // Fetch raw results from friendsRepo
    const rawResults = await friendsRepo.searchUsers(q, req.user.username);
    
    // Attach profile images and fullnames
    const enrichedResults = await attachUserProfiles(rawResults);

    res.status(200).json(enrichedResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFriendsList = async (req, res) => {
  try {
    const user = await friendsRepo.getUser(req.user.username);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fetch the base details from friendsRepo
    const rawFriendsList = await friendsRepo.getDetailedUsers(user.friends || []);
    const rawPendingList = await friendsRepo.getDetailedUsers(user.friendRequests || []);

    // Attach profile images and fullnames to both arrays
    const friendsList = await attachUserProfiles(rawFriendsList);
    const pendingList = await attachUserProfiles(rawPendingList);

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