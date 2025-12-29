const Api = require('../models/Api');

// @desc    Generate sitemap.xml
// @route   GET /sitemap.xml
// @access  Public
const getSitemap = async (req, res) => {
    try {
        const apis = await Api.find({ status: 'Active' }).select('_id updatedAt');

        const baseUrl = 'http://localhost:5173'; // Or process.env.CLIENT_URL

        const staticPaths = [
            '',
            '/apis',
            '/categories',
            '/community',
            '/login',
            '/register'
        ];

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Add static paths
        staticPaths.forEach(path => {
            sitemap += `
    <url>
        <loc>${baseUrl}${path}</loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>`;
        });

        // Add dynamic API paths
        apis.forEach(api => {
            sitemap += `
    <url>
        <loc>${baseUrl}/apis/${api._id}</loc>
        <lastmod>${new Date(api.updatedAt).toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
    </url>`;
        });

        sitemap += `
</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating sitemap');
    }
};

module.exports = { getSitemap };
