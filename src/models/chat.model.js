const { DataTypes } = require('sequelize');
const { sequelize, Sequelize } = require('../config/database.config');
const User = require('./user.model');
const Property = require('./property.model');
const MaintenanceRequest = require('./maintenance.model');
const Tenant = require('./tenant.model');

const Chat = sequelize.define('Chat', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    receiverId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    propertyId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Property,
            key: 'id'
        }
    },
    maintenanceRequestId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: MaintenanceRequest,
            key: 'id'
        }
    },
    tenantId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Tenant,
            key: 'id'
        }
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: [1, 2000]
        }
    },
    messageType: {
        type: DataTypes.ENUM('text', 'image', 'document', 'location'),
        defaultValue: 'text'
    },
    mediaUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    mediaMetadata: {
        type: DataTypes.JSON,
        allowNull: true,
        validate: {
            isValidMetadata(value) {
                if (value) {
                    if (this.messageType === 'image' && (!value.width || !value.height)) {
                        throw new Error('Image metadata must include width and height');
                    }
                    if (this.messageType === 'document' && !value.size) {
                        throw new Error('Document metadata must include size');
                    }
                }
            }
        }
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    readAt: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: true
        }
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: true
        }
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true,
    underscored: true,
    hooks: {
        beforeCreate: async (chat) => {
            if (chat.propertyId) {
                const property = await Property.findByPk(chat.propertyId);
                if (!property) {
                    throw new Error('Property not found');
                }
            }
            if (chat.maintenanceRequestId) {
                const request = await MaintenanceRequest.findByPk(chat.maintenanceRequestId);
                if (!request) {
                    throw new Error('Maintenance request not found');
                }
            }
        }
    },
    indexes: [
        {
            fields: ['sender_id', 'receiver_id']
        },
        {
            fields: ['property_id']
        },
        {
            fields: ['maintenance_request_id']
        },
        {
            fields: ['tenant_id']
        },
        {
            fields: ['created_at']
        },
        {
            fields: ['is_read']
        }
    ]
});

// Define relationships
Chat.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Chat.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });
Chat.belongsTo(Property, { foreignKey: 'propertyId' });
Chat.belongsTo(MaintenanceRequest, { foreignKey: 'maintenanceRequestId' });
Chat.belongsTo(Tenant, { foreignKey: 'tenantId' });

// Instance methods
Chat.prototype.markAsRead = async function() {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
};

Chat.prototype.softDelete = async function() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    await this.save();
};

// Static methods
Chat.getChatHistory = async function(userId1, userId2, limit = 50, offset = 0) {
    return await this.findAll({
        where: {
            isDeleted: false,
            [Sequelize.Op.or]: [
                {
                    senderId: userId1,
                    receiverId: userId2
                },
                {
                    senderId: userId2,
                    receiverId: userId1
                }
            ]
        },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        include: [
            {
                model: User,
                as: 'sender',
                attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
                model: User,
                as: 'receiver',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }
        ]
    });
};

Chat.getUnreadCount = async function(userId) {
    return await this.count({
        where: {
            receiverId: userId,
            isRead: false,
            isDeleted: false
        }
    });
};

Chat.getPropertyChats = async function(propertyId, limit = 50, offset = 0) {
    return await this.findAll({
        where: {
            propertyId,
            isDeleted: false
        },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        include: [
            {
                model: User,
                as: 'sender',
                attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
                model: User,
                as: 'receiver',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }
        ]
    });
};

Chat.getMaintenanceChats = async function(maintenanceRequestId, limit = 50, offset = 0) {
    return await this.findAll({
        where: {
            maintenanceRequestId,
            isDeleted: false
        },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        include: [
            {
                model: User,
                as: 'sender',
                attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
                model: User,
                as: 'receiver',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }
        ]
    });
};

Chat.getTenantChats = async function(tenantId, limit = 50, offset = 0) {
    return await this.findAll({
        where: {
            tenantId,
            isDeleted: false
        },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        include: [
            {
                model: User,
                as: 'sender',
                attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
                model: User,
                as: 'receiver',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }
        ]
    });
};

module.exports = Chat;
