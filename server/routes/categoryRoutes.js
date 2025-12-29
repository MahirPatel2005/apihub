const express = require('express');
const router = express.Router();
const {
    getCategories,
    getTags,
    getAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getAdminTags,
    updateTag,
    deleteTag,
    mergeTags,
    mergeCategories
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

// Public Routes
router.get('/categories', getCategories);
router.get('/tags', getTags);

// Admin Routes
router.use(protect);
router.use(admin);

// Categories
router.get('/admin/categories', getAdminCategories);
router.post('/admin/categories', createCategory);
router.post('/admin/categories/merge', mergeCategories);
router.put('/admin/categories/:id', updateCategory);
router.delete('/admin/categories/:id', deleteCategory);

// Tags
router.get('/admin/tags', getAdminTags);
router.post('/admin/tags/merge', mergeTags);
router.put('/admin/tags/:id', updateTag);
router.delete('/admin/tags/:id', deleteTag);

module.exports = router;
