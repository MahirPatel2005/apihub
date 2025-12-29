const Announcement = require('../models/Announcement');

// @desc    Get active announcements
// @route   GET /api/announcements
// @access  Public (Target filtered by frontend/auth context, but public endpoint returns all active 'all' target)
const getActiveAnnouncements = async (req, res) => {
    try {
        const query = {
            isActive: true,
            $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }]
        };

        // If specific target requested (e.g. for admin dashboard fetching system alters)
        if (req.query.target) {
            query.target = req.query.target;
        }

        const announcements = await Announcement.find(query).sort({ createdAt: -1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin: Get all announcements
// @route   GET /api/admin/announcements
// @access  Private (Admin)
const getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({}).sort({ createdAt: -1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin: Create announcement
// @route   POST /api/admin/announcements
// @access  Private (Admin)
const createAnnouncement = async (req, res) => {
    try {
        const { title, message, type, target, expiresAt } = req.body;
        const announcement = await Announcement.create({
            title,
            message,
            type,
            target,
            expiresAt,
            createdBy: req.user._id
        });
        res.status(201).json(announcement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Admin: Delete/Deactivate announcement
// @route   DELETE /api/admin/announcements/:id
// @access  Private (Admin)
const deleteAnnouncement = async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Announcement removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getActiveAnnouncements,
    getAllAnnouncements,
    createAnnouncement,
    deleteAnnouncement
};
