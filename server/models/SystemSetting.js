const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        enum: ['MAINTENANCE_MODE', 'GLOBAL_RATE_LIMIT', 'IP_BLOCKLIST', 'ANNOUNCEMENT_BANNER', 'GLOBAL_PLAYGROUND_ENABLED']
    },
    value: {
        type: mongoose.Schema.Types.Mixed, // Can be boolean, number, string, or object
        required: true
    },
    description: String,
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
