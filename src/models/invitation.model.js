const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');
const User = require('./user.model');
const Property = require('./property.model');
const Tenant = require('./tenant.model');

const Invitation = sequelize.define('Invitation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    propertyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Property,
            key: 'id'
        }
    },
    ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    role: {
        type: DataTypes.ENUM('tenant', 'service_provider'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'expired', 'cancelled'),
        defaultValue: 'pending'
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true,
            isFuture(value) {
                if (value <= new Date()) {
                    throw new Error('Expiration date must be in the future');
                }
            }
        }
    },
    acceptedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: true
        }
    },
    cancelledAt: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: true
        }
    },
    cancelledBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: User,
            key: 'id'
        }
    },
    cancellationReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    leaseDetails: {
        type: DataTypes.JSON,
        allowNull: true,
        validate: {
            isValidLeaseDetails(value) {
                if (value && this.role === 'tenant') {
                    if (!value.rentAmount || !value.leaseStartDate || !value.leaseEndDate) {
                        throw new Error('Lease details must include rent amount and dates');
                    }
                }
            }
        }
    },
    serviceCategories: {
        type: DataTypes.JSON,
        allowNull: true,
        validate: {
            isValidCategories(value) {
                if (value && this.role === 'service_provider') {
                    if (!Array.isArray(value) || value.length === 0) {
                        throw new Error('Service provider must have at least one category');
                    }
                    const validCategories = [
                        'plumbing',
                        'electrical',
                        'hvac',
                        'appliance',
                        'structural',
                        'pest_control',
                        'other'
                    ];
                    if (value.some(cat => !validCategories.includes(cat))) {
                        throw new Error('Invalid service category');
                    }
                }
            }
        }
    }
}, {
    timestamps: true,
    underscored: true,
    hooks: {
        beforeCreate: async (invitation) => {
            if (invitation.role === 'tenant') {
                const existingTenant = await Tenant.findOne({
                    where: {
                        propertyId: invitation.propertyId,
                        status: 'active'
                    }
                });
                if (existingTenant) {
                    throw new Error('Property already has an active tenant');
                }
            }
        }
    },
    indexes: [
        {
            fields: ['email']
        },
        {
            fields: ['token']
        },
        {
            fields: ['property_id']
        },
        {
            fields: ['owner_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['role']
        }
    ]
});

// Define relationships
Invitation.belongsTo(Property, { foreignKey: 'propertyId' });
Invitation.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
Invitation.belongsTo(User, { as: 'cancelledByUser', foreignKey: 'cancelledBy' });

// Instance methods
Invitation.prototype.accept = async function() {
    this.status = 'accepted';
    this.acceptedAt = new Date();
    await this.save();
};

Invitation.prototype.cancel = async function(userId, reason) {
    this.status = 'cancelled';
    this.cancelledBy = userId;
    this.cancelledAt = new Date();
    this.cancellationReason = reason;
    await this.save();
};

Invitation.prototype.isExpired = function() {
    return this.expiresAt < new Date();
};

Invitation.prototype.isValid = function() {
    return this.status === 'pending' && !this.isExpired();
};

// Static methods
Invitation.findByToken = function(token) {
    return this.findOne({
        where: { token },
        include: [
            {
                model: Property,
                attributes: ['id', 'name', 'address']
            },
            {
                model: User,
                as: 'owner',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }
        ]
    });
};

Invitation.findByEmail = function(email) {
    return this.findAll({
        where: { email },
        include: [
            {
                model: Property,
                attributes: ['id', 'name', 'address']
            },
            {
                model: User,
                as: 'owner',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }
        ],
        order: [['createdAt', 'DESC']]
    });
};

Invitation.findByProperty = function(propertyId) {
    return this.findAll({
        where: { propertyId },
        include: [
            {
                model: User,
                as: 'owner',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }
        ],
        order: [['createdAt', 'DESC']]
    });
};

Invitation.findByOwner = function(ownerId) {
    return this.findAll({
        where: { ownerId },
        include: [
            {
                model: Property,
                attributes: ['id', 'name', 'address']
            }
        ],
        order: [['createdAt', 'DESC']]
    });
};

Invitation.cleanupExpired = async function() {
    const now = new Date();
    await this.update(
        { status: 'expired' },
        {
            where: {
                status: 'pending',
                expiresAt: {
                    [sequelize.Sequelize.Op.lt]: now
                }
            }
        }
    );
};

module.exports = Invitation; 