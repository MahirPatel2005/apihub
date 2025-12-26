const express = require('express');
const router = express.Router();
const { getPendingApis, updateApiStatus, getAdminStats } = require('../controllers/adminController');
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

router.get('/pending', getPendingApis);
router.put('/apis/:id/status', updateApiStatus);
router.get('/stats', getAdminStats);

module.exports = router;
