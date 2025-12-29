const Api = require('../models/Api');
const User = require('../models/User');

const SearchLog = require('../models/SearchLog');

// @desc    Get all active APIs with filtering and pagination
// @route   GET /api/apis
// @access  Public
const getApis = async (req, res) => {
    try {
        const { category, search, sort, pricing, authType, protocol, language, page = 1, limit = 50 } = req.query;

        let query = { status: 'Active' };

        if (category && category !== 'All') {
            query.category = category;
        }

        if (pricing && pricing !== 'All') {
            query.pricing = pricing;
        }

        if (authType && authType !== 'All') {
            query.authType = authType;
        }

        if (protocol && protocol !== 'All') {
            query.protocol = protocol;
        }

        if (language && language !== 'All') {
            query.language = language;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
            // Logging will happen after count
        }

        let apiQuery = Api.find(query);

        // Sorting - Always prioritize Sponsored APIs first
        const sortCriteria = { isSponsored: -1 };

        if (sort === 'popular') {
            sortCriteria['stats.views'] = -1;
        } else if (sort === 'newest') {
            sortCriteria.createdAt = -1;
        } else if (sort === 'rating') {
            sortCriteria['rating.average'] = -1;
        } else {
            sortCriteria.createdAt = -1; // Default
        }

        apiQuery = apiQuery.sort(sortCriteria);

        // Pagination
        const pageNum = Number(page) || 1;
        const limitNum = Math.min(Number(limit) || 10, 100); // Cap limit at 100
        const skip = (pageNum - 1) * limitNum;

        const apis = await apiQuery.skip(skip).limit(limitNum).populate('owner', 'username');
        const total = await Api.countDocuments(query);

        // Custom Search Logging logic
        if (search) {
            try {
                await SearchLog.findOneAndUpdate(
                    { term: search.toLowerCase() },
                    {
                        $inc: { count: 1 },
                        lastSearched: Date.now(),
                        lastResultCount: total // Log how many results we found
                    },
                    { upsert: true }
                );
            } catch (err) {
                console.error('Error logging search:', err);
            }
        }

        res.status(200).json({
            apis,
            page: Number(page),
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single API details
// @route   GET /api/apis/:id
// @access  Public
const getApiById = async (req, res) => {
    try {
        const api = await Api.findById(req.params.id).populate('owner', 'username');

        if (!api) {
            return res.status(404).json({ message: 'API not found' });
        }

        // Increment view count (Legacy)
        if (!api.stats) {
            api.stats = { views: 0, calls: 0 };
        }
        api.stats.views += 1;

        // Monetization Analytics (Clicks)
        if (!api.analytics) {
            api.analytics = { impressions: 0, clicks: 0, dailyStats: [] };
        }
        api.analytics.clicks += 1;

        // Update Daily Stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayStatsIndex = api.analytics.dailyStats.findIndex(p => new Date(p.date).getTime() === today.getTime());

        if (todayStatsIndex > -1) {
            api.analytics.dailyStats[todayStatsIndex].clicks += 1;
        } else {
            api.analytics.dailyStats.push({
                date: today,
                clicks: 1,
                impressions: 0,
                views: 0
            });
        }

        await api.save();

        res.status(200).json(api);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Track Impressions (Batch)
// @route   POST /api/apis/track-impressions
// @access  Public
const trackImpressions = async (req, res) => {
    try {
        const { apiIds } = req.body;
        if (!apiIds || !Array.isArray(apiIds)) {
            return res.status(400).json({ message: 'Invalid data' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Bulk update for better performance
        await Api.updateMany(
            { _id: { $in: apiIds } },
            {
                $inc: { 'analytics.impressions': 1 },
                // We can't easily upsert array elements in updateMany without pipelines or multiple queries
                // For simplicity/MVP, we'll increment the global counter. 
                // Detailed daily stats for impressions might require a more complex aggregation or loop if precise daily impression accuracy is critical per API.
                // But for "views over time" charts, views/clicks are more important. "Impressions" usually just aggregate.
                // Let's try to update the daily bucket if it exists, or push if not? MongoDB update arrays is tricky in bulk.
            }
        );

        // For accurate daily charts, we iterate. It's slower but accurate.
        // Optimization: fire and forget or worker queue in prod. 
        for (const id of apiIds) {
            const api = await Api.findById(id);
            if (!api) continue;

            if (!api.analytics) api.analytics = { impressions: 0, clicks: 0, dailyStats: [] };

            const todayStatsIndex = api.analytics.dailyStats.findIndex(p => new Date(p.date).getTime() === today.getTime());
            if (todayStatsIndex > -1) {
                api.analytics.dailyStats[todayStatsIndex].impressions += 1;
            } else {
                api.analytics.dailyStats.push({
                    date: today,
                    clicks: 0,
                    impressions: 1,
                    views: 0
                });
            }
            await api.save();
        }

        res.status(200).json({ status: 'tracked' });
    } catch (error) {
        console.error('Impression Tracking Error:', error);
        res.status(500).json({ message: 'Error tracking' });
    }
};

// @desc    Submit a new API
// @route   POST /api/apis
// @access  Private
const createApi = async (req, res) => {
    try {
        const { name, description, category, baseUrl, authType, protocol, language, pricing, endpoints, docsUrl, tags } = req.body;

        const api = await Api.create({
            owner: req.user.id,
            name,
            description,
            category,
            baseUrl,
            baseUrl,
            authType,
            protocol,
            language,
            pricing,
            endpoints,
            docsUrl,
            tags,
            provider: req.user.username // Or separate field if needed
        });

        res.status(201).json(api);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update an API
// @route   PUT /api/apis/:id
// @access  Private (Owner/Admin)
const updateApi = async (req, res) => {
    try {
        const api = await Api.findById(req.params.id);

        if (!api) {
            return res.status(404).json({ message: 'API not found' });
        }

        // Check if user is owner or admin
        if (api.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedApi = await Api.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json(updatedApi);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete an API
// @route   DELETE /api/apis/:id
// @access  Private (Owner/Admin)
const deleteApi = async (req, res) => {
    try {
        const api = await Api.findById(req.params.id);

        if (!api) {
            return res.status(404).json({ message: 'API not found' });
        }

        // Check if user is owner or admin
        if (api.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await api.deleteOne();

        res.status(200).json({ message: 'API removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user's APIs
// @route   GET /api/apis/my/apis
// @access  Private
const getMyApis = async (req, res) => {
    try {
        console.log('[getMyApis] User ID:', req.user.id);
        const apis = await Api.find({ owner: req.user.id });
        console.log('[getMyApis] Found APIs:', apis.length);
        res.status(200).json(apis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getApis,
    getApiById,
    createApi,
    updateApi,
    deleteApi,
    updateApi,
    deleteApi,
    getMyApis,
    trackImpressions
};
