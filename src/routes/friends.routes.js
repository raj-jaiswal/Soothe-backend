const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friends.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/search', authenticate, friendsController.search);
router.get('/', authenticate, friendsController.getFriendsList);
router.post('/request', authenticate, friendsController.sendRequest);
router.post('/accept', authenticate, friendsController.acceptRequest);
router.post('/reject', authenticate, friendsController.rejectRequest);

module.exports = router;


// here's me touching the backend