const { DataTypes } = require('sequelize');
const { sequelize, Sequelize } = require('../config/database.config');
const User = require('./user.model');
const Property = require('./property.model');
const Tenant = require('./tenant.model');

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
            'carpentry',
            'appliance',
            'structural',
            'pest_control',
            'other'
        ),
        allowNull: false
    },
    priority: {
        type: DataTypes.ENUM(
            'low',
            'medium',
            'high',
            'emergency'
        ),
        defaultValue: 'medium'
    },
    status: {
        type: DataTypes.ENUM(
            'submitted',
            'pending_confirmation',
            'confirmed',
            'assigned',
            'in_progress',
            'completed',
            'cancelled'
        ),
        defaultValue: 'submitted'
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    issuePhotos: {
        type: DataTypes.JSON,
        defaultValue: [],
        validate: {
            isValidPhotos(value) {
                if (!Array.isArray(value)) {
                    throw new Error('Photos must be an array');
                }
                value.forEach(photo => {
                    if (!photo.url || !photo.type) {
                        throw new Error('Invalid photo format');
                    }
                });
            }
        }
    },
    confirmationDetails: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },
    confirmedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: User,
            key: 'id'
        }
    },
    confirmationDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: true
        }
    },
    serviceNotes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    scheduledDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: true
        }
    },
    estimatedCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    },
    actualCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    },
    completionPhotos: {
        type: DataTypes.JSON,
        defaultValue: [],
        validate: {
            isValidPhotos(value) {
                if (!Array.isArray(value)) {
                    throw new Error('Photos must be an array');
                }
                value.forEach(photo => {
                    if (!photo.url || !photo.type) {
                        throw new Error('Invalid photo format');
                    }
                });
            }
        }
    },
    completionNotes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    completedDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: true
        }
    },
    cancellationReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    cancelledBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: User,
            key: 'id'
        }
    },
    cancellationDate: {
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
        beforeCreate: async (request) => {
            const tenant = await Tenant.findOne({
                where: {
                    userId: request.tenantId,
                    propertyId: request.propertyId,
                    status: 'active'
                }
            });
            if (!tenant) {
                throw new Error('No active lease found for this tenant and property');
            }
        },
        afterCreate: async (request) => {
            await Property.update(
                { status: 'maintenance' },
                { where: { id: request.propertyId } }
            );
        },
        afterUpdate: async (request) => {
            if (request.status === 'completed' || request.status === 'cancelled') {
                await Property.update(
                    { status: 'occupied' },
                    { where: { id: request.propertyId } }
                );
            }
        }
    },
    indexes: [
        {
            fields: ['property_id']
        },
        {
            fields: ['tenant_id']
        },
        {
            fields: ['service_provider_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['category']
        }
    ]
});

// Define relationships
MaintenanceRequest.belongsTo(Property, { foreignKey: 'propertyId' });
MaintenanceRequest.belongsTo(User, { as: 'tenant', foreignKey: 'tenantId' });
MaintenanceRequest.belongsTo(User, { as: 'serviceProvider', foreignKey: 'serviceProviderId' });
MaintenanceRequest.belongsTo(Tenant, {
    foreignKey: 'tenantId',
    targetKey: 'userId'
});

// Instance methods
MaintenanceRequest.prototype.submitRequest = async function(photos = []) {
    this.status = 'pending_confirmation';
    if (photos.length > 0) {
        this.issuePhotos = photos;
    }
    await this.save();
};

MaintenanceRequest.prototype.confirmRequest = async function(userId, confirmationDetails) {
    this.status = 'confirmed';
    this.confirmedBy = userId;
    this.confirmationDate = new Date();
    this.confirmationDetails = {
        ...confirmationDetails,
        confirmedAt: new Date()
    };
    await this.save();
};

MaintenanceRequest.prototype.assignServiceProvider = async function(serviceProviderId, scheduledDate = null, estimatedCost = null) {
    this.serviceProviderId = serviceProviderId;
    this.status = 'assigned';
    if (scheduledDate) {
        this.scheduledDate = scheduledDate;
    }
    if (estimatedCost) {
        this.estimatedCost = estimatedCost;
    }
    await this.save();
};

MaintenanceRequest.prototype.updateStatus = async function(newStatus, notes = null) {
    this.status = newStatus;
    if (notes) {
        if (newStatus === 'completed') {
            this.completionNotes = notes;
            this.completedDate = new Date();
        } else {
            this.serviceNotes = notes;
        }
    }
    await this.save();
};

MaintenanceRequest.prototype.addPhotos = async function(photos, isCompletion = false) {
    if (isCompletion) {
        this.completionPhotos = [...this.completionPhotos, ...photos];
        if (!this.completedDate) {
            this.completedDate = new Date();
        }
    } else {
        this.issuePhotos = [...this.issuePhotos, ...photos];
    }
    await this.save();
};

MaintenanceRequest.prototype.cancel = async function(userId, reason) {
    this.status = 'cancelled';
    this.cancelledBy = userId;
    this.cancellationDate = new Date();
    this.cancellationReason = reason;
    await this.save();
};

MaintenanceRequest.prototype.setActualCost = async function(amount, notes = null) {
    this.actualCost = amount;
    if (notes) {
        this.completionNotes = this.completionNotes ? 
            `${this.completionNotes}\n${notes}` : 
            notes;
    }
    await this.save();
};

// Static methods
MaintenanceRequest.findByProperty = function(propertyId) {
    return this.findAll({
        where: { propertyId },
        include: [
            {
                model: User,
                as: 'tenant',
                attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
                model: User,
                as: 'serviceProvider',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }
        ],
        order: [['createdAt', 'DESC']]
    });
};

MaintenanceRequest.findByServiceProvider = function(serviceProviderId) {
    return this.findAll({
        where: {
            serviceProviderId,
            status: {
                [Sequelize.Op.in]: ['assigned', 'in_progress']
            }
        },
        include: [
            {
                model: Property,
                attributes: ['id', 'name', 'address']
            },
            {
                model: User,
                as: 'tenant',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }
        ],
        order: [['scheduledDate', 'ASC']]
    });
};

MaintenanceRequest.findByTenant = function(tenantId) {
    return this.findAll({
        where: { tenantId },
        include: [
            {
                model: Property,
                attributes: ['id', 'name', 'address']
            },
            {
                model: User,
                as: 'serviceProvider',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }
        ],
        order: [['createdAt', 'DESC']]
    });
};

MaintenanceRequest.findPending = function() {
    return this.findAll({
        where: {
            status: {
                [Sequelize.Op.in]: ['submitted', 'pending_confirmation', 'confirmed']
            }
        },
        include: [
            {
                model: Property,
                attributes: ['id', 'name', 'address']
            },
            {
                model: User,
                as: 'tenant',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }
        ],
        order: [
            ['priority', 'DESC'],
            ['createdAt', 'ASC']
        ]
    });
};

module.exports = MaintenanceRequest;
