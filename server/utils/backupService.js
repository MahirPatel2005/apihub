const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Backup Directory
const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Function to perform backup (JSON dump of collections)
const performBackup = async () => {
    console.log('Starting automated backup...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const specificBackupDir = path.join(backupDir, timestamp);

    try {
        if (!fs.existsSync(specificBackupDir)) {
            fs.mkdirSync(specificBackupDir);
        }

        const collections = await mongoose.connection.db.listCollections().toArray();

        for (const collection of collections) {
            const modelName = collection.name;
            const data = await mongoose.connection.db.collection(modelName).find({}).toArray();
            fs.writeFileSync(
                path.join(specificBackupDir, `${modelName}.json`),
                JSON.stringify(data, null, 2)
            );
        }

        console.log(`Backup completed successfully at ${specificBackupDir}`);

        // Cleanup old backups (keep last 7 days)
        // ... (can add logic later)

    } catch (error) {
        console.error('Backup failed:', error);
    }
};

// Function to monitor uptime/health (simple log for now)
const monitorHealth = async () => {
    const memoryUsage = process.memoryUsage();
    console.log(`[Health Check] Uptime: ${process.uptime().toFixed(2)}s | RAM: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
};

// Initialize Cron Jobs
const initCronJobs = () => {
    // Run Backup daily at midnight
    cron.schedule('0 0 * * *', performBackup);

    // Run Health Check every hour
    cron.schedule('0 * * * *', monitorHealth);

    console.log('Infrastructure Cron Jobs Initialized');
};

module.exports = { initCronJobs, performBackup };
