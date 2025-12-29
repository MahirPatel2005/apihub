const express = require('express');
const router = express.Router();
const { createCheckoutSession, verifySession } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/verify-session', protect, verifySession);

module.exports = router;
