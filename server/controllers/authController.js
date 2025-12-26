const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            username,
            email,
            passwordHash: hashedPassword,
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.passwordHash))) {
            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    // req.user is set by auth middleware
    const { _id, username, email, role, profile } = await User.findById(req.user.id);

    res.status(200).json({
        id: _id,
        username,
        email,
        role,
        profile
    });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { bio, website, avatar } = req.body;

        user.profile = {
            bio: bio || user.profile.bio,
            website: website || user.profile.website,
            avatar: avatar || user.profile.avatar
        };

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            profile: updatedUser.profile,
            token: generateToken(updatedUser._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle bookmark for an API
// @route   PUT /api/auth/bookmarks/:id
// @access  Private
const toggleBookmark = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const apiId = req.params.id;

        if (user.bookmarks.includes(apiId)) {
            user.bookmarks = user.bookmarks.filter(id => id.toString() !== apiId);
        } else {
            user.bookmarks.push(apiId);
        }

        await user.save();

        // Return updated bookmarks
        res.json(user.bookmarks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's bookmarked APIs
// @route   GET /api/auth/bookmarks
// @access  Private
const getBookmarks = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('bookmarks');
        res.json(user.bookmarks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateUser,
    toggleBookmark,
    getBookmarks
};

