const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');
const User = require('./user.model');
const Property = require('./property.model');
const Tenant = require('./tenant.model');

const Payment = sequelize.define('Payment', {
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
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0.01
        }
    },
    paymentType: {
        type: DataTypes.ENUM('rent', 'deposit', 'maintenance', 'other'),
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.ENUM('credit_card', 'debit_card', 'bank_transfer', 'cash', 'check'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'processed', 'failed', 'refunded', 'cancelled'),
        defaultValue: 'pending'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    transactionId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    paymentDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: true
        }
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: true
        }
    },
    receiptNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    paymentDetails: {
        type: DataTypes.JSON,
        allowNull: true,
        validate: {
            isValidPaymentDetails(value) {
                if (value) {
                    if (this.paymentMethod === 'credit_card' || this.paymentMethod === 'debit_card') {
                        if (!value.last4 || !value.cardType) {
                            throw new Error('Card payment details must include last4 and cardType');
                        }
                    } else if (this.paymentMethod === 'bank_transfer') {
                        if (!value.accountLast4 || !value.bankName) {
                            throw new Error('Bank transfer details must include accountLast4 and bankName');
                        }
                    }
                }
            }
        }
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true,
    underscored: true,
    hooks: {
        beforeCreate: async (payment) => {
            if (payment.paymentType === 'rent') {
                const tenant = await Tenant.findOne({
                    where: {
                        userId: payment.tenantId,
                        propertyId: payment.propertyId,
                        status: 'active'
                    }
                });
                if (!tenant) {
                    throw new Error('No active lease found for this tenant and property');
                }
            }
        },
        afterCreate: async (payment) => {
            if (payment.paymentType === 'rent' && payment.status === 'processed') {
                const tenant = await Tenant.findOne({
                    where: {
                        userId: payment.tenantId,
                        propertyId: payment.propertyId
                    }
                });
                if (tenant) {
                    await tenant.addPayment(payment.amount, payment.paymentDate, payment.status, payment.description);
                }
            }
        }
    },
    indexes: [
        {
            fields: ['tenant_id']
        },
        {
            fields: ['property_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['payment_date']
        }
    ]
});

// Define relationships
Payment.belongsTo(Property, { foreignKey: 'propertyId' });
Payment.belongsTo(User, { as: 'tenant', foreignKey: 'tenantId' });
Payment.belongsTo(Tenant, { 
    foreignKey: 'tenantId',
    targetKey: 'userId'
});

// Static methods
Payment.findByTenant = function(tenantId) {
    return this.findAll({
        where: { tenantId },
        order: [['paymentDate', 'DESC']],
        include: [
            {
                model: Property,
                attributes: ['id', 'name', 'address']
            }
        ]
    });
};

Payment.findByProperty = function(propertyId) {
    return this.findAll({
        where: { propertyId },
        order: [['paymentDate', 'DESC']],
        include: [
            {
                model: User,
                as: 'tenant',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }
        ]
    });
};

Payment.findPending = function() {
    return this.findAll({
        where: { status: 'pending' },
        order: [['dueDate', 'ASC']],
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
        ]
    });
};

Payment.findOverdue = function() {
    return this.findAll({
        where: {
            status: 'pending',
            dueDate: {
                [sequelize.Sequelize.Op.lt]: new Date()
            }
        },
        order: [['dueDate', 'ASC']],
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
        ]
    });
};

// Instance methods
Payment.prototype.complete = async function(transactionId, paymentDetails, receiptNumber = null) {
    this.status = 'processed';
    this.transactionId = transactionId;
    this.paymentDate = new Date();
    this.paymentDetails = paymentDetails;
    if (receiptNumber) {
        this.receiptNumber = receiptNumber;
    }
    await this.save();
};

Payment.prototype.fail = async function(notes) {
    this.status = 'failed';
    this.notes = notes;
    await this.save();
};

Payment.prototype.refund = async function(notes) {
    this.status = 'refunded';
    this.notes = notes;
    await this.save();
};

Payment.prototype.cancel = async function(notes) {
    this.status = 'cancelled';
    this.notes = notes;
    await this.save();
};

Payment.prototype.isOverdue = function() {
    return this.status === 'pending' && this.dueDate && this.dueDate < new Date();
};

Payment.prototype.getDaysOverdue = function() {
    if (!this.isOverdue()) return 0;
    return Math.ceil((new Date() - this.dueDate) / (1000 * 60 * 60 * 24));
};

module.exports = Payment;
