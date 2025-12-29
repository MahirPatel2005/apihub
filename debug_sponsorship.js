const mongoose = require('mongoose');
const Api = require('./server/models/Api');
const User = require('./server/models/User');
require('dotenv').config({ path: './server/.env' });

const checkSponsorship = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const apis = await Api.find({});
        console.log(`Found ${apis.length} APIs.`);

        let sponsoredCount = 0;
        for (const api of apis) {
            console.log(`API: ${api.name} | Sponsored: ${api.isSponsored} | SponsoredUntil: ${api.sponsoredUntil}`);
            if (api.isSponsored) sponsoredCount++;
        }

        if (sponsoredCount === 0 && apis.length > 0) {
            console.log('No sponsored APIs found. Sponsoring the first one for testing...');
            const firstApi = apis[0];
            firstApi.isSponsored = true;
            firstApi.sponsoredUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

            // Initializing analytics if missing
            if (!firstApi.analytics) {
                firstApi.analytics = {
                    impressions: 10,
                    clicks: 5,
                    dailyStats: [
                        { date: new Date(), impressions: 10, clicks: 5, views: 15 }
                    ]
                };
            }

            await firstApi.save();
            console.log(`Successfully sponsored API: ${firstApi.name}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

checkSponsorship();
