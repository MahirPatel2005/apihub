const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/emailService');
const { verifyEmailTemplate, resetPasswordTemplate } = require('../utils/emailTemplates');

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

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate Verification Token
        const verificationToken = crypto.randomBytes(20).toString('hex');
        const verificationTokenHash = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');

        const user = await User.create({
            username,
            email,
            passwordHash: hashedPassword,
            verificationToken: verificationTokenHash,
            isVerified: false
        });

        if (user) {
            // Send Verification Email
            const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
            const message = `Please verify your email by clicking the link: ${verificationUrl}`;

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Welcome to API Hub! Verify your Email',
                    message, // Fallback text
                    html: verifyEmailTemplate(user.username, verificationUrl)
                });
            } catch (emailError) {
                console.error('Verification Email Failed:', emailError);
                // Don't fail registration if email fails (for MVP resilience)
            }

            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                token: generateToken(user.id),
                message: 'Registration successful. Please check your email to verify your account.'
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

// @desc    Verify Email
// @route   PUT /api/auth/verifyemail/:token
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const verificationToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({ verificationToken });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ success: true, data: 'Email Verified' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ message: 'There is no user with that email' });
        }

        // Get Reset Token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire (10 mins)
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Create reset url
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request',
                message, // Fallback text
                html: resetPasswordTemplate(user.username, resetUrl)
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.error(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(201).json({
            success: true,
            data: 'Password Updated Success',
            token: generateToken(user.id)
        });
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
    getBookmarks,
    verifyEmail,
    forgotPassword,
    resetPassword
};

