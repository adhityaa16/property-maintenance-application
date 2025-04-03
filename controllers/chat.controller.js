const Chat = require('../models/chat.model');
const User = require('../models/user.model');
const { Op } = require('sequelize');

class ChatController {
    // Get chat history between two users
    async getChatHistory(req, res) {
        try {
            const { user_id } = req.params;
            const current_user_id = req.user.id;
            const { limit = 50, offset = 0 } = req.query;

            const messages = await Chat.findAll({
                where: {
                    [Op.or]: [
                        {
                            sender_id: current_user_id,
                            receiver_id: user_id
                        },
                        {
                            sender_id: user_id,
                            receiver_id: current_user_id
                        }
                    ]
                },
                include: [
                    {
                        model: User,
                        as: 'sender',
                        attributes: ['user_id', 'full_name']
                    },
                    {
                        model: User,
                        as: 'receiver',
                        attributes: ['user_id', 'full_name']
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.json(messages);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Get maintenance request chat history
    async getMaintenanceChat(req, res) {
        try {
            const { maintenance_id } = req.params;
            const { limit = 50, offset = 0 } = req.query;

            const messages = await Chat.findAll({
                where: {
                    maintenance_request_id: maintenance_id
                },
                include: [
                    {
                        model: User,
                        as: 'sender',
                        attributes: ['user_id', 'full_name', 'user_type']
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.json(messages);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Get property chat history
    async getPropertyChat(req, res) {
        try {
            const { property_id } = req.params;
            const { limit = 50, offset = 0 } = req.query;

            const messages = await Chat.findAll({
                where: {
                    property_id
                },
                include: [
                    {
                        model: User,
                        as: 'sender',
                        attributes: ['user_id', 'full_name', 'user_type']
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.json(messages);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Get unread messages count
    async getUnreadCount(req, res) {
        try {
            const user_id = req.user.id;

            const count = await Chat.count({
                where: {
                    receiver_id: user_id,
                    is_read: false
                }
            });

            res.json({ unread_count: count });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Mark messages as read
    async markAsRead(req, res) {
        try {
            const { sender_id } = req.params;
            const receiver_id = req.user.id;

            await Chat.update(
                { is_read: true },
                {
                    where: {
                        sender_id,
                        receiver_id,
                        is_read: false
                    }
                }
            );

            // Notify sender through WebSocket that messages were read
            const chatService = req.app.get('chatService');
            chatService.sendNotification(sender_id, {
                type: 'messages_read',
                reader_id: receiver_id
            });

            res.json({ message: 'Messages marked as read' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Get recent chat list
    async getRecentChats(req, res) {
        try {
            const user_id = req.user.id;

            const recentChats = await Chat.findAll({
                attributes: [
                    'sender_id',
                    'receiver_id',
                    [sequelize.fn('MAX', sequelize.col('created_at')), 'last_message_time']
                ],
                where: {
                    [Op.or]: [
                        { sender_id: user_id },
                        { receiver_id: user_id }
                    ]
                },
                group: [
                    'sender_id',
                    'receiver_id'
                ],
                order: [[sequelize.fn('MAX', sequelize.col('created_at')), 'DESC']],
                limit: 20
            });

            // Get user details for each chat
            const chatDetails = await Promise.all(
                recentChats.map(async (chat) => {
                    const other_user_id = chat.sender_id === user_id ? chat.receiver_id : chat.sender_id;
                    const other_user = await User.findByPk(other_user_id, {
                        attributes: ['user_id', 'full_name', 'user_type']
                    });

                    const unread_count = await Chat.count({
                        where: {
                            sender_id: other_user_id,
                            receiver_id: user_id,
                            is_read: false
                        }
                    });

                    return {
                        user: other_user,
                        last_message_time: chat.last_message_time,
                        unread_count
                    };
                })
            );

            res.json(chatDetails);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new ChatController();
