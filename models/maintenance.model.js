const { DataTypes } = require('sequelize');
const { sequelize, Sequelize } = require('../config/database.config');
const User = require('./user.model');
const Property = require('./property.model');

/**
 * MaintenanceRequest Model
 * Implements the complete maintenance request workflow:
 * 1. Tenant submits request with details
 * 2. Tenant confirms the issue with additional details
 * 3. Owner reviews and assigns to service provider
 * 4. Service provider manages the work
 * 5. Completion with photo evidence
 */
const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
    request_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    property_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Property,
            key: 'property_id'
        }
    },
    tenant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    service_provider_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    // Category Selection
    category: {
        type: DataTypes.ENUM(
            'plumbing',
            'electrical',
            'hvac',
            'carpentry',
            'appliance',
            'other'
        ),
        allowNull: false
    },
    // Priority Level
    priority: {
        type: DataTypes.ENUM(
            'low',
            'medium',
            'high',
            'emergency'
        ),
        defaultValue: 'medium'
    },
    // Request Status Flow
    status: {
        type: DataTypes.ENUM(
            'submitted',          // Initial submission
            'pending_confirmation', // Waiting for tenant confirmation
            'confirmed',          // Tenant confirmed issue
            'assigned',           // Assigned to service provider
            'in_progress',        // Work started
            'completed',          // Work finished
            'cancelled'           // Request cancelled
        ),
        defaultValue: 'submitted'
    },
    // Issue Description
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    // Initial Photos
    issue_photos: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    // Tenant Confirmation Details
    confirmation_details: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
        comment: 'Additional details provided during confirmation'
    },
    confirmed_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    confirmation_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Service Provider Work Details
    service_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    scheduled_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Completion Evidence
    completion_photos: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    completion_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    completed_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Timestamps
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
        beforeUpdate: (request) => {
            request.updated_at = new Date();
        }
    }
});

// Define relationships
MaintenanceRequest.belongsTo(Property, { foreignKey: 'property_id' });
MaintenanceRequest.belongsTo(User, { as: 'tenant', foreignKey: 'tenant_id' });
MaintenanceRequest.belongsTo(User, { as: 'service_provider', foreignKey: 'service_provider_id' });

// Instance methods for request flow
MaintenanceRequest.prototype.submitRequest = async function(photos = []) {
    this.status = 'pending_confirmation';
    if (photos.length > 0) {
        this.issue_photos = photos;
    }
    await this.save();
};

MaintenanceRequest.prototype.confirmRequest = async function(userId, confirmationDetails) {
    this.status = 'confirmed';
    this.confirmed_by = userId;
    this.confirmation_date = new Date();
    this.confirmation_details = {
        ...confirmationDetails,
        confirmed_at: new Date()
    };
    await this.save();
};

MaintenanceRequest.prototype.assignServiceProvider = async function(serviceProviderId, scheduledDate = null) {
    this.service_provider_id = serviceProviderId;
    this.status = 'assigned';
    if (scheduledDate) {
        this.scheduled_date = scheduledDate;
    }
    await this.save();
};

MaintenanceRequest.prototype.updateStatus = async function(newStatus, notes = null) {
    this.status = newStatus;
    if (notes) {
        if (newStatus === 'completed') {
            this.completion_notes = notes;
            this.completed_date = new Date();
        } else {
            this.service_notes = notes;
        }
    }
    await this.save();
};

MaintenanceRequest.prototype.addPhotos = async function(photos, isCompletion = false) {
    if (isCompletion) {
        this.completion_photos = [...this.completion_photos, ...photos];
        if (!this.completed_date) {
            this.completed_date = new Date();
        }
    } else {
        this.issue_photos = [...this.issue_photos, ...photos];
    }
    await this.save();
};

// Static methods for querying
MaintenanceRequest.findByProperty = function(propertyId) {
    return this.findAll({
        where: { property_id: propertyId },
        include: [
            {
                model: User,
                as: 'tenant',
                attributes: ['user_id', 'first_name', 'last_name', 'email']
            },
            {
                model: User,
                as: 'service_provider',
                attributes: ['user_id', 'first_name', 'last_name', 'email']
            }
        ],
        order: [['created_at', 'DESC']]
    });
};

MaintenanceRequest.findByServiceProvider = function(serviceProviderId) {
    return this.findAll({
        where: {
            service_provider_id: serviceProviderId,
            status: {
                [Sequelize.Op.in]: ['assigned', 'in_progress']
            }
        },
        include: [
            {
                model: Property,
                attributes: ['property_id', 'name', 'address']
            },
            {
                model: User,
                as: 'tenant',
                attributes: ['user_id', 'first_name', 'last_name', 'email']
            }
        ],
        order: [['scheduled_date', 'ASC']]
    });
};

module.exports = MaintenanceRequest;
