const express = require('express');
const router = express.Router();
const {
    getActiveAnnouncements,
    getAllAnnouncements,
    createAnnouncement,
    deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public/User Routes
router.get('/', getActiveAnnouncements);

// Admin Routes
router.get('/admin', protect, admin, getAllAnnouncements);
router.post('/admin', protect, admin, createAnnouncement);
router.delete('/admin/:id', protect, admin, deleteAnnouncement);

module.exports = router;
