require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const logger = require('./utils/logger.util');
const routes = require('./routes');

console.log('Starting server initialization...');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

console.log('Created Express app and Socket.IO server');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Root route for testing
app.get('/', (req, res) => {
    console.log('Root route accessed');
    res.json({ message: 'Welcome to Property Maintenance API!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

const PORT = process.env.PORT || 3000;

console.log('Attempting to connect to database...');

// Test database connection before starting server
const db = require('./config/database.config');
db.authenticate()
    .then(() => {
        console.log('Database connection successful');
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
        process.exit(1);
    });

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
}); 