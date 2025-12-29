const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    api: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Api',
        required: true
    },
    stripeSessionId: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'usd'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    durationDays: {
        type: Number,
        required: true
    },
    planType: {
        type: String, // '7-days', '30-days'
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
