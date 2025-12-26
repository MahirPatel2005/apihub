const Review = require('../models/Review');
const Api = require('../models/Api');

// @desc    Get reviews for an API
// @route   GET /api/apis/:apiId/reviews
// @access  Public
const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ api: req.params.apiId })
            .populate('user', 'username')
            .sort('-createdAt');

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add review
// @route   POST /api/apis/:apiId/reviews
// @access  Private
const addReview = async (req, res) => {
    try {
        req.body.api = req.params.apiId;
        req.body.user = req.user.id;

        const api = await Api.findById(req.params.apiId);

        if (!api) {
            return res.status(404).json({ message: 'API not found' });
        }

        const review = await Review.create(req.body);

        res.status(201).json(review);
    } catch (error) {
        // Check for duplicate key
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this API' });
        }
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getReviews,
    addReview
};
