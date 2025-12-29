const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    api: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Api'
    },
    review: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    },
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['API', 'Review'],
        required: true
    },
    reason: {
        type: String,
        required: true,
        enum: ['Broken', 'Misleading', 'Inappropriate', 'Spam', 'Other']
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Resolved', 'Dismissed'],
        default: 'Pending'
    },
    resolutionNote: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
