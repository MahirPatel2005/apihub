const Api = require('../models/Api');
const User = require('../models/User');

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

        res.status(200).json(api);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
    try {
        const totalApis = await Api.countDocuments();
        const pendingApis = await Api.countDocuments({ status: 'Pending' });
        const totalUsers = await User.countDocuments();

        res.status(200).json({
            totalApis,
            pendingApis,
            totalUsers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPendingApis,
    updateApiStatus,
    getAdminStats
};
