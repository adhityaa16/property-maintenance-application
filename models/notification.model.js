const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');
const User = require('./user.model');
const Property = require('./property.model');
const MaintenanceRequest = require('./maintenance.model');

const Notification = sequelize.define('Notification', {
    notification_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    type: {
        type: DataTypes.ENUM(
            'maintenance_new',
            'maintenance_update',
            'maintenance_assigned',
            'maintenance_completed',
            'chat_message',
            'rent_due',
            'rent_overdue',
            'rent_paid',
            'tenant_invitation',
            'tenant_registered',
            'service_provider_approved'
        ),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
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
    data: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    read_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    hooks: {
        beforeUpdate: (notification) => {
            notification.updated_at = new Date();
        }
    }
});

// Define relationships
Notification.belongsTo(User, { foreignKey: 'user_id' });
Notification.belongsTo(Property, { foreignKey: 'property_id' });
Notification.belongsTo(MaintenanceRequest, { foreignKey: 'maintenance_request_id' });

// Instance methods
Notification.prototype.markAsRead = async function() {
    this.is_read = true;
    this.read_at = new Date();
    await this.save();
};

// Static methods
Notification.findUnreadByUser = function(userId) {
    return this.findAll({
        where: {
            user_id: userId,
            is_read: false
        },
        order: [['created_at', 'DESC']],
        include: [
            {
                model: Property,
                attributes: ['property_id', 'name', 'address']
            },
            {
                model: MaintenanceRequest,
                attributes: ['request_id', 'category', 'status']
            }
        ]
    });
};

Notification.findByUser = function(userId, limit = 50, offset = 0) {
    return this.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit,
        offset,
        include: [
            {
                model: Property,
                attributes: ['property_id', 'name', 'address']
            },
            {
                model: MaintenanceRequest,
                attributes: ['request_id', 'category', 'status']
            }
        ]
    });
};

Notification.markAllAsRead = async function(userId) {
    const now = new Date();
    await this.update(
        {
            is_read: true,
            read_at: now,
            updated_at: now
        },
        {
            where: {
                user_id: userId,
                is_read: false
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
                attributes: ['property_id', 'name', 'address']
            },
            {
                model: MaintenanceRequest,
                attributes: ['request_id', 'category', 'status']
            }
        ]
    });
};

module.exports = Notification; 