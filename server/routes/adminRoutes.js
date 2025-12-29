const express = require('express');
const router = express.Router();
const {
    getPendingApis,
    updateApiStatus,
    getUsers,
    updateUserStatus,
    updateApiAttributes,
    getAuditLogs,
    getAllReviews,
    deleteReview,
    getSystemSettings,
    updateSystemSetting,
    getMostBookmarkedApis
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

// Middleware to check for admin role
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

router.use(protect);
router.use(admin);

// API Management
router.get('/pending', getPendingApis);
router.put('/apis/:id/status', updateApiStatus); // Approve/Reject
router.put('/apis/:id/attributes', updateApiAttributes); // Feature, Verify, Deprecate, Delete

// User Management
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus); // Ban, Promote, etc.

// Audit Logs
router.get('/logs', getAuditLogs);

// Review Moderation
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

// System Settings
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSetting);

// Analytics
router.get('/analytics/bookmarks', getMostBookmarkedApis);

module.exports = router;
