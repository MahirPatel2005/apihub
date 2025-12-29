const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    message: {
        type: String,
        required: [true, 'Please add a message'],
        maxlength: [500, 'Message cannot be more than 500 characters']
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'error', 'success'],
        default: 'info'
    },
    target: {
        type: String,
        enum: ['all', 'admins', 'owners'],
        default: 'all'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Auto-expire announcements
announcementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Announcement', announcementSchema);
