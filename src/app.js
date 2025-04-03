const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const { createServer } = require('http');
const socketIo = require('socket.io');
const { sequelize } = require('./config/database.config');
const { handleError } = require('./utils/error-handler.util');
const logger = require('./utils/logger.util');

// Import routes
const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/property.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const chatRoutes = require('./routes/chat.routes');
const notificationRoutes = require('./routes/notification.routes');

// Create Express app
const app = express();

// Create HTTP server
const server = createServer(app);

// Create Socket.IO instance
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Make io accessible globally
global.io = io;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(compression()); // Compress responses
app.use(morgan('combined', { stream: logger.stream })); // Request logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running'
    });
});

// Error handling
app.use((err, req, res, next) => {
    handleError(err, req, res, next);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    logger.info('New client connected');

    // Handle authentication
    socket.on('authenticate', async (token) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            socket.join(`user_${decoded.id}`);
            logger.info(`User ${decoded.id} authenticated on socket`);
        } catch (error) {
            logger.error('Socket authentication failed:', error);
            socket.disconnect();
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        logger.info('Client disconnected');
    });
});

// Database connection and server start
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        logger.info('Database connection established successfully');

        // Sync database models
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            logger.info('Database models synchronized');
        }

        // Start server
        server.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Unable to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = { app, server, io }; 