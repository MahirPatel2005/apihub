const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['APPROVE_API', 'REJECT_API', 'DELETE_API', 'BAN_USER', 'UNBAN_USER', 'PROMOTE_USER', 'DEMOTE_USER', 'VERIFY_API', 'FEATURE_API', 'DEPRECATE_API', 'DELETE_CONTENT', 'DISMISS_REPORT']
    },
    target: {
        type: String,
        required: true,
        enum: ['API', 'User', 'Review', 'Report']
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    ip: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
