require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const fixIndexesApi12 = async () => {
    try {
        // Ensure we are connecting to api12
        const uri = process.env.MONGO_URI;
        if (!uri.includes('api12')) {
            console.error('Error: .env is not pointing to api12');
            return;
        }

        console.log('Connecting to:', uri);
        await mongoose.connect(uri);
        console.log('Connected.');

        const indexes = await User.collection.indexes();
        console.log('Current Indexes in api12:', indexes);

        const idIndex = indexes.find(idx => idx.name === 'id_1' || idx.key.id === 1);
        if (idIndex) {
            console.log(`Found problematic index "${idIndex.name}". Dropping...`);
            await User.collection.dropIndex(idIndex.name);
            console.log('Index dropped successfully.');
        } else {
            console.log('No problematic "id_1" index found in api12.');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

fixIndexesApi12();
