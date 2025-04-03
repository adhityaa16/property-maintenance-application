const Chat = require('../models/chat.model');
const User = require('../models/user.model');

class ChatService {
    constructor(io) {
        this.io = io;
        this.connectedUsers = new Map();
        this.setupSocketHandlers();
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('New client connected');

            // Handle user authentication
            socket.on('authenticate', async (token) => {
                try {
                    const user = await this.verifyToken(token);
                    if (user) {
                        this.connectedUsers.set(user.user_id, socket.id);
                        socket.userId = user.user_id;
                        socket.emit('authenticated');
                        
                        // Join user-specific room
                        socket.join(`user_${user.user_id}`);
                        
                        // If user is owner, join property rooms
                        if (user.user_type === 'owner') {
                            const properties = await this.getUserProperties(user.user_id);
                            properties.forEach(property => {
                                socket.join(`property_${property.property_id}`);
                            });
                        }
                    }
                } catch (error) {
                    socket.emit('auth_error', { message: 'Authentication failed' });
                }
            });

            // Handle private messages
            socket.on('private_message', async (data) => {
                try {
                    const { receiver_id, message, property_id, maintenance_request_id, message_type } = data;
                    
                    // Save message to database
                    const chat = await Chat.create({
                        sender_id: socket.userId,
                        receiver_id,
                        message,
                        property_id,
                        maintenance_request_id,
                        message_type: message_type || 'text'
                    });

                    // Emit to sender
                    socket.emit('message_sent', chat);

                    // Emit to receiver if online
                    const receiverSocketId = this.connectedUsers.get(receiver_id);
                    if (receiverSocketId) {
                        this.io.to(receiverSocketId).emit('new_message', chat);
                    }

                    // If this is a maintenance request chat, notify owner
                    if (maintenance_request_id) {
                        this.io.to(`maintenance_${maintenance_request_id}`).emit('maintenance_chat', chat);
                    }
                } catch (error) {
                    socket.emit('message_error', { message: 'Failed to send message' });
                }
            });

            // Handle typing indicators
            socket.on('typing', (data) => {
                const receiverSocketId = this.connectedUsers.get(data.receiver_id);
                if (receiverSocketId) {
                    this.io.to(receiverSocketId).emit('user_typing', {
                        user_id: socket.userId,
                        typing: data.typing
                    });
                }
            });

            // Handle read receipts
            socket.on('mark_read', async (data) => {
                try {
                    await Chat.update(
                        { is_read: true },
                        {
                            where: {
                                sender_id: data.sender_id,
                                receiver_id: socket.userId,
                                is_read: false
                            }
                        }
                    );

                    const senderSocketId = this.connectedUsers.get(data.sender_id);
                    if (senderSocketId) {
                        this.io.to(senderSocketId).emit('messages_read', {
                            reader_id: socket.userId
                        });
                    }
                } catch (error) {
                    socket.emit('read_error', { message: 'Failed to mark messages as read' });
                }
            });

            // Handle maintenance request chat rooms
            socket.on('join_maintenance_chat', (maintenance_request_id) => {
                socket.join(`maintenance_${maintenance_request_id}`);
            });

            // Handle property chat rooms
            socket.on('join_property_chat', (property_id) => {
                socket.join(`property_${property_id}`);
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                if (socket.userId) {
                    this.connectedUsers.delete(socket.userId);
                }
                console.log('Client disconnected');
            });
        });
    }

    // Helper method to verify JWT token
    async verifyToken(token) {
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return await User.findByPk(decoded.id);
        } catch (error) {
            return null;
        }
    }

    // Helper method to get user's properties
    async getUserProperties(userId) {
        const Property = require('../models/property.model');
        return await Property.findAll({
            where: { owner_id: userId }
        });
    }

    // Method to broadcast maintenance status updates
    async broadcastMaintenanceUpdate(maintenanceRequest) {
        this.io.to(`maintenance_${maintenanceRequest.request_id}`).emit('maintenance_update', {
            request_id: maintenanceRequest.request_id,
            status: maintenanceRequest.status,
            updated_at: maintenanceRequest.updated_at
        });
    }

    // Method to send notification to specific user
    async sendNotification(userId, notification) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            this.io.to(socketId).emit('notification', notification);
        }
    }
}

module.exports = ChatService; 