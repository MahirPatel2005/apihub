const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Api = require('./models/Api');
const User = require('./models/User');

dotenv.config();

const realApis = [
    {
        name: 'OpenAI',
        description: 'Access state-of-the-art AI models like GPT-4 and DALL-E directly from your application. Generate text, images, and code with simple API calls.',
        category: 'Utility',
        provider: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        authType: 'Bearer Token',
        protocol: 'REST',
        pricing: 'Paid',
        language: 'Python', // Dominant sdk
        docsUrl: 'https://platform.openai.com/docs/api-reference',
        status: 'Active',
        tags: ['ai', 'ml', 'gpt', 'nlp'],
        endpoints: [
            {
                method: 'POST',
                path: '/chat/completions',
                description: 'Creates a model response for the given chat conversation.',
                parameters: [
                    { name: 'model', paramType: 'String', required: true, description: 'ID of the model to use (e.g. gpt-4)' },
                    { name: 'messages', paramType: 'Object', required: true, description: 'A list of messages comprising the conversation' }
                ]
            },
            {
                method: 'POST',
                path: '/images/generations',
                description: 'Creates an image given a prompt.',
                parameters: [
                    { name: 'prompt', paramType: 'String', required: true, description: 'A text description of the desired image' },
                    { name: 'n', paramType: 'Number', required: false, description: 'The number of images to generate' }
                ]
            }
        ]
    },
    {
        name: 'Stripe',
        description: 'The standard for online payments. Accept credit cards, manage subscriptions, and send payouts with a developer-first API.',
        category: 'Finance',
        provider: 'Stripe',
        baseUrl: 'https://api.stripe.com/v1',
        authType: 'Bearer Token',
        protocol: 'REST',
        pricing: 'Paid',
        language: 'JavaScript',
        docsUrl: 'https://stripe.com/docs/api',
        status: 'Active',
        tags: ['payments', 'finance', 'subscription'],
        endpoints: [
            {
                method: 'POST',
                path: '/charges',
                description: 'To charge a credit card or other payment source, you create a Charge object.',
                parameters: [
                    { name: 'amount', paramType: 'Number', required: true, description: 'Amount in cents' },
                    { name: 'currency', paramType: 'String', required: true, description: 'Three-letter ISO currency code' },
                    { name: 'source', paramType: 'String', required: true, description: 'A payment source to be charged' }
                ]
            },
            {
                method: 'GET',
                path: '/balance',
                description: 'Retrieves the current account balance.',
                parameters: []
            }
        ]
    },
    {
        name: 'Spotify Web API',
        description: 'Get metadata about artists, albums, and tracks, and manage user libraries and playlists.',
        category: 'Social',
        provider: 'Spotify',
        baseUrl: 'https://api.spotify.com/v1',
        authType: 'OAuth',
        protocol: 'REST',
        pricing: 'Freemium',
        language: 'JavaScript',
        docsUrl: 'https://developer.spotify.com/documentation/web-api',
        status: 'Active',
        tags: ['music', 'streaming', 'audio'],
        endpoints: [
            {
                method: 'GET',
                path: '/me',
                description: 'Get detailed profile information about the current user.',
                parameters: []
            },
            {
                method: 'GET',
                path: '/search',
                description: 'Get Spotify Catalog information about albums, artists, playlists, tracks, shows, episodes or audiobooks.',
                parameters: [
                    { name: 'q', paramType: 'String', required: true, description: 'Your search query' },
                    { name: 'type', paramType: 'String', required: true, description: 'Item types to search across' }
                ]
            }
        ]
    },
    {
        name: 'NASA APOD',
        description: 'Astronomy Picture of the Day. One of the most popular websites at NASA is the Astronomy Picture of the Day.',
        category: 'Other',
        provider: 'NASA',
        baseUrl: 'https://api.nasa.gov',
        authType: 'API Key',
        protocol: 'REST',
        pricing: 'Free',
        language: 'Any',
        docsUrl: 'https://api.nasa.gov/',
        status: 'Active',
        endpoints: [
            {
                method: 'GET',
                path: '/planetary/apod',
                description: 'Returns the image and explanation for the APOD.',
                parameters: [
                    { name: 'date', paramType: 'String', required: false, description: 'The date of the APOD image to retrieve' },
                    { name: 'hd', paramType: 'Boolean', required: false, description: 'Retrieve the high resolution image' }
                ]
            }
        ]
    },
    {
        name: 'GitHub REST API',
        description: 'Create integrations, retrieve data, and automate your workflows with the GitHub API.',
        category: 'Utility',
        provider: 'GitHub',
        baseUrl: 'https://api.github.com',
        authType: 'OAuth',
        protocol: 'REST',
        pricing: 'Free',
        language: 'Any',
        docsUrl: 'https://docs.github.com/en/rest',
        status: 'Active',
        endpoints: [
            {
                method: 'GET',
                path: '/users/{username}',
                description: 'Get public user information.',
                parameters: [
                    { name: 'username', paramType: 'String', required: true, description: 'Handle of the user' }
                ]
            },
            {
                method: 'GET',
                path: '/repos/{owner}/{repo}',
                description: 'Get repository information.',
                parameters: [
                    { name: 'owner', paramType: 'String', required: true, description: 'Owner of the repo' },
                    { name: 'repo', paramType: 'String', required: true, description: 'Name of the repo' }
                ]
            }
        ]
    },
    {
        name: 'CoinGecko',
        description: 'The world\'s most comprehensive cryptocurrency API. Get price, volume, market cap, and exchange data.',
        category: 'Finance',
        provider: 'CoinGecko',
        baseUrl: 'https://api.coingecko.com/api/v3',
        authType: 'None',
        protocol: 'REST',
        pricing: 'Free',
        language: 'Any',
        docsUrl: 'https://www.coingecko.com/en/api/documentation',
        status: 'Active',
        tags: ['crypto', 'bitcoin', 'finance'],
        endpoints: [
            {
                method: 'GET',
                path: '/simple/price',
                description: 'Get the current price of any cryptocurrencies in any other supported currencies that you need.',
                parameters: [
                    { name: 'ids', paramType: 'String', required: true, description: 'id of coins, comma-separated if querying more than 1 coin' },
                    { name: 'vs_currencies', paramType: 'String', required: true, description: 'vs_currency of coins, comma-separated' }
                ]
            },
            {
                method: 'GET',
                path: '/ping',
                description: 'Check API server status.',
                parameters: []
            }
        ]
    },
    {
        name: 'Twilio SMS',
        description: 'Send and receive SMS, MMS, and WhatsApp messages globally.',
        category: 'Utility',
        provider: 'Twilio',
        baseUrl: 'https://api.twilio.com/2010-04-01',
        authType: 'Bearer Token',
        protocol: 'REST',
        pricing: 'Paid',
        language: 'Any',
        docsUrl: 'https://www.twilio.com/docs/sms/api',
        status: 'Active',
        endpoints: [
            {
                method: 'POST',
                path: '/Accounts/{AccountSid}/Messages.json',
                description: 'Send an SMS message.',
                parameters: [
                    { name: 'To', paramType: 'String', required: true, description: 'The destination phone number' },
                    { name: 'From', paramType: 'String', required: true, description: 'The Twilio phone number' },
                    { name: 'Body', paramType: 'String', required: true, description: 'The text of the message' }
                ]
            }
        ]
    },
    {
        name: 'PokeAPI',
        description: 'All the Pokémon data you\'ll ever need in one place, easily accessible through a modern RESTful API.',
        category: 'Social', // Fun/Gaming fits better in Social or Other
        provider: 'PokeAPI',
        baseUrl: 'https://pokeapi.co/api/v2',
        authType: 'None',
        protocol: 'REST',
        pricing: 'Free',
        language: 'Any',
        docsUrl: 'https://pokeapi.co/',
        status: 'Active',
        endpoints: [
            {
                method: 'GET',
                path: '/pokemon/{name}',
                description: 'Get info about a specific Pokemon.',
                parameters: [
                    { name: 'name', paramType: 'String', required: true, description: 'Name or ID of the Pokemon' }
                ]
            },
            {
                method: 'GET',
                path: '/berry/{id}',
                description: 'Get info about a berry.',
                parameters: [
                    { name: 'id', paramType: 'Number', required: true, description: 'ID of the berry' }
                ]
            }
        ]
    },
    {
        name: 'OpenWeatherMap',
        description: 'Access current weather data for any location on Earth including over 200,000 cities!',
        category: 'Utility',
        provider: 'OpenWeather',
        baseUrl: 'https://api.openweathermap.org/data/2.5',
        authType: 'API Key',
        protocol: 'REST',
        pricing: 'Freemium',
        language: 'Any',
        docsUrl: 'https://openweathermap.org/api',
        status: 'Active',
        endpoints: [
            {
                method: 'GET',
                path: '/weather',
                description: 'Get current weather data.',
                parameters: [
                    { name: 'q', paramType: 'String', required: true, description: 'City name, state code and country code' },
                    { name: 'appid', paramType: 'String', required: true, description: 'Your unique API key' }
                ]
            }
        ]
    },
    {
        name: 'Rick and Morty API',
        description: 'Access information about characters, images, locations and episodes from the Rick and Morty TV show.',
        category: 'Social',
        provider: 'Axel Fuhrmann',
        baseUrl: 'https://rickandmortyapi.com/api',
        authType: 'None',
        protocol: 'REST',
        pricing: 'Free',
        language: 'Any',
        docsUrl: 'https://rickandmortyapi.com/documentation',
        status: 'Active',
        endpoints: [
            {
                method: 'GET',
                path: '/character',
                description: 'Get list of all characters.',
                parameters: [
                    { name: 'page', paramType: 'Number', required: false, description: 'Page number' }
                ]
            },
            {
                method: 'GET',
                path: '/episode',
                description: 'Get list of episodes.',
                parameters: []
            }
        ]
    },
    {
        name: 'Fake Store API',
        description: 'Fake store rest API for your e-commerce or shopping website prototype.',
        category: 'E-commerce',
        provider: 'FakeStore',
        baseUrl: 'https://fakestoreapi.com',
        authType: 'None',
        protocol: 'REST',
        pricing: 'Free',
        language: 'Any',
        docsUrl: 'https://fakestoreapi.com/docs',
        status: 'Active',
        endpoints: [
            {
                method: 'GET',
                path: '/products',
                description: 'Get all products.',
                parameters: []
            },
            {
                method: 'GET',
                path: '/carts',
                description: 'Get all carts.',
                parameters: []
            }
        ]
    },
    {
        name: 'Discord API',
        description: 'Create bots, manage communities, and integrate Discord with your app.',
        category: 'Social',
        provider: 'Discord',
        baseUrl: 'https://discord.com/api/v10',
        authType: 'OAuth',
        protocol: 'REST',
        pricing: 'Free',
        language: 'Any',
        docsUrl: 'https://discord.com/developers/docs/intro',
        status: 'Active',
        endpoints: [
            {
                method: 'GET',
                path: '/users/@me',
                description: 'Get current user info.',
                parameters: []
            },
            {
                method: 'POST',
                path: '/channels/{channel.id}/messages',
                description: 'Post a message to a channel.',
                parameters: [
                    { name: 'content', paramType: 'String', required: true, description: 'Message content' }
                ]
            }
        ]
    }
];

const seedRealApis = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/api-hub');
        console.log('MongoDB Connected');

        // Find an admin or first user to assign ownership
        const user = await User.findOne();
        if (!user) {
            console.error('No users found. Please create a user first.');
            process.exit(1);
        }

        // Clear existing APIs (Optional: Remove if you want to keep old data)
        await Api.deleteMany({});
        console.log('Cleared existing APIs');

        // Add owner to each API
        const apisWithUser = realApis.map(api => ({
            ...api,
            owner: user._id,
            rating: {
                average: (Math.random() * 2 + 3).toFixed(1), // Random rating 3.0 - 5.0
                count: Math.floor(Math.random() * 100)
            },
            stats: {
                views: Math.floor(Math.random() * 5000),
                calls: Math.floor(Math.random() * 1000)
            }
        }));

        await Api.insertMany(apisWithUser);
        console.log('Real APIs seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding APIs:', error);
        process.exit(1);
    }
};

seedRealApis();
