const express = require('express');
const router = express.Router();
const { proxyRequest } = require('../controllers/proxyController');

// Express 5 compatibility: Use array for optional params instead of :id?
router.post(['/', '/:id'], proxyRequest);

module.exports = router;
