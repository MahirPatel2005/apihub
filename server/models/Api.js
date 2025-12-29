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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Api', apiSchema);
