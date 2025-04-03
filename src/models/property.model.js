const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');

const Property = sequelize.define('Property', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('apartment', 'house', 'commercial', 'land'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('vacant', 'occupied', 'maintenance', 'unavailable'),
        defaultValue: 'vacant'
    },
    ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    currentTenantId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    indexes: [
        {
            fields: ['ownerId']
        },
        {
            fields: ['currentTenantId']
        },
        {
            fields: ['status']
        }
    ]
});

Property.associate = (models) => {
    Property.belongsTo(models.User, {
        foreignKey: 'ownerId',
        as: 'owner'
    });

    Property.belongsTo(models.User, {
        foreignKey: 'currentTenantId',
        as: 'currentTenant'
    });

    Property.hasMany(models.MaintenanceRequest, {
        foreignKey: 'propertyId',
        as: 'maintenanceRequests'
    });

    Property.hasMany(models.Tenant, {
        foreignKey: 'propertyId',
        as: 'tenants'
    });

    Property.hasMany(models.Payment, {
        foreignKey: 'propertyId',
        as: 'payments'
    });

    Property.hasMany(models.Notification, {
        foreignKey: 'propertyId',
        as: 'notifications'
    });

    Property.hasMany(models.Invitation, {
        foreignKey: 'propertyId',
        as: 'invitations'
    });
};

module.exports = Property;
