const express = require('express');
const router = express.Router();
const { createCommunity, getCommunities, getCommunityMessages, joinCommunity } = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createCommunity);
router.get('/', protect, getCommunities);
router.get('/:id/messages', protect, getCommunityMessages);
router.put('/:id/join', protect, joinCommunity);

module.exports = router;
