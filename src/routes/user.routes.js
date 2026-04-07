const express = require('express');
const router = express.Router();
const multer = require('multer'); // ADD THIS
const upload = multer({ storage: multer.memoryStorage() }); // ADD THIS

const userController = require('../controllers/user.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/me', authenticate, userController.getProfile);
router.put('/me', authenticate, userController.updateProfile);
router.post('/me/profile-pic', authenticate, upload.single('profileImage'), userController.uploadProfilePicture);

module.exports = router;