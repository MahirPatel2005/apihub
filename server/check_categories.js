require('dotenv').config();
const mongoose = require('mongoose');
const Api = require('./models/Api');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/api_hub';

mongoose.connect(MONGO_URI).then(async () => {
    const result = await Api.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
    ]);
    console.log(result);
    process.exit();
});
