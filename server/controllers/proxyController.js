const axios = require('axios');
const Api = require('../models/Api');
const SystemSetting = require('../models/SystemSetting');

// @desc    Proxy request to external API
// @route   POST /api/proxy/:id?
// @access  Public (for now, can be restricted later)
const proxyRequest = async (req, res) => {
    const { method, url, headers, body, apiId } = req.body;
    const { id } = req.params; // Support both body and param

    // 0. Resolve API ID and validate URL
    const targetApiId = id || apiId;
    if (!url) return res.status(400).json({ message: 'URL is required' });

    let apiDoc = null;
    if (targetApiId) {
        try {
            apiDoc = await Api.findById(targetApiId);

            // 0.5 Check Global Playground Setting
            const globalSetting = await SystemSetting.findOne({ key: 'GLOBAL_PLAYGROUND_ENABLED' });
            if (globalSetting && globalSetting.value === false) {
                return res.status(403).json({
                    message: 'API Playground is currently disabled globally for maintenance.'
                });
            }

            // 1. Enforce Playground Toggle
            if (apiDoc && apiDoc.playgroundEnabled === false) {
                // Check if user is admin or owner to bypass (optional, for now just strict block)
                // For simplicity Phase 1: Block all calls if disabled.
                return res.status(403).json({
                    message: 'Playground access is disabled for this API by the owner.'
                });
            }

            // 1.5 Security: Strip sensitive headers (Basic Auth, Cookies) if strictly needed
            // If headers are passed from client, use those, but maybe filter restricted ones.
            // For now, we trust the client's explicit headers but ensure we don't leak server envs.

        } catch (err) {
            console.error('Error fetching API for proxy:', err);
        }
    }

    const start = Date.now();
    let response;
    let errorObj = null;

    try {
        response = await axios({
            method: method || 'GET',
            url,
            headers: headers || {},
            data: body || undefined,
            validateStatus: () => true
        });
    } catch (error) {
        errorObj = error;
    }

    const duration = Date.now() - start;

    // 2. Update Stats (Async)
    if (apiDoc) {
        try {
            const isError = errorObj || (response && response.status >= 400);

            // Calculate new average response time
            // Old Avg * Count + New Duration / New Count
            // Simplified: store total duration and count, calculate avg on read? 
            // Or running average: avg = avg + (new - avg) / count
            // Let's rely on atomic $inc for totals and handle avg mathematically or just simple approximation.
            // For rigorous avg, we need previous count. 
            // Simplest: $inc totalRequests, $inc totalErrors (if err), $set lastUsed.
            // Avg calculation requires knowing previous state -> concurrency issue.
            // Let's just track the raw totals + last duration? 
            // Or: just update basic stats now, improve avg algorithm later.
            // Let's just do: totalRequests++, totalErrors++, lastUsed, and 'stats.calls'++

            const updateOps = {
                $inc: {
                    'stats.calls': 1,
                    'playgroundStats.totalRequests': 1
                },
                $set: {
                    'playgroundStats.lastUsed': new Date()
                }
            };

            if (isError) {
                updateOps.$inc['playgroundStats.totalErrors'] = 1;
            }

            // Naive Avg Response Time Update (Weighted)
            // If we have access to current document state (apiDoc)
            const currentCount = apiDoc.playgroundStats?.totalRequests || 0;
            const currentAvg = apiDoc.playgroundStats?.avgResponseTime || 0;
            const newCount = currentCount + 1;
            const newAvg = Math.round(((currentAvg * currentCount) + duration) / newCount);

            updateOps.$set['playgroundStats.avgResponseTime'] = newAvg;

            await Api.findByIdAndUpdate(targetApiId, updateOps);
        } catch (err) {
            console.error('Error updating proxy stats:', err);
        }
    }

    if (errorObj) {
        console.error('Proxy Network Error:', errorObj.message);
        return res.status(502).json({
            status: 502,
            statusText: 'Bad Gateway',
            data: { message: errorObj.message, code: errorObj.code },
            duration
        });
    }

    res.status(200).json({
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
        duration,
        size: JSON.stringify(response.data).length
    });
};

module.exports = { proxyRequest };
