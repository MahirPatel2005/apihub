const mongoose = require('mongoose');
const Api = require('./models/Api');
const User = require('./models/User');
require('dotenv').config();

const checkSponsorship = async () => {
    try {
        console.log('Connecting to DB at:', process.env.MONGO_URI);
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
            if (!firstApi.analytics || !firstApi.analytics.dailyStats) {
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
        } else if (sponsoredCount > 0) {
            console.log('Sponsored APIs already exist.');
            const sponsoredApi = apis.find(a => a.isSponsored);
            if (sponsoredApi && (!sponsoredApi.analytics || !sponsoredApi.analytics.dailyStats || sponsoredApi.analytics.dailyStats.length === 0)) {
                console.log('Adding dummy analytics to sponsored API...');
                sponsoredApi.analytics = {
                    impressions: 120,
                    clicks: 45,
                    dailyStats: [
                        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), impressions: 50, clicks: 10, views: 60 },
                        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), impressions: 80, clicks: 25, views: 100 },
                        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), impressions: 120, clicks: 45, views: 150 },
                        { date: new Date(), impressions: 10, clicks: 5, views: 15 }
                    ]
                };
                await sponsoredApi.save();
                console.log('Dummy analytics added.');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

checkSponsorship();
