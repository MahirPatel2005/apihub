// Standalone debug script for routing
const express = require('express');
const app = express();

const apiRouter = express.Router();

apiRouter.use((req, res, next) => {
    console.log(`[Router] Path: ${req.path}, OriginalUrl: ${req.originalUrl}`);
    next();
});

apiRouter.get('/my/apis', (req, res) => {
    res.json({ message: 'Success: Hit /my/apis' });
});

apiRouter.get('/:id', (req, res) => {
    res.json({ message: `Success: Hit /:id with id=${req.params.id}` });
});

app.use('/api/apis', apiRouter);

const PORT = 5002;
app.listen(PORT, async () => {
    console.log(`Debug server running on ${PORT}`);

    // Self-test
    try {
        const fetch = await import('node-fetch').then(mod => mod.default || mod);
        // Fallback if node-fetch not available in env, use native fetch if node > 18
        const f = global.fetch || fetch;

        console.log('Testing /api/apis/my/apis...');
        const res = await f(`http://localhost:${PORT}/api/apis/my/apis`);
        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log(`Body: ${text}`);

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
});
