const Report = require('../models/Report');
const User = require('../models/User');

// @desc    Create a report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
    try {
        const { apiId, reviewId, type, reason, description } = req.body;

        const report = await Report.create({
            reporter: req.user.id,
            api: apiId || undefined,
            review: reviewId || undefined,
            type,
            reason,
            description
        });

        // Notify user that report is received
        await sendNotification(
            req.user.id,
            'System',
            'Report Received',
            `We have received your report regarding ${type}. Case ID: ${report._id}. We will review it shortly.`,
            null
        );

        res.status(201).json(report);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all reports (Admin)
// @route   GET /api/reports
// @access  Private/Admin
const getReports = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};

        const reports = await Report.find(query)
            .populate('reporter', 'username')
            .populate('api', 'name')
            .populate('review')
            .sort({ createdAt: -1 });

        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update report status
// @route   PUT /api/reports/:id
// @access  Private/Admin
const { sendNotification } = require('./notificationController');

// @desc    Update report status
// @route   PUT /api/reports/:id
// @access  Private/Admin
const updateReportStatus = async (req, res) => {
    try {
        const { status, resolutionNote } = req.body;

        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status, resolutionNote },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        if (status === 'Resolved') {
            await sendNotification(
                report.reporter,
                'System',
                'Report Resolved',
                `Your report regarding ${report.type} has been resolved. Note: ${resolutionNote || 'No details provided.'}`,
                null
            );
        }

        res.status(200).json(report);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createReport,
    getReports,
    updateReportStatus
};
