require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const fixIndexes = async () => {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log('Connected to DB:', uri);

        const indexes = await User.collection.indexes();
        console.log('Current Indexes:', indexes);

        const idIndex = indexes.find(idx => idx.name === 'id_1');
        if (idIndex) {
            console.log('Found problematic index "id_1". Dropping...');
            await User.collection.dropIndex('id_1');
            console.log('Index dropped successfully.');
        } else {
            console.log('Index "id_1" not found. Checking for other potential duplicates on "id"...');
            // In case the name is different but key is { id: 1 }
            const altIdIndex = indexes.find(idx => idx.key.id === 1);
            if (altIdIndex) {
                console.log(`Found index with key { id: 1 } named "${altIdIndex.name}". Dropping...`);
                await User.collection.dropIndex(altIdIndex.name);
                console.log('Index dropped.');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

fixIndexes();
