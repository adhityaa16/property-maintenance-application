const { sequelize } = require('./database.config');
const models = require('../models');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger.util');

const setupDatabase = async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        logger.info('Database connection established successfully.');

        // Sync all models
        await sequelize.sync({ force: true });
        logger.info('Database models synchronized successfully.');

        // Create initial admin user
        const adminUser = await models.User.create({
            email: 'admin@example.com',
            password: await bcrypt.hash('Admin@123', 10),
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            isVerified: true,
            isActive: true
        });
        logger.info('Admin user created successfully.');

        // Create sample owner
        const ownerUser = await models.User.create({
            email: 'owner@example.com',
            password: await bcrypt.hash('Owner@123', 10),
            firstName: 'John',
            lastName: 'Doe',
            role: 'owner',
            isVerified: true,
            isActive: true
        });
        logger.info('Owner user created successfully.');

        // Create sample property
        await models.Property.create({
            name: 'Sample Property',
            address: '123 Main St, City, State',
            type: 'apartment',
            status: 'vacant',
            ownerId: ownerUser.id
        });
        logger.info('Sample property created successfully.');

        logger.info('Database setup completed successfully.');
        process.exit(0);
    } catch (error) {
        logger.error('Database setup failed:', error);
        process.exit(1);
    }
};

setupDatabase(); 