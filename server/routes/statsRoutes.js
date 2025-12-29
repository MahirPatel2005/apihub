const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getAdminStats, getOwnerStats } = require('../controllers/statsController');

router.get('/admin', protect, admin, getAdminStats);
router.get('/mine', protect, getOwnerStats);

module.exports = router;
