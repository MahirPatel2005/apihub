const mongoose = require('mongoose');
const slugify = require('slugify');

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a tag name'],
        unique: true,
        trim: true,
        lowercase: true,
        maxlength: [30, 'Tag can not be more than 30 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
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

// Create tag slug from the name
tagSchema.pre('save', function (next) {
    if (this.name) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

module.exports = mongoose.model('Tag', tagSchema);
