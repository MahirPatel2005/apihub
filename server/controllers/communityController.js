const Community = require('../models/Community');
const Message = require('../models/Message');

// @desc    Create a new community
// @route   POST /api/communities
// @access  Private
const createCommunity = async (req, res) => {
    try {
        const { name, description, icon } = req.body;

        const community = await Community.create({
            name,
            description,
            icon,
            createdBy: req.user.id,
            members: [req.user.id] // Creator is distinct first member
        });

        res.status(201).json(community);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all communities
// @route   GET /api/communities
// @access  Private
const getCommunities = async (req, res) => {
    try {
        const communities = await Community.find()
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });
        res.status(200).json(communities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get messages for a community
// @route   GET /api/communities/:id/messages
// @access  Private
const getCommunityMessages = async (req, res) => {
    try {
        const messages = await Message.find({ community: req.params.id })
            .populate('sender', 'username avatar')
            .sort({ createdAt: 1 }); // Oldest first for chat history
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join a community
// @route   PUT /api/communities/:id/join
// @access  Private
const joinCommunity = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);

        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        if (!community.members.includes(req.user.id)) {
            community.members.push(req.user.id);
            await community.save();
        }

        res.json(community);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCommunity,
    getCommunities,
    getCommunityMessages,
    joinCommunity
};
