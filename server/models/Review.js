const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    api: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Api',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent user from submitting multiple reviews for same API
reviewSchema.index({ api: 1, user: 1 }, { unique: true });

// Static method to calculate avg rating
reviewSchema.statics.getAverageRating = async function (apiId) {
    const obj = await this.aggregate([
        {
            $match: { api: apiId }
        },
        {
            $group: {
                _id: '$api',
                averageRating: { $avg: '$rating' },
                count: { $sum: 1 }
            }
        }
    ]);

    try {
        if (obj[0]) {
            await this.model('Api').findByIdAndUpdate(apiId, {
                rating: {
                    average: Math.round(obj[0].averageRating * 10) / 10,
                    count: obj[0].count
                }
            });
        } else {
            await this.model('Api').findByIdAndUpdate(apiId, {
                rating: {
                    average: 0,
                    count: 0
                }
            });
        }
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
reviewSchema.post('save', function () {
    this.constructor.getAverageRating(this.api);
});

// Call getAverageRating before remove
reviewSchema.pre('remove', function () {
    this.constructor.getAverageRating(this.api);
});

module.exports = mongoose.model('Review', reviewSchema);
