const mongoose = require('mongoose');
const Api = require('../models/Api');
const User = require('../models/User');
const Review = require('../models/Review');
const Report = require('../models/Report');
const SearchLog = require('../models/SearchLog');

// @desc    Get Admin Analytics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalApis = await Api.countDocuments();
        const totalReviews = await Review.countDocuments();
        const totalReports = await Report.countDocuments({ status: 'Pending' });

        // Growth: APIs created in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newApis = await Api.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

        // Top Searches
        const topSearches = await SearchLog.find().sort({ count: -1 }).limit(10);

        // Broken APIs (Active but have pending reports)
        // This is a simplified check. Real "broken" logic might be complex.
        const brokenApis = await Report.distinct('api', { status: 'Pending', type: 'API' });

        res.status(200).json({
            counts: {
                users: totalUsers,
                apis: totalApis,
                reviews: totalReviews,
                reports: totalReports,
                newApisLast30Days: newApis,
                brokenApiCount: brokenApis.length
            },
            topSearches
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Owner Analytics
// @route   GET /api/stats/mine
// @access  Private
const getOwnerStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Aggregate stats across all APIs owned by user
        const stats = await Api.aggregate([
            { $match: { owner: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: '$stats.views' },
                    totalCalls: { $sum: '$stats.calls' },
                    avgRating: { $avg: '$rating.average' },
                    totalApis: { $sum: 1 }
                }
            }
        ]);

        // Get views per API for chart
        const apiPerformance = await Api.find({ owner: userId })
            .select('name stats rating')
            .sort({ 'stats.views': -1 });

        const result = stats[0] || { totalViews: 0, totalCalls: 0, avgRating: 0, totalApis: 0 };

        res.status(200).json({
            summary: result,
            details: apiPerformance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = { getAdminStats, getOwnerStats };
