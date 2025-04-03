const { Sequelize } = require('sequelize');
require('dotenv').config();
const logger = require('../utils/logger.util');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'property_maintenance',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: (msg) => logger.debug(msg),
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Database connection has been established successfully.');
        
        // Only sync with force in development if explicitly set
        if (process.env.NODE_ENV === 'development' && process.env.DB_FORCE_SYNC === 'true') {
            await sequelize.sync({ force: true });
            logger.info('Database models synchronized with force in development mode.');
        } else if (process.env.NODE_ENV === 'development') {
            // In development, just sync without altering
            await sequelize.sync();
            logger.info('Database models synchronized in development mode.');
        }
        return true;
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
        return false;
    }
};

// Call the test function
testConnection();

module.exports = sequelize; 