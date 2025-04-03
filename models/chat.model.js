const { DataTypes } = require('sequelize');
const { sequelize, Sequelize } = require('../config/database.config');
const User = require('./user.model');
const Property = require('./property.model');
const MaintenanceRequest = require('./maintenance.model');

const Chat = sequelize.define('Chat', {
    chat_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    sender_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    receiver_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    property_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Property,
            key: 'property_id'
        }
    },
    maintenance_request_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: MaintenanceRequest,
            key: 'request_id'
        }
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    message_type: {
        type: DataTypes.ENUM('text', 'image', 'document'),
        defaultValue: 'text'
    },
    media_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    indexes: [
        {
            fields: ['sender_id', 'receiver_id']
        },
        {
            fields: ['property_id']
        },
        {
            fields: ['maintenance_request_id']
        }
    ]
});

// Define relationships
Chat.belongsTo(User, { as: 'sender', foreignKey: 'sender_id' });
Chat.belongsTo(User, { as: 'receiver', foreignKey: 'receiver_id' });
Chat.belongsTo(Property, { foreignKey: 'property_id' });
Chat.belongsTo(MaintenanceRequest, { foreignKey: 'maintenance_request_id' });

// Static method to get chat history
Chat.getChatHistory = async function(userId1, userId2, limit = 50) {
    return await this.findAll({
        where: {
            [sequelize.Op.or]: [
                {
                    sender_id: userId1,
                    receiver_id: userId2
                },
                {
                    sender_id: userId2,
                    receiver_id: userId1
                }
            ]
        },
        order: [['created_at', 'DESC']],
        limit: limit
    });
};

// Static method to get unread messages count
Chat.getUnreadCount = async function(userId) {
    return await this.count({
        where: {
            receiver_id: userId,
            is_read: false
        }
    });
};

module.exports = Chat;
