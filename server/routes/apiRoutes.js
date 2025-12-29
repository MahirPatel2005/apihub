const express = require('express');
const router = express.Router();
const { getApis, getApiById, createApi, updateApi, deleteApi, getMyApis, trackImpressions } = require('../controllers/apiController');
const { getMyReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

console.log('Controller Checks:', {
    getApis: typeof getApis,
    getMyApis: typeof getMyApis,
    protect: typeof protect
});

router.use((req, res, next) => {
    console.log(`[ApiRoutes] Hit: ${req.method} ${req.path}`);
    next();
});

// Public
router.get('/', getApis);
router.post('/track-impressions', trackImpressions);

// Protected - specific routes
router.get('/my/apis', protect, getMyApis);
router.get('/my/reviews', protect, getMyReviews);

// Generic ID routes (must be after specific routes)
router.get('/:id', getApiById);
router.post('/', protect, createApi);
router.put('/:id', protect, updateApi);
router.delete('/:id', protect, deleteApi);

// Re-route into other resource routers
const reviewRouter = require('./reviewRoutes');
router.use('/:apiId/reviews', reviewRouter);

module.exports = router;
