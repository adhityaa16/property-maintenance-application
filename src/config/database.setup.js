require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./database.config');
const { User } = require('../models');
const logger = require('../utils/logger.util');

async function setupDatabase() {
    try {
        // Test the connection
        await sequelize.authenticate();
        logger.info('Database connection has been established successfully.');

        // Sync all models
        await sequelize.sync({ alter: true });
        logger.info('Database & tables created!');

        // Create admin user if it doesn't exist
        const adminUser = await User.findOne({
            where: { email: process.env.ADMIN_EMAIL || 'admin@example.com' }
        });

        if (!adminUser) {
            const hashedPassword = await bcrypt.hash(
                process.env.ADMIN_PASSWORD || 'admin123',
                10
            );

            await User.create({
                email: process.env.ADMIN_EMAIL || 'admin@example.com',
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                isVerified: true,
                isApproved: true,
                isActive: true
            });

            logger.info('Admin user created successfully');
        }

        // Here you can add initial data if needed
        logger.info('Database setup completed successfully.');

        process.exit(0);
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

// Run the setup
setupDatabase(); 