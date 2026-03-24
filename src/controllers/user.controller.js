const userRepo = require('../db/users.repo');

const getProfile = async (req, res) => {
  try {
    const user = await userRepo.getUserByUsername(req.user.username);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Strip out sensitive auth data before sending back to client
    delete user.passwordHash;
    delete user.otpHash;
    delete user.otpExpiresAt;

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const username = req.user.username;
    // Extract only fields we allow updating
    const { name, bio, age, profileImage, preferPrivacy, showOnline } = req.body;
    
    // Clean up undefined fields
    const updates = JSON.parse(JSON.stringify({ name, bio, age, profileImage, preferPrivacy, showOnline }));
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const updatedUser = await userRepo.updateUserStatus(username, updates);
    res.status(200).json({ message: 'Profile updated', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getProfile, updateProfile };