const bcrypt = require('bcrypt');
const userRepo = require('../db/users.repo');
const { sendOTP } = require('../config/mail');
const { generateToken } = require('../utils/jwt');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const signup = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    const existingUser = await userRepo.getUserByUsername(username);
    if (existingUser) return res.status(400).json({ error: 'Username taken' });

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

    await userRepo.createUser({
      username,
      email,
      passwordHash,
      otpHash,
      otpExpiresAt,
      isVerified: false,
      friends: [],
      songHistory: []
    });

    await sendOTP(email, otp);
    res.status(201).json({ message: 'User created. Please verify OTP sent to email.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { username, otp } = req.body;
    const user = await userRepo.getUserByUsername(username);

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isVerified) return res.status(400).json({ error: 'Already verified' });
    if (Date.now() > user.otpExpiresAt) return res.status(400).json({ error: 'OTP expired' });

    const isValid = await bcrypt.compare(otp, user.otpHash);
    if (!isValid) return res.status(400).json({ error: 'Invalid OTP' });

    await userRepo.updateUserStatus(username, { isVerified: true, otpHash: null });
    
    const token = generateToken(user);
    res.status(200).json({ message: 'Verified successfully', token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userRepo.getUserByUsername(username);

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.isVerified) return res.status(403).json({ error: 'Please verify email first' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { signup, verifyOtp, login };