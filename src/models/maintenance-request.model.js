const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');
const User = require('./user.model');
const Property = require('./property.model');

const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    propertyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Property,
            key: 'id'
        }
    },
    tenantId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    serviceProviderId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: User,
            key: 'id'
        }
    },
    category: {
        type: DataTypes.ENUM(
            'plumbing',
            'electrical',
            'hvac',
            'appliance',
            'structural',
            'pest_control',
            'other'
        ),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'emergency'),
        allowNull: false,
        defaultValue: 'medium'
    },
    status: {
        type: DataTypes.ENUM(
            'pending',
            'confirmed',
            'assigned',
            'in_progress',
            'completed',
            'cancelled'
        ),
        defaultValue: 'pending'
    },
    images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    completionPhotos: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    estimatedCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    actualCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    scheduledDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    completedDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true,
    underscored: true
});

// Define relationships
MaintenanceRequest.belongsTo(Property, { foreignKey: 'propertyId' });
MaintenanceRequest.belongsTo(User, { as: 'tenant', foreignKey: 'tenantId' });
MaintenanceRequest.belongsTo(User, { as: 'serviceProvider', foreignKey: 'serviceProviderId' });

// Static methods
MaintenanceRequest.findByProperty = function(propertyId) {
    return this.findAll({
        where: { propertyId },
        include: [
            { model: User, as: 'tenant', attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'] },
            { model: User, as: 'serviceProvider', attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'] }
        ]
    });
};

MaintenanceRequest.findByTenant = function(tenantId) {
    return this.findAll({
        where: { tenantId },
        include: [
            { model: Property },
            { model: User, as: 'serviceProvider', attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'] }
        ]
    });
};

MaintenanceRequest.findByServiceProvider = function(serviceProviderId) {
    return this.findAll({
        where: { serviceProviderId },
        include: [
            { model: Property },
            { model: User, as: 'tenant', attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'] }
        ]
    });
};

// Instance methods
MaintenanceRequest.prototype.confirm = async function(notes = null) {
    this.status = 'confirmed';
    if (notes) {
        this.notes = this.notes ? `${this.notes}\n${notes}` : notes;
    }
    await this.save();
};

MaintenanceRequest.prototype.assignServiceProvider = async function(serviceProviderId) {
    this.serviceProviderId = serviceProviderId;
    this.status = 'assigned';
    await this.save();
};

MaintenanceRequest.prototype.updateStatus = async function(status, notes) {
    this.status = status;
    if (notes) {
        this.notes = this.notes ? `${this.notes}\n${notes}` : notes;
    }
    if (status === 'completed') {
        this.completedDate = new Date();
    }
    await this.save();
};

module.exports = MaintenanceRequest; 