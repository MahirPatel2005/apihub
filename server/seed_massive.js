require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Api = require('./models/Api');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/api_hub';
const README_URL = 'https://raw.githubusercontent.com/public-apis/public-apis/master/README.md';

const seedMassive = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected...');

        const user = await User.findOne();
        if (!user) {
            console.error('No user found seeded. Run basic seed first or create a user.');
            process.exit(1);
        }

        console.log(`Fetching README from ${README_URL}...`);
        const res = await axios.get(README_URL);
        const readme = res.data;

        const lines = readme.split('\n');
        const entries = [];
        let currentCategory = 'Other';

        console.log('Parsing markdown...');

        for (const line of lines) {
            // Detect Category Header (### Category)
            if (line.startsWith('### ')) {
                currentCategory = line.replace('### ', '').trim();
                continue;
            }

            // Detect Table Row: | [Name](Url) | Description | Auth | ...
            // Valid row starts with | [
            if (line.trim().startsWith('| [')) {
                // Regex to extract fields
                // | [Name](Url) | Desc | Auth | HTTPS | CORS |
                const regex = /\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|\s*([^|]+)\s*\|\s*([^|]*)\s*\|\s*([^|]*)\s*\|\s*([^|]*)\s*\|/;
                const match = line.match(regex);

                if (match) {
                    const name = match[1].trim();
                    const url = match[2].trim();
                    const desc = match[3].trim();
                    const authRaw = match[4].trim();

                    // Map Auth
                    let authType = 'None';
                    const lowerAuth = authRaw.toLowerCase();
                    if (lowerAuth.includes('apikey')) authType = 'API Key';
                    else if (lowerAuth.includes('oauth')) authType = 'OAuth';
                    else if (lowerAuth.includes('token')) authType = 'Bearer Token';
                    else if (lowerAuth.includes('basic')) authType = 'Basic Auth';
                    // If empty or "No", keeps 'None'
                    // If unknown, map to API Key if simpler? Or just None?
                    // "XKCD" has "No".
                    // Some have "X-Mashape-Key".

                    entries.push({
                        owner: user._id,
                        name: name,
                        description: desc,
                        category: currentCategory,
                        baseUrl: url,
                        docsUrl: url,
                        authType: authType,
                        protocol: 'REST',
                        pricing: 'Free', // Default
                        tags: ['public-api', currentCategory.toLowerCase()],
                        status: 'Active',
                        rating: {
                            average: 3 + Math.random() * 2,
                            count: Math.floor(Math.random() * 50)
                        },
                        stats: {
                            views: Math.floor(Math.random() * 5000),
                            calls: Math.floor(Math.random() * 10000)
                        }
                    });
                }
            }
        }

        console.log(`Parsed ${entries.length} APIs from markdown.`);

        if (entries.length === 0) {
            console.error('No entries parsed. Regex might be wrong or README format changed.');
            process.exit(1);
        }

        // De-duplicate by name (some appear in multiple lists or issues)
        const uniqueEntries = [];
        const seenNames = new Set();
        for (const e of entries) {
            if (!seenNames.has(e.name) && e.name.length < 100) { // Safety check
                seenNames.add(e.name);
                uniqueEntries.push(e);
            }
        }

        console.log(`Unique APIs: ${uniqueEntries.length}`);

        // Clear existing?
        await Api.deleteMany({});
        console.log('Cleared existing APIs.');

        // Insert in chunks
        const CHUNK_SIZE = 100;
        for (let i = 0; i < uniqueEntries.length; i += CHUNK_SIZE) {
            const chunk = uniqueEntries.slice(i, i + CHUNK_SIZE);
            try {
                await Api.insertMany(chunk, { ordered: false });
                process.stdout.write('.');
            } catch (err) {
                // duplicate key error ignored
            }
        }

        console.log('\nSeeding Complete!');
        process.exit(0);

    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seedMassive();
