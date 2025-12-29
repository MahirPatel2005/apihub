const Collection = require('../models/Collection');

// @desc    Get my collections
// @route   GET /api/collections
// @access  Private
const getMyCollections = async (req, res) => {
    try {
        const collections = await Collection.find({ owner: req.user.id })
            .populate('apis', 'name category rating')
            .sort({ createdAt: -1 });
        res.status(200).json(collections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single collection
// @route   GET /api/collections/:id
// @access  Public (if public) / Private (if owner)
const getCollectionById = async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.id)
            .populate('owner', 'username')
            .populate({
                path: 'apis',
                select: 'name description category rating stats pricing'
            });

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        // Check visibility
        if (!collection.isPublic && (!req.user || collection.owner._id.toString() !== req.user.id)) {
            return res.status(403).json({ message: 'Not authorized to view this collection' });
        }

        res.status(200).json(collection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create collection
// @route   POST /api/collections
// @access  Private
const createCollection = async (req, res) => {
    try {
        const { name, description, isPublic } = req.body;

        const collection = await Collection.create({
            owner: req.user.id,
            name,
            description,
            isPublic
        });

        res.status(201).json(collection);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add API to collection
// @route   POST /api/collections/:id/add
// @access  Private
const addApiToCollection = async (req, res) => {
    try {
        const { apiId } = req.body;
        const collection = await Collection.findById(req.params.id);

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        if (collection.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (collection.apis.includes(apiId)) {
            return res.status(400).json({ message: 'API already in collection' });
        }

        collection.apis.push(apiId);
        await collection.save();

        res.status(200).json(collection);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Remove API from collection
// @route   POST /api/collections/:id/remove
// @access  Private
const removeApiFromCollection = async (req, res) => {
    try {
        const { apiId } = req.body;
        const collection = await Collection.findById(req.params.id);

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        if (collection.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        collection.apis = collection.apis.filter(id => id.toString() !== apiId);
        await collection.save();

        res.status(200).json(collection);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete collection
// @route   DELETE /api/collections/:id
// @access  Private
const deleteCollection = async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.id);

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        if (collection.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await collection.deleteOne();
        res.status(200).json({ message: 'Collection removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMyCollections,
    getCollectionById,
    createCollection,
    addApiToCollection,
    removeApiFromCollection,
    deleteCollection
};
