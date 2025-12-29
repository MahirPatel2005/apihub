const express = require('express');
const router = express.Router();
const { getSettings, updateSetting, getBanner } = require('../controllers/settingController');
const { protect } = require('../middleware/authMiddleware');

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

router.get('/banner', getBanner);

router.use(protect);
router.use(admin);

router.get('/', getSettings);
router.put('/', updateSetting);

module.exports = router;
