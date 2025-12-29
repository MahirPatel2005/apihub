const Api = require('../models/Api');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const SystemSetting = require('../models/SystemSetting');
const { sendNotification } = require('./notificationController');

// @desc    Get all pending APIs
// @route   GET /api/admin/pending
// @access  Private (Admin)
const getPendingApis = async (req, res) => {
    try {
        const apis = await Api.find({ status: 'Pending' }).populate('owner', 'username email');
        res.status(200).json(apis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve or Reject API
// @route   PUT /api/admin/apis/:id/status
// @access  Private (Admin)
const updateApiStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'Active' or 'Rejected'

        if (!['Active', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const api = await Api.findById(req.params.id);

        if (!api) {
            return res.status(404).json({ message: 'API not found' });
        }

        api.status = status;
        await api.save();

        // Audit Log
        await AuditLog.create({
            admin: req.user._id,
            action: status === 'Active' ? 'APPROVE_API' : 'REJECT_API',
            target: 'API',
            targetId: api._id,
            details: { name: api.name, owner: api.owner },
            ip: req.ip
        });

        // Send Notification
        if (status === 'Active') {
            await sendNotification(
                api.owner,
                'Approval',
                'API Approved',
                `Your API "${api.name}" has been approved and is now live.`,
                `/apis/${api._id}`
            );
        } else if (status === 'Rejected') {
            await sendNotification(
                api.owner,
                'Rejection',
                'API Rejected',
                `Your API "${api.name}" has been rejected during review.`,
                null
            );
        }

        res.status(200).json(api);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Users (with pagination & search)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const query = search ? {
            $or: [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const users = await User.find(query)
            .select('-passwordHash') // Exclude password
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.status(200).json({
            users,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update User Status (Ban, Promote, etc.)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const updateUserStatus = async (req, res) => {
    try {
        const { action } = req.body; // 'ban', 'unban', 'promote', 'demote'
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let auditAction = '';

        if (action === 'ban') {
            user.isBanned = true;
            user.status = 'suspended';
            auditAction = 'BAN_USER';
        } else if (action === 'unban') {
            user.isBanned = false;
            user.status = 'active';
            auditAction = 'UNBAN_USER';
        } else if (action === 'promote') {
            user.role = 'admin';
            auditAction = 'PROMOTE_USER';
        } else if (action === 'demote') {
            user.role = 'user';
            auditAction = 'DEMOTE_USER';
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await user.save();

        // Audit Log
        await AuditLog.create({
            admin: req.user._id,
            action: auditAction,
            target: 'User',
            targetId: user._id,
            details: { username: user.username, email: user.email },
            ip: req.ip
        });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update API Attributes (Feature, Verify, Deprecate, Soft Delete)
// @route   PUT /api/admin/apis/:id/attributes
// @access  Private (Admin)
const updateApiAttributes = async (req, res) => {
    try {
        const { attribute, value } = req.body;
        // attribute: 'isFeatured', 'isVerified', 'isDeleted', 'status' (for deprecation)
        // New attributes: 'isSponsored', 'playgroundEnabled'

        const api = await Api.findById(req.params.id);
        if (!api) return res.status(404).json({ message: 'API not found' });

        let auditAction = '';

        if (attribute === 'isFeatured') {
            api.isFeatured = value;
            auditAction = 'FEATURE_API';
        } else if (attribute === 'isVerified') {
            api.isVerified = value;
            auditAction = 'VERIFY_API';
        } else if (attribute === 'isSponsored') {
            api.isSponsored = value;
            auditAction = 'SPONSOR_API';
        } else if (attribute === 'playgroundEnabled') {
            api.playgroundEnabled = value;
            auditAction = 'TOGGLE_PLAYGROUND';
        } else if (attribute === 'isDeleted') {
            api.isDeleted = value;
            auditAction = 'DELETE_API'; // Soft delete
        } else if (attribute === 'status' && value === 'Deprecated') {
            api.status = 'Deprecated';
            api.deprecationDate = new Date();
            auditAction = 'DEPRECATE_API';
        } else {
            return res.status(400).json({ message: 'Invalid attribute update' });
        }

        await api.save();

        // Audit Log
        await AuditLog.create({
            admin: req.user._id,
            action: auditAction,
            target: 'API',
            targetId: api._id,
            details: { name: api.name, value },
            ip: req.ip
        });

        res.status(200).json(api);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAuditLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const { admin, action, target } = req.query;
        let query = {};

        if (admin) query['admin'] = admin;
        if (action) query.action = action;
        if (target) query.target = target;

        const total = await AuditLog.countDocuments(query);
        const logs = await AuditLog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('admin', 'username email');

        res.status(200).json({
            logs,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalLogs: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const getAllReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const total = await require('../models/Review').countDocuments();
        const reviews = await require('../models/Review').find({})
            .populate('user', 'username email')
            .populate('api', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            reviews,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteReview = async (req, res) => {
    try {
        const review = await require('../models/Review').findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        await review.deleteOne();

        // Log audit
        await AuditLog.create({
            admin: req.user._id,
            action: 'DELETE_REVIEW',
            target: 'REVIEW',
            targetId: req.params.id,
            details: { reviewId: req.params.id },
            ip: req.ip
        });

        res.status(200).json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get System Settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
const getSystemSettings = async (req, res) => {
    try {
        const settings = await SystemSetting.find({});
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });
        res.status(200).json(settingsMap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update System Setting
// @route   PUT /api/admin/settings
// @access  Private (Admin)
const updateSystemSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        const setting = await SystemSetting.findOneAndUpdate(
            { key },
            { value, lastUpdatedBy: req.user._id },
            { new: true, upsert: true }
        );

        await AuditLog.create({
            admin: req.user._id,
            action: 'UPDATE_SYSTEM_SETTING',
            target: 'SYSTEM',
            targetId: setting._id,
            details: { key, value },
            ip: req.ip
        });

        res.status(200).json(setting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Most Bookmarked APIs
// @route   GET /api/admin/analytics/bookmarks
// @access  Private (Admin)
const getMostBookmarkedApis = async (req, res) => {
    try {
        const apis = await Api.aggregate([
            {
                $project: {
                    name: 1,
                    owner: 1,
                    bookmarksCount: { $size: { $ifNull: ["$bookmarks", []] } },
                    category: 1,
                    isSponsored: 1
                }
            },
            { $sort: { bookmarksCount: -1 } },
            { $limit: 10 }
        ]);

        await Api.populate(apis, { path: 'owner', select: 'username' });
        res.status(200).json(apis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
};
