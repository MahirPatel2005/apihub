const express = require('express');
const router = express.Router();
const { createReport, getReports, updateReportStatus } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

router.use(protect);

router.post('/', createReport);
router.get('/', admin, getReports);
router.put('/:id', admin, updateReportStatus);

module.exports = router;
