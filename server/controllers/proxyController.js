const axios = require('axios');
const Api = require('../models/Api');

// @desc    Proxy API requests
// @route   POST /api/proxy/:id
// @access  Public (or Private if you want to limit usage)
const proxyRequest = async (req, res) => {
    try {
        const { method, path, headers, body, params } = req.body;
        const api = await Api.findById(req.params.id);

        if (!api) {
            return res.status(404).json({ message: 'API not found' });
        }

        // Increment calls count
        if (!api.stats) {
            api.stats = { views: 0, calls: 0 };
        }
        api.stats.calls += 1;
        await api.save();

        const url = `${api.baseUrl}${path}`;

        const response = await axios({
            method,
            url,
            headers,
            data: body,
            params
        });

        res.status(response.status).json(response.data);

    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = {
    proxyRequest
};
