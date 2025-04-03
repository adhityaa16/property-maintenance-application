const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');
const User = require('./user.model');
const Property = require('./property.model');
const MaintenanceRequest = require('./maintenance.model');
const Tenant = require('./tenant.model');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM(
            'maintenance_new',
            'maintenance_update',
            'maintenance_assigned',
            'maintenance_completed',
            'maintenance_cancelled',
            'chat_message',
            'rent_due',
            'rent_overdue',
            'rent_paid',
            'tenant_invitation',
            'tenant_registered',
            'service_provider_approved',
            'lease_expiring',
            'lease_terminated',
            'property_status_change'
        ),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 255]
        }
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: [1, 1000]
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
    data: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        validate: {
            isValidData(value) {
                if (value && typeof value !== 'object') {
                    throw new Error('Data must be a valid JSON object');
                }
            }
        }
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
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
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: true
        }
    }
}, {
    timestamps: true,
    underscored: true,
    hooks: {
        beforeCreate: async (notification) => {
            // Set priority based on type
            if (['rent_overdue', 'maintenance_emergency'].includes(notification.type)) {
                notification.priority = 'urgent';
            } else if (['rent_due', 'maintenance_assigned'].includes(notification.type)) {
                notification.priority = 'high';
            }

            // Set expiration for certain types
            if (['rent_due', 'rent_overdue'].includes(notification.type)) {
                notification.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            }
        }
    },
    indexes: [
        {
            fields: ['user_id']
        },
        {
            fields: ['property_id']
        },
        {
            fields: ['maintenance_request_id']
        },
        {
            fields: ['type']
        },
        {
            fields: ['is_read']
        },
        {
            fields: ['priority']
        }
    ]
});

// Define relationships
Notification.belongsTo(User, { foreignKey: 'userId' });
Notification.belongsTo(Property, { foreignKey: 'propertyId' });
Notification.belongsTo(MaintenanceRequest, { foreignKey: 'maintenanceRequestId' });
Notification.belongsTo(Tenant, { foreignKey: 'tenantId' });

// Instance methods
Notification.prototype.markAsRead = async function() {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
};

Notification.prototype.isExpired = function() {
    return this.expiresAt && this.expiresAt < new Date();
};

// Static methods
Notification.findUnreadByUser = function(userId) {
    return this.findAll({
        where: {
            userId,
            isRead: false,
            [sequelize.Sequelize.Op.or]: [
                { expiresAt: null },
                { expiresAt: { [sequelize.Sequelize.Op.gt]: new Date() } }
            ]
        },
        order: [
            ['priority', 'DESC'],
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: Property,
                attributes: ['id', 'name', 'address']
            },
            {
                model: MaintenanceRequest,
                attributes: ['id', 'category', 'status']
            }
        ]
    });
};

Notification.findByUser = function(userId, limit = 50, offset = 0) {
    return this.findAll({
        where: {
            userId,
            [sequelize.Sequelize.Op.or]: [
                { expiresAt: null },
                { expiresAt: { [sequelize.Sequelize.Op.gt]: new Date() } }
            ]
        },
        order: [
            ['priority', 'DESC'],
            ['createdAt', 'DESC']
        ],
        limit,
        offset,
        include: [
            {
                model: Property,
                attributes: ['id', 'name', 'address']
            },
            {
                model: MaintenanceRequest,
                attributes: ['id', 'category', 'status']
            }
        ]
    });
};

Notification.markAllAsRead = async function(userId) {
    const now = new Date();
    await this.update(
        {
            isRead: true,
            readAt: now
        },
        {
            where: {
                userId,
                isRead: false
            }
        }
    );
};

Notification.createBatch = async function(notifications) {
    return await this.bulkCreate(notifications, {
        returning: true,
        include: [
            {
                model: Property,
                attributes: ['id', 'name', 'address']
            },
            {
                model: MaintenanceRequest,
                attributes: ['id', 'category', 'status']
            }
        ]
    });
};

Notification.findByType = function(type, limit = 50, offset = 0) {
    return this.findAll({
        where: {
            type,
            [sequelize.Sequelize.Op.or]: [
                { expiresAt: null },
                { expiresAt: { [sequelize.Sequelize.Op.gt]: new Date() } }
            ]
        },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        include: [
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
                model: Property,
                attributes: ['id', 'name', 'address']
            }
        ]
    });
};

Notification.cleanupExpired = async function() {
    const now = new Date();
    await this.destroy({
        where: {
            expiresAt: {
                [sequelize.Sequelize.Op.lt]: now
            }
        }
    });
};

module.exports = Notification; 