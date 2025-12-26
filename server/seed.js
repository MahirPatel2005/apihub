const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Api = require('./models/Api');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await Api.deleteMany({});
        await User.deleteMany({});

        // Create Admin User
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('password123', salt);

        const admin = await User.create({
            username: 'admin',
            email: 'admin@example.com',
            passwordHash,
            role: 'admin'
        });

        // Create Sample APIs
        const apis = [
            {
                owner: admin._id,
                name: 'OpenWeatherMap',
                description: 'Weather forecasts, nowcasts and history in a fast and elegant way',
                category: 'Utility',
                baseUrl: 'https://api.openweathermap.org/data/2.5',
                authType: 'API Key',
                pricing: 'Freemium',
                status: 'Active',
                tags: ['weather', 'forecast', 'climate'],
                endpoints: [
                    { method: 'GET', path: '/weather', description: 'Current weather data', parameters: [{ name: 'q', paramType: 'String', required: true, description: 'City name' }] }
                ],
                stats: { views: 120, calls: 50 },
                rating: { average: 4.5, count: 10 }
            },
            {
                owner: admin._id,
                name: 'CoinGecko',
                description: 'Cryptocurrency Data API',
                category: 'Finance',
                baseUrl: 'https://api.coingecko.com/api/v3',
                authType: 'None',
                pricing: 'Free',
                status: 'Active',
                tags: ['crypto', 'bitcoin', 'finance'],
                stats: { views: 300, calls: 150 },
                rating: { average: 4.8, count: 25 }
            },
            {
                owner: admin._id,
                name: 'PokeAPI',
                description: 'All the Pokémon data you\'ll ever need in one place',
                category: 'Other',
                baseUrl: 'https://pokeapi.co/api/v2',
                authType: 'None',
                pricing: 'Free',
                status: 'Active',
                tags: ['pokemon', 'game', 'fun'],
                stats: { views: 500, calls: 200 },
                rating: { average: 4.9, count: 40 }
            }
        ];

        await Api.insertMany(apis);
        console.log('Data Seeded Successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
