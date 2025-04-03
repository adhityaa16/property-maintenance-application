const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');
const User = require('./user.model');
const Property = require('./property.model');

const Tenant = sequelize.define('Tenant', {
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
    propertyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Property,
            key: 'id'
        }
    },
    leaseStartDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true,
            notInPast(value) {
                if (value < new Date() && this.isNewRecord) {
                    throw new Error('Lease start date cannot be in the past for new leases');
                }
            }
        }
    },
    leaseEndDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true
        }
    },
    rentAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    securityDeposit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'pending', 'terminated', 'expired'),
        defaultValue: 'pending'
    },
    paymentHistory: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        validate: {
            isValidPaymentHistory(value) {
                if (!Array.isArray(value)) {
                    throw new Error('Payment history must be an array');
                }
                value.forEach(payment => {
                    if (!payment.amount || !payment.date || !payment.status) {
                        throw new Error('Invalid payment record');
                    }
                });
            }
        }
    },
    documents: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        validate: {
            isValidDocuments(value) {
                if (!Array.isArray(value)) {
                    throw new Error('Documents must be an array');
                }
                value.forEach(doc => {
                    if (!doc.name || !doc.url || !doc.type) {
                        throw new Error('Invalid document record');
                    }
                });
            }
        }
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    moveInInspectionDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    moveOutInspectionDate: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    underscored: true,
    validate: {
        leaseEndDateAfterStartDate() {
            if (this.leaseEndDate <= this.leaseStartDate) {
                throw new Error('Lease end date must be after start date');
            }
        }
    },
    hooks: {
        beforeCreate: async (tenant) => {
            const user = await User.findByPk(tenant.userId);
            if (!user || user.role !== 'tenant') {
                throw new Error('User must have tenant role');
            }
        },
        afterCreate: async (tenant) => {
            await Property.update(
                { currentTenantId: tenant.userId, status: 'occupied' },
                { where: { id: tenant.propertyId } }
            );
        },
        afterUpdate: async (tenant) => {
            if (tenant.status === 'terminated' || tenant.status === 'expired') {
                await Property.update(
                    { currentTenantId: null, status: 'available' },
                    { where: { id: tenant.propertyId } }
                );
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
            fields: ['status']
        }
    ]
});

// Define relationships
Tenant.belongsTo(User, { foreignKey: 'userId' });
Tenant.belongsTo(Property, { foreignKey: 'propertyId' });

// Static methods
Tenant.findByUser = function(userId) {
    return this.findAll({
        where: { userId },
        include: [
            {
                model: Property,
                attributes: ['id', 'name', 'address', 'rentAmount']
            }
        ]
    });
};

Tenant.findByProperty = function(propertyId) {
    return this.findAll({
        where: { propertyId },
        include: [
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
            }
        ]
    });
};

Tenant.findActive = function() {
    return this.findAll({
        where: { status: 'active' },
        include: [
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
            },
            {
                model: Property,
                attributes: ['id', 'name', 'address', 'rentAmount']
            }
        ]
    });
};

// Instance methods
Tenant.prototype.isLeaseActive = function() {
    const now = new Date();
    return this.status === 'active' && 
           this.leaseStartDate <= now && 
           this.leaseEndDate >= now;
};

Tenant.prototype.terminateLease = async function(terminationDate, reason) {
    this.status = 'terminated';
    this.leaseEndDate = terminationDate;
    this.notes = `${this.notes ? this.notes + '\n' : ''}Lease terminated on ${terminationDate}. Reason: ${reason}`;
    await this.save();
};

Tenant.prototype.addPayment = async function(amount, date, status = 'completed', notes = null) {
    this.paymentHistory = [
        ...this.paymentHistory,
        {
            amount,
            date,
            status,
            notes,
            createdAt: new Date()
        }
    ];
    await this.save();
};

Tenant.prototype.addDocument = async function(name, url, type, notes = null) {
    this.documents = [
        ...this.documents,
        {
            name,
            url,
            type,
            notes,
            uploadedAt: new Date()
        }
    ];
    await this.save();
};

Tenant.prototype.getRemainingDays = function() {
    const now = new Date();
    if (this.leaseEndDate <= now) return 0;
    return Math.ceil((this.leaseEndDate - now) / (1000 * 60 * 60 * 24));
};

module.exports = Tenant; 