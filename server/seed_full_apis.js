require('dotenv').config();
const mongoose = require('mongoose');
const Api = require('./models/Api');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/api_hub';

const fullApis = [
    // --- Development ---
    {
        name: 'GitHub',
        description: 'The world\'s leading software development platform.',
        category: 'Development',
        provider: 'GitHub',
        baseUrl: 'https://api.github.com',
        authType: 'API Key',
        protocol: 'REST',
        pricing: 'Freemium',
        language: 'Any',
        docsUrl: 'https://docs.github.com/en/rest',
        status: 'Active',
        tags: ['code', 'git', 'devops'],
        endpoints: [
            { method: 'GET', path: '/users/{username}', description: 'Get public user information', parameters: [{ name: 'username', paramType: 'String', required: true }] },
            { method: 'GET', path: '/repos/{owner}/{repo}', description: 'Get repository details', parameters: [{ name: 'owner', paramType: 'String', required: true }, { name: 'repo', paramType: 'String', required: true }] }
        ]
    },
    {
        name: 'StackExchange',
        description: 'Access the wealth of knowledge on Stack Overflow and other Stack Exchange sites.',
        category: 'Development',
        provider: 'Stack Exchange',
        baseUrl: 'https://api.stackexchange.com/2.3',
        authType: 'API Key',
        protocol: 'REST',
        pricing: 'Free',
        language: 'Any',
        docsUrl: 'https://api.stackexchange.com/docs',
        status: 'Active',
        tags: ['q&a', 'programming', 'community'],
        endpoints: [
            { method: 'GET', path: '/questions', description: 'Get a list of questions', parameters: [{ name: 'site', paramType: 'String', required: true, description: 'e.g., stackoverflow' }] }
        ]
    },
    {
        name: 'Docker Hub',
        description: 'Manage Docker images and repositories.',
        category: 'Development',
        provider: 'Docker',
        baseUrl: 'https://hub.docker.com/v2',
        authType: 'Bearer Token',
        protocol: 'REST',
        pricing: 'Freemium',
        language: 'Go',
        docsUrl: 'https://docs.docker.com/docker-hub/api/latest/',
        status: 'Active',
        tags: ['containers', 'devops', 'images'],
        endpoints: [
            { method: 'GET', path: '/repositories/{namespace}/{repository}/tags', description: 'List image tags' }
        ]
    },

    // --- Media ---
    {
        name: 'Cloudinary',
        description: 'Cloud-based image and video management and delivery.',
        category: 'Media',
        provider: 'Cloudinary',
        baseUrl: 'https://api.cloudinary.com/v1_1',
        authType: 'API Key',
        protocol: 'REST',
        pricing: 'Freemium',
        language: 'Any',
        docsUrl: 'https://cloudinary.com/documentation/api',
        status: 'Active',
        tags: ['images', 'video', 'cdn'],
        endpoints: [
            { method: 'POST', path: '/{cloud_name}/image/upload', description: 'Upload an image' }
        ]
    },
    {
        name: 'Giphy',
        description: 'The world\'s largest library of animated GIFs and stickers.',
        category: 'Media',
        provider: 'Giphy',
        baseUrl: 'https://api.giphy.com/v1',
        authType: 'API Key',
        protocol: 'REST',
        pricing: 'Free',
        language: 'Any',
        docsUrl: 'https://developers.giphy.com/docs/api/',
        status: 'Active',
        tags: ['gif', 'images', 'search'],
        endpoints: [
            { method: 'GET', path: '/gifs/trending', description: 'Get trending GIFs', parameters: [{ name: 'api_key', paramType: 'String', required: true }] }
        ]
    },

    // --- Weather ---
    {
        name: 'OpenWeatherMap',
        description: 'Weather forecasts, nowcasts and history in a fast and elegant way.',
        category: 'Weather',
        provider: 'OpenWeather',
        baseUrl: 'https://api.openweathermap.org/data/2.5',
        authType: 'API Key',
        protocol: 'REST',
        pricing: 'Freemium',
        language: 'Any',
        docsUrl: 'https://openweathermap.org/api',
        status: 'Active',
        tags: ['weather', 'forecast', 'climate'],
        endpoints: [
            { method: 'GET', path: '/weather', description: 'Current weather data', parameters: [{ name: 'q', paramType: 'String', required: true, description: 'City name' }, { name: 'appid', paramType: 'String', required: true }] }
        ]
    },
    {
        name: 'WeatherAPI',
        description: 'Realtime, future, marine, and astronomy weather data.',
        category: 'Weather',
        provider: 'WeatherAPI.com',
        baseUrl: 'https://api.weatherapi.com/v1',
        authType: 'API Key',
        protocol: 'REST',
        pricing: 'Freemium',
        language: 'Any',
        docsUrl: 'https://www.weatherapi.com/docs/',
        status: 'Active',
        tags: ['weather', 'forecast'],
        endpoints: [
            { method: 'GET', path: '/current.json', description: 'Realtime weather', parameters: [{ name: 'q', paramType: 'String', required: true }] }
        ]
    },

    // --- Finance ---
    {
        name: 'Stripe',
        description: 'Payment processing platform for the internet.',
        category: 'Finance',
        provider: 'Stripe',
        baseUrl: 'https://api.stripe.com/v1',
        authType: 'Bearer Token',
        protocol: 'REST',
        pricing: 'Paid',
        language: 'Any',
        docsUrl: 'https://stripe.com/docs/api',
        status: 'Active',
        tags: ['payments', 'billing', 'finance'],
        endpoints: [
            { method: 'POST', path: '/charges', description: 'Create a charge' },
            { method: 'GET', path: '/customers', description: 'List all customers' }
        ]
    },
    {
        name: 'CoinGecko',
        description: 'Cryptocurrency data API with comprehensive market data.',
        category: 'Finance',
        provider: 'CoinGecko',
        baseUrl: 'https://api.coingecko.com/api/v3',
        authType: 'None',
        protocol: 'REST',
        pricing: 'Free',
        language: 'Any',
        docsUrl: 'https://www.coingecko.com/en/api/documentation',
        status: 'Active',
        tags: ['crypto', 'bitcoin', 'market'],
        endpoints: [
            { method: 'GET', path: '/ping', description: 'Check API status' },
            { method: 'GET', path: '/simple/price', description: 'Get coin prices', parameters: [{ name: 'ids', paramType: 'String', required: true }, { name: 'vs_currencies', paramType: 'String', required: true }] }
        ]
    },
    {
        name: 'Binance',
        description: 'Exchange API for one of the largest crypto exchanges.',
        category: 'Finance',
        provider: 'Binance',
        baseUrl: 'https://api.binance.com/api/v3',
        authType: 'API Key',
        protocol: 'REST',
        pricing: 'Free',
        language: 'Any',
        docsUrl: 'https://binance-docs.github.io/apidocs/spot/en/',
        status: 'Active',
        tags: ['crypto', 'exchange', 'trading'],
        endpoints: [
            { method: 'GET', path: '/ticker/price', description: 'Symbol price ticker' }
        ]
    },

    // --- Social ---
    {
        name: 'Discord',
        description: 'Chat and VoIP community platform API.',
        category: 'Social',
        provider: 'Discord',
        baseUrl: 'https://discord.com/api/v10',
        authType: 'Bearer Token',
        protocol: 'REST',
        pricing: 'Free',
        language: 'Any',
        docsUrl: 'https://discord.com/developers/docs/intro',
        status: 'Active',
        tags: ['chat', 'messaging', 'community'],
        endpoints: [
            { method: 'GET', path: '/users/@me', description: 'Get current user' },
            { method: 'POST', path: '/channels/{channel.id}/messages', description: 'Create a message', parameters: [{ name: 'content', paramType: 'String', required: true }] }
        ]
    },
    {
        name: 'Reddit',
        description: 'Network of communities based on people\'s interests.',
        category: 'Social',
        provider: 'Reddit',
        baseUrl: 'https://www.reddit.com',
        authType: 'OAuth',
        protocol: 'REST',
        pricing: 'Free',
        language: 'Any',
        docsUrl: 'https://www.reddit.com/dev/api/',
        status: 'Active',
        tags: ['social', 'news', 'discussion'],
        endpoints: [
            { method: 'GET', path: '/r/{subreddit}/hot.json', description: 'Get hot posts from a subreddit' }
        ]
    },

    // --- Gaming ---
    {
        name: 'PokeAPI',
        description: 'All the Pokémon data you\'ll ever need in one place.',
        category: 'Gaming',
        provider: 'PokeAPI',
        baseUrl: 'https://pokeapi.co/api/v2',
        authType: 'None',
        protocol: 'REST',
        pricing: 'Free',
        language: 'Any',
        docsUrl: 'https://pokeapi.co/',
        status: 'Active',
        tags: ['pokemon', 'games', 'nintendo'],
        endpoints: [
            { method: 'GET', path: '/pokemon/{name}', description: 'Get Pokemon details', parameters: [{ name: 'name', paramType: 'String', required: true }] }
        ]
    },
    {
        name: 'Steam Web API',
        description: 'Access Steam community data and game information.',
        category: 'Gaming',
        provider: 'Valve',
        baseUrl: 'https://api.steampowered.com',
        authType: 'API Key',
        protocol: 'REST',
        pricing: 'Free',
        language: 'Any',
        docsUrl: 'https://steamcommunity.com/dev',
        status: 'Active',
        tags: ['games', 'steam', 'valve'],
        endpoints: [
            { method: 'GET', path: '/ISteamNews/GetNewsForApp/v2/', description: 'Get news for app' }
        ]
    },

    // --- Maps/Location ---
    {
        name: 'Google Maps Platform',
        description: 'Maps, routes, and places for your apps.',
        category: 'Utility',
        provider: 'Google',
        baseUrl: 'https://maps.googleapis.com/maps/api',
        authType: 'API Key',
        protocol: 'REST',
        pricing: 'Paid',
        language: 'Any',
        docsUrl: 'https://developers.google.com/maps/documentation',
        status: 'Active',
        tags: ['maps', 'geolocation', 'places'],
        endpoints: [
            { method: 'GET', path: '/geocode/json', description: 'Geocoding service' }
        ]
    },

    // --- Science/Education ---
    {
        name: 'NASA API',
        description: 'Access to NASA data, including imagery and astronomy.',
        category: 'Health', // Using Health as proxy for Science or add generic Science tag
        provider: 'NASA',
        baseUrl: 'https://api.nasa.gov',
        authType: 'API Key',
        protocol: 'REST',
        pricing: 'Free',
        language: 'Any',
        docsUrl: 'https://api.nasa.gov/',
        status: 'Active',
        tags: ['space', 'science', 'astronomy'],
        endpoints: [
            { method: 'GET', path: '/planetary/apod', description: 'Astronomy Picture of the Day' }
        ]
    },
    {
        name: 'Open Library',
        description: 'An open, editable library catalog, building towards a web page for every book ever published.',
        category: 'Education', // Mapped to Other if Education undefined, but adding to Other for now
        provider: 'Internet Archive',
        baseUrl: 'https://openlibrary.org',
        authType: 'None',
        protocol: 'REST',
        pricing: 'Free',
        language: 'Any',
        docsUrl: 'https://openlibrary.org/developers/api',
        status: 'Active',
        tags: ['books', 'library', 'literature'],
        endpoints: [
            { method: 'GET', path: '/search.json', description: 'Search for books' }
        ]
    },

    // --- Utility/Tools ---
    {
        name: 'OpenAI',
        description: 'Access state-of-the-art AI models like GPT-4.',
        category: 'Utility',
        provider: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        authType: 'Bearer Token',
        protocol: 'REST',
        pricing: 'Paid',
        language: 'Python',
        docsUrl: 'https://platform.openai.com/docs/api-reference',
        status: 'Active',
        tags: ['ai', 'ml', 'nlp', 'chatgpt'],
        endpoints: [
            { method: 'POST', path: '/chat/completions', description: 'Create chat completion' },
            { method: 'POST', path: '/images/generations', description: 'Generate images' }
        ]
    },
    {
        name: 'Twilio',
        description: 'Communication APIs for SMS, Voice, Video and Authentication.',
        category: 'Utility',
        provider: 'Twilio',
        baseUrl: 'https://api.twilio.com/2010-04-01',
        authType: 'Basic Auth',
        protocol: 'REST',
        pricing: 'Paid',
        language: 'Any',
        docsUrl: 'https://www.twilio.com/docs',
        status: 'Active',
        tags: ['sms', 'voice', 'communication'],
        endpoints: [
            { method: 'POST', path: '/Accounts/{AccountSid}/Messages.json', description: 'Send an SMS' }
        ]
    },

    // --- Music ---
    {
        name: 'Spotify',
        description: 'Access music catalogue data, manage playlists and saved music.',
        category: 'Music',
        provider: 'Spotify',
        baseUrl: 'https://api.spotify.com/v1',
        authType: 'OAuth',
        protocol: 'REST',
        pricing: 'Freemium',
        language: 'Any',
        docsUrl: 'https://developer.spotify.com/documentation/web-api',
        status: 'Active',
        tags: ['music', 'audio', 'streaming'],
        endpoints: [
            { method: 'GET', path: '/tracks/{id}', description: 'Get a track' },
            { method: 'GET', path: '/search', description: 'Search for an item' }
        ]
    },

    // --- News ---
    {
        name: 'NewsAPI',
        description: 'Locate articles and breaking news headlines from news sources and blogs across the web.',
        category: 'News',
        provider: 'NewsAPI',
        baseUrl: 'https://newsapi.org/v2',
        authType: 'API Key',
        protocol: 'REST',
        pricing: 'Freemium',
        language: 'Any',
        docsUrl: 'https://newsapi.org/docs',
        status: 'Active',
        tags: ['news', 'headlines', 'media'],
        endpoints: [
            { method: 'GET', path: '/top-headlines', description: 'Top headlines', parameters: [{ name: 'country', paramType: 'String', required: true }] }
        ]
    }
];

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected for Seeding...');

        // Find a user to assign as owner
        const user = await User.findOne();
        if (!user) {
            console.log('No user found to assign APIs to. Create a user first.');
            process.exit(1);
        }

        // Clear existing APIs (optional, but good for "reseeding")
        // await Api.deleteMany({ owner: user._id }); // Or keep them and just append? 
        // User asked to "add all", so appending or ensuring uniqueness is better. 
        // We will just clear for this task to ensure clean state and avoid duplicates if run multiple times.
        await Api.deleteMany({});

        const apisWithUser = fullApis.map(api => ({
            ...api,
            owner: user._id,
            rating: {
                average: (3.5 + Math.random() * 1.5), // Random rating 3.5 - 5.0
                count: Math.floor(Math.random() * 100)
            },
            stats: {
                views: Math.floor(Math.random() * 5000),
                calls: Math.floor(Math.random() * 10000),
                latency: Math.floor(Math.random() * 200) + 20,
                uptime: 99.0 + (Math.random())
            }
        }));

        await Api.insertMany(apisWithUser);
        console.log(`Successfully seeded ${apisWithUser.length} APIs!`);
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
