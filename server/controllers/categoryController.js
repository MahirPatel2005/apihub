const Category = require('../models/Category');
const Tag = require('../models/Tag');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isBlocked: false }).sort({ name: 1 });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
const getTags = async (req, res) => {
    try {
        const tags = await Tag.find({ isBlocked: false }).sort({ count: -1 }).limit(50);
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin: Get all categories (including blocked)
// @route   GET /api/admin/categories
// @access  Private (Admin)
const getAdminCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ name: 1 });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin: Create category
// @route   POST /api/admin/categories
// @access  Private (Admin)
const createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Admin: Update Category (Block/Rename)
// @route   PUT /api/admin/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Admin: Delete Category
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        await category.deleteOne();
        res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tag Management (Simpler for now)
const getAdminTags = async (req, res) => {
    try {
        const tags = await Tag.find({}).sort({ count: -1 });
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTag = async (req, res) => {
    try {
        const tag = await Tag.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(tag);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteTag = async (req, res) => {
    try {
        await Tag.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Tag deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin: Merge Tags
// @route   POST /api/admin/tags/merge
// @access  Private (Admin)
const mergeTags = async (req, res) => {
    try {
        const { originalTag, targetTag } = req.body;
        const Api = require('../models/Api');

        if (!originalTag || !targetTag) {
            return res.status(400).json({ message: 'Both originalTag and targetTag are required' });
        }

        // 1. Find all APIs with the original tag
        const apis = await Api.find({ tags: originalTag });

        let updatedCount = 0;

        for (const api of apis) {
            let tags = api.tags || [];

            // Remove original tag
            tags = tags.filter(t => t !== originalTag);

            // Add target tag if not present
            if (!tags.includes(targetTag)) {
                tags.push(targetTag);
            }

            api.tags = tags;
            await api.save();
            updatedCount++;
        }

        // 2. Remove original tag from Tags collection if exists
        await Tag.findOneAndDelete({ name: originalTag });

        // 3. Upsert target tag count
        const targetTagDoc = await Tag.findOne({ name: targetTag });
        if (targetTagDoc) {
            // Recalculate count? simplistically just increment or leave for a recount job
            // Ideally we should recount but for now let's just ensure it exists
        } else {
            await Tag.create({ name: targetTag, count: updatedCount });
        }

        res.status(200).json({ message: `Merged ${originalTag} into ${targetTag}`, updatedApis: updatedCount });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin: Merge Categories
// @route   POST /api/admin/categories/merge
// @access  Private (Admin)
const mergeCategories = async (req, res) => {
    try {
        const { originalCategoryId, targetCategoryId } = req.body;
        const Api = require('../models/Api');

        if (!originalCategoryId || !targetCategoryId) {
            return res.status(400).json({ message: 'Both originalCategoryId and targetCategoryId are required' });
        }

        if (originalCategoryId === targetCategoryId) {
            return res.status(400).json({ message: 'Cannot merge a category into itself' });
        }

        const originalCategory = await Category.findById(originalCategoryId);
        const targetCategory = await Category.findById(targetCategoryId);

        if (!originalCategory || !targetCategory) {
            return res.status(404).json({ message: 'One or both categories not found' });
        }

        // 1. Update all APIs with the original category to the target category
        // Storing category as string name in Api model currently
        const updateResult = await Api.updateMany(
            { category: originalCategory.name },
            { category: targetCategory.name }
        );

        // 2. Delete the original category
        await originalCategory.deleteOne();

        // 3. Update count for target category (optional, if we track counts on category model)
        // Recalculating counts might be good
        const newCount = await Api.countDocuments({ category: targetCategory.name });
        targetCategory.count = newCount;
        await targetCategory.save();

        res.status(200).json({
            message: `Merged '${originalCategory.name}' into '${targetCategory.name}'`,
            updatedApis: updateResult.modifiedCount
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
};
