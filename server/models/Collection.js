const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    apis: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Api'
    }],
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for ensuring unique collection names per user (optional, but good practice)
collectionSchema.index({ owner: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Collection', collectionSchema);
