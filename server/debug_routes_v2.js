const express = require('express');
const app = express();
const apiRouter = express.Router();

apiRouter.use((req, res, next) => {
    console.log(`[Router] Path: ${req.path}`);
    next();
});

apiRouter.get('/my/apis', (req, res) => {
    res.json({ message: 'Success: Hit /my/apis' });
});

apiRouter.get('/:id', (req, res) => {
    res.json({ message: `Success: Hit /:id with id=${req.params.id}` });
});

app.use('/api/apis', apiRouter);

const PORT = 5003;
app.listen(PORT, async () => {
    console.log(`Debug server running on ${PORT}`);

    try {
        // Native fetch in Node 18+
        const res = await fetch(`http://localhost:${PORT}/api/apis/my/apis`);
        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log(`Body: ${text}`);
        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
});
