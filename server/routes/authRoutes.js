const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateUser, toggleBookmark, getBookmarks } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUser);
router.put('/bookmarks/:id', protect, toggleBookmark);
router.get('/bookmarks', protect, getBookmarks);

module.exports = router;
