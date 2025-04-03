const socketIO = require('socket.io');
const { setupChatHandlers } = require('./socket/chat.handlers');
const { setupNotificationHandlers } = require('./socket/notification.handlers');

const setupSocket = (server) => {
    const io = socketIO(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`New client connected: ${socket.id}`);

        // Setup handlers
        setupChatHandlers(io, socket);
        setupNotificationHandlers(io, socket);

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });

    return io;
};

module.exports = { setupSocket }; 