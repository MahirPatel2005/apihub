const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema({
    term: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    count: {
        type: Number,
        default: 1
    },
    lastSearched: {
        type: Date,
        default: Date.now
    },
    lastResultCount: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('SearchLog', searchLogSchema);
