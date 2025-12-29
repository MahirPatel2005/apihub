const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    count: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create category slug from the name
categorySchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

module.exports = mongoose.model('Category', categorySchema);
