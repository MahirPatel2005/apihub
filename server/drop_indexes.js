const mongoose = require('mongoose');
require('dotenv').config();

const dropIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/api-hub');
        console.log('MongoDB Connected');

        const Api = mongoose.model('Api', new mongoose.Schema({}));
        await Api.collection.dropIndexes();
        console.log('Indexes dropped successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error dropping indexes:', error);
        process.exit(1);
    }
};

dropIndexes();
