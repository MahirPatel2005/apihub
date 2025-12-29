const express = require('express');
const router = express.Router();
const { proxyRequest } = require('../controllers/proxyController');

router.post('/:id', proxyRequest);

module.exports = router;
