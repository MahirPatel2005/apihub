const SystemSetting = require('../models/SystemSetting');

const checkMaintenanceMode = async (req, res, next) => {
    try {
        // Skip for admins (if we could check auth here, but auth runs after... 
        // usually maintenance mode blocks everyone except maybe a whitelist IP or specific bypass header)
        // For simplicity, we'll check it. If the user is trying to login (/api/auth/login), we might allow it.

        // Allow login routes so admins can log in to turn it off
        if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/admin') || req.path.startsWith('/api/settings')) {
            return next();
        }

        const maintenanceSetting = await SystemSetting.findOne({ key: 'MAINTENANCE_MODE' });

        if (maintenanceSetting && maintenanceSetting.value === true) {
            return res.status(503).json({
                message: 'Service Unavailable: The platform is currently under maintenance. Please try again later.'
            });
        }

        next();
    } catch (error) {
        console.error('Maintenance Check Error:', error);
        next(); // Fail open if DB is down
    }
};

module.exports = checkMaintenanceMode;
