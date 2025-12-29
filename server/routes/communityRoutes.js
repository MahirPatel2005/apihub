const express = require('express');
const router = express.Router();
const {
    createCommunity,
    getCommunities,
    joinCommunity,
    getCommunityMessages
} = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createCommunity);
router.get('/', getCommunities);
router.put('/:id/join', protect, joinCommunity);
router.get('/:id/messages', protect, getCommunityMessages);

module.exports = router;
