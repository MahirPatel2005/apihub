const Notification = require('../models/Notification');

// Internal utility function
const sendNotification = async (userId, type, title, message, link) => {
    try {
        await Notification.create({
            user: userId,
            type,
            title,
            message,
            link
        });
    } catch (error) {
        console.error('Notification Error:', error);
    }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Not found' });

        if (notification.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({ message: 'All marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendNotification,
    getNotifications,
    markRead,
    markAllRead
};
