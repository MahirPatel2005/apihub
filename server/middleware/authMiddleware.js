const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            console.log(`[AuthMiddleware] Verifying token for: ${req.originalUrl}`);

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-passwordHash');

            if (!req.user) {
                console.log('[AuthMiddleware] User not found in DB (ID from token):', decoded.id);
                return res.status(401).json({ message: 'User not found. Token invalid for this DB.' });
            }

            console.log(`[AuthMiddleware] User authenticated: ${req.user.username}`);
            next();
        } catch (error) {
            console.error('[AuthMiddleware] Error:', error.message);
            res.status(401).json({ message: 'Not authorized' });
        }
    } else {
        console.log('[AuthMiddleware] No token provided');
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
