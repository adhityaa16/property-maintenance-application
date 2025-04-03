const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');

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
            model: 'Properties',
            key: 'id'
        }
    },
    tenantId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    serviceProviderId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
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
        allowNull: true
    },
    completionPhotos: {
        type: DataTypes.JSON,
        allowNull: true
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
});

// Static methods
MaintenanceRequest.findByProperty = function(propertyId) {
    return this.findAll({
        where: { propertyId },
        include: [
            { model: sequelize.models.User, as: 'tenant' },
            { model: sequelize.models.User, as: 'serviceProvider' }
        ]
    });
};

MaintenanceRequest.findByTenant = function(tenantId) {
    return this.findAll({
        where: { tenantId },
        include: [
            { model: sequelize.models.Property },
            { model: sequelize.models.User, as: 'serviceProvider' }
        ]
    });
};

MaintenanceRequest.findByServiceProvider = function(serviceProviderId) {
    return this.findAll({
        where: { serviceProviderId },
        include: [
            { model: sequelize.models.Property },
            { model: sequelize.models.User, as: 'tenant' }
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