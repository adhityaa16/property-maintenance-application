const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');
const User = require('./user.model');
const Property = require('./property.model');

const RentPayment = sequelize.define('RentPayment', {
    payment_id: {
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
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    payment_type: {
        type: DataTypes.ENUM('rent', 'deposit', 'late_fee'),
        allowNull: false
    },
    payment_method: {
        type: DataTypes.ENUM('credit_card', 'debit_card', 'bank_transfer', 'cash'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending'
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    payment_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    late_fee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    payment_details: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    reminder_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    last_reminder_date: {
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
        beforeUpdate: (payment) => {
            payment.updated_at = new Date();
        }
    }
});

// Define relationships
RentPayment.belongsTo(Property, { foreignKey: 'property_id' });
RentPayment.belongsTo(User, { as: 'tenant', foreignKey: 'tenant_id' });

// Instance methods
RentPayment.prototype.markAsCompleted = async function(transactionId, paymentDetails) {
    this.status = 'completed';
    this.payment_date = new Date();
    this.transaction_id = transactionId;
    this.payment_details = paymentDetails;
    await this.save();
};

RentPayment.prototype.markAsFailed = async function(reason) {
    this.status = 'failed';
    this.notes = reason;
    await this.save();
};

RentPayment.prototype.sendReminder = async function() {
    this.reminder_sent = true;
    this.last_reminder_date = new Date();
    await this.save();
};

// Static methods
RentPayment.findByTenant = function(tenantId) {
    return this.findAll({
        where: { tenant_id: tenantId },
        order: [['due_date', 'DESC']],
        include: [
            {
                model: Property,
                attributes: ['property_id', 'name', 'address']
            }
        ]
    });
};

RentPayment.findByProperty = function(propertyId) {
    return this.findAll({
        where: { property_id: propertyId },
        order: [['due_date', 'DESC']],
        include: [
            {
                model: User,
                as: 'tenant',
                attributes: ['user_id', 'first_name', 'last_name', 'email']
            }
        ]
    });
};

RentPayment.findOverdue = function() {
    return this.findAll({
        where: {
            status: {
                [sequelize.Op.not]: ['completed', 'refunded']
            },
            due_date: {
                [sequelize.Op.lt]: new Date()
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
        ]
    });
};

RentPayment.findPending = function() {
    return this.findAll({
        where: {
            status: 'pending',
            due_date: {
                [sequelize.Op.gte]: new Date()
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
        ]
    });
};

module.exports = RentPayment; 