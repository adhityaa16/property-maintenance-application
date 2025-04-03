const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database.config');
const logger = require('../utils/logger.util');

router.get('/', async (req, res) => {
    try {
        // Check database connection
        await sequelize.authenticate();
        
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected',
            uptime: process.uptime()
        });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        });
    }
});

module.exports = router; 