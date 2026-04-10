const userRepo = require('../db/users.repo');
const { s3 } = require('../config/aws');

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
    const { fullname, bio, age, profileImage, preferPrivacy, showOnline } = req.body;

    const updates = JSON.parse(
      JSON.stringify({ fullname, bio, age, profileImage, preferPrivacy, showOnline }),
    );

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const updatedUser = await userRepo.updateUserStatus(username, updates);
    res.status(200).json({ message: 'Profile updated', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    const username = req.user.username;
    const file = req.file; // Multer puts the file here

    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const bucket = process.env.PROFILE_PIC_BUCKET || process.env.S3_BUCKET;
    if (!bucket) return res.status(500).json({ error: 'Profile picture bucket is not configured' });

    // Extract extension safely from the original filename
    const extension = file.originalname.split('.').pop().toLowerCase();
    const fileExtension = extension === 'jpg' ? 'jpeg' : extension;
    const s3Key = `profile-pic/${username}/${Date.now()}.${fileExtension}`;

    await s3.upload({
      Bucket: bucket,
      Key: s3Key,
      Body: file.buffer, // Raw buffer, no Base64 decoding needed!
      ContentType: file.mimetype,
    }).promise();

    const profileImageUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    
    await userRepo.updateUserStatus(username, { profileImage: profileImageUrl });

    res.status(200).json({ profileImage: profileImageUrl });
  } catch (error) {
    console.error('[Profile Upload] Error:', error.message, error.stack);
    res.status(500).json({ error: error.message || 'Unable to upload profile picture' });
  }
};
const getHistory = async (req, res) => {
  try {
    const history = await userRepo.getUserHistory(req.user.username);
    res.status(200).json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTopSongs = async (req, res) => {
  try {
    const data = await userRepo.getUserTopSongs(req.user.username);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getProfile, updateProfile, uploadProfilePicture, getHistory, getTopSongs };