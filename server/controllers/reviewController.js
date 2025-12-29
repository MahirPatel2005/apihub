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

const { sendNotification } = require('./notificationController');

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

        // Notify API Owner
        if (api.owner.toString() !== req.user.id) {
            await sendNotification(
                api.owner,
                'Review',
                'New Review Received',
                `User ${req.user.username} posted a review on your API "${api.name}".`,
                `/apis/${api._id}`
            );
        }

        res.status(201).json(review);
    } catch (error) {
        // Check for duplicate key
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this API' });
        }
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete review
// @route   DELETE /api/apis/:apiId/reviews/:id
// @access  Private (Owner/Admin)
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check ownership or admin
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await review.deleteOne(); // Use deleteOne to trigger hooks (recalc avg rating)

        res.status(200).json({ message: 'Review removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user's reviews
// @route   GET /api/apis/my/reviews
// @access  Private
const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user.id })
            .populate('api', 'name')
            .sort('-createdAt');
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getReviews,
    addReview,
    deleteReview,
    getMyReviews
};
