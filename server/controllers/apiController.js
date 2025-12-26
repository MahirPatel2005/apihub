const Api = require('../models/Api');
const User = require('../models/User');

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
        }

        let apiQuery = Api.find(query);

        // Sorting
        if (sort === 'popular') {
            apiQuery = apiQuery.sort({ 'stats.views': -1 });
        } else if (sort === 'newest') {
            apiQuery = apiQuery.sort({ createdAt: -1 });
        } else if (sort === 'rating') {
            apiQuery = apiQuery.sort({ 'rating.average': -1 });
        } else {
            apiQuery = apiQuery.sort({ createdAt: -1 }); // Default new
        }

        // Pagination
        const skip = (page - 1) * limit;
        apiQuery = apiQuery.skip(skip).limit(Number(limit));

        const apis = await apiQuery.populate('owner', 'username');
        const total = await Api.countDocuments(query);

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

        // Increment view count
        if (!api.stats) {
            api.stats = { views: 0, calls: 0 };
        }
        api.stats.views += 1;
        await api.save();

        res.status(200).json(api);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        const apis = await Api.find({ owner: req.user.id });
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
    getMyApis
};
