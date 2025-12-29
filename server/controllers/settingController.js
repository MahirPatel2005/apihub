const SystemSetting = require('../models/SystemSetting');

// @desc    Get all system settings
// @route   GET /api/settings
// @access  Private (Admin)
const getSettings = async (req, res) => {
    try {
        const settings = await SystemSetting.find({});
        // Convert array to object for easier frontend consumption
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.status(200).json(settingsMap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a system setting
// @route   PUT /api/settings
// @access  Private (Admin)
const updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;

        if (!key || value === undefined) {
            return res.status(400).json({ message: 'Key and Value are required' });
        }

        const setting = await SystemSetting.findOneAndUpdate(
            { key },
            {
                value,
                lastUpdatedBy: req.user._id
            },
            { new: true, upsert: true } // Create if doesn't exist
        );

        res.status(200).json(setting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBanner = async (req, res) => {
    try {
        const setting = await require('../models/SystemSetting').findOne({ key: 'ANNOUNCEMENT_BANNER' });
        res.status(200).json({ banner: setting ? setting.value : '' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSettings,
    updateSetting,
    getBanner
};
