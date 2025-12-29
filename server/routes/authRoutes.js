const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    updateUser,
    toggleBookmark,
    getBookmarks,
    verifyEmail,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUser);
router.put('/bookmarks/:id', protect, toggleBookmark);
router.get('/bookmarks', protect, getBookmarks);

router.put('/verifyemail/:token', verifyEmail);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);

module.exports = router;
