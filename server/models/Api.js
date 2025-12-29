const mongoose = require('mongoose');

const endpointSchema = new mongoose.Schema({
    method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        required: true
    },
    path: { type: String, required: true },
    description: String,
    parameters: [{
        name: String,
        paramType: String, // String, Number, Boolean, Object
        required: Boolean,
        description: String
    }]
});

const apiSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    provider: String,
    baseUrl: {
        type: String,
        required: true
    },
    authType: {
        type: String,
        enum: ['None', 'API Key', 'OAuth', 'Bearer Token', 'Basic Auth'],
        default: 'None'
    },
    protocol: {
        type: String,
        enum: ['REST', 'GraphQL', 'SOAP', 'gRPC', 'WebSocket'],
        default: 'REST'
    },
    language: {
        type: String,
        enum: ['Any', 'JavaScript', 'Python', 'Java', 'Go', 'Ruby', 'PHP', 'C#'],
        default: 'Any'
    },
    pricing: {
        type: String,
        enum: ['Free', 'Freemium', 'Paid'],
        default: 'Free'
    },
    endpoints: [endpointSchema],
    docsUrl: String,
    status: {
        type: String,
        enum: ['Pending', 'Active', 'Deprecated', 'Rejected'],
        default: 'Pending'
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isSponsored: {
        type: Boolean,
        default: false
    },
    playgroundEnabled: {
        type: Boolean,
        default: true
    },
    version: {
        type: String,
        default: '1.0.0'
    },
    changelog: [{
        version: String,
        date: { type: Date, default: Date.now },
        changes: String
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deprecationDate: {
        type: Date
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [String],
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    stats: {
        views: { type: Number, default: 0 },
        calls: { type: Number, default: 0 }
    },
    // Detailed Playground Stats
    playgroundStats: {
        totalRequests: { type: Number, default: 0 },
        totalErrors: { type: Number, default: 0 },
        avgResponseTime: { type: Number, default: 0 },
        lastUsed: { type: Date }
    },
    // Analytics for Monetization
    analytics: {
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        dailyStats: [{
            date: { type: Date },
            views: { type: Number, default: 0 },
            clicks: { type: Number, default: 0 },
            impressions: { type: Number, default: 0 }
        }]
    }
}, {
    timestamps: true
});

// Indexes for Search & Filtering
apiSchema.index({ name: 'text', description: 'text', tags: 'text' });
apiSchema.index({ category: 1, status: 1 });
apiSchema.index({ pricing: 1, status: 1 });
apiSchema.index({ 'rating.average': -1 });
apiSchema.index({ 'stats.views': -1 });
apiSchema.index({ createdAt: -1 });
apiSchema.index({ owner: 1 });

module.exports = mongoose.model('Api', apiSchema);
