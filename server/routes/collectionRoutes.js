const express = require('express');
const router = express.Router();
const {
    getMyCollections,
    getCollectionById,
    createCollection,
    addApiToCollection,
    removeApiFromCollection,
    deleteCollection
} = require('../controllers/collectionController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

router.get('/:id', optionalProtect, getCollectionById);

router.get('/', protect, getMyCollections);
router.post('/', protect, createCollection);
router.post('/:id/add', protect, addApiToCollection);
router.post('/:id/remove', protect, removeApiFromCollection);
router.delete('/:id', protect, deleteCollection);

module.exports = router;
