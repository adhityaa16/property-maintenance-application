require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { createServer } = require('http');
const socketIO = require('socket.io');
const { sequelize } = require('./src/config/database.config');
const logger = require('./src/utils/logger.util');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const propertyRoutes = require('./src/routes/property.routes');
const maintenanceRoutes = require('./src/routes/maintenance.routes');
const chatRoutes = require('./src/routes/chat.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const notificationRoutes = require('./src/routes/notification.routes');

const app = express();
const httpServer = createServer(app);
const io = socketIO(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
});

// Database connection and server start
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Test database connection
        await sequelize.authenticate();
        logger.info('Database connection established successfully.');

        // Sync database models
        await sequelize.sync({ alter: true });
        logger.info('Database models synchronized.');

        // Start server
        httpServer.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Unable to start server:', error);
        process.exit(1);
    }
}

startServer();
