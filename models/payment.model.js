const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');
const User = require('./user.model');
const Property = require('./property.model');

const Payment = sequelize.define('Payment', {
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
        type: DataTypes.ENUM('rent', 'deposit', 'maintenance', 'other'),
        allowNull: false
    },
    payment_method: {
        type: DataTypes.ENUM('credit_card', 'debit_card', 'bank_transfer', 'cash'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'processed', 'failed', 'refunded'),
        defaultValue: 'pending'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    payment_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    due_date: {
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
Payment.belongsTo(Property, { foreignKey: 'property_id' });
Payment.belongsTo(User, { as: 'tenant', foreignKey: 'tenant_id' });

// Static methods
Payment.findByTenant = function(tenantId) {
    return this.findAll({
        where: { tenant_id: tenantId },
        order: [['payment_date', 'DESC']]
    });
};

Payment.findByProperty = function(propertyId) {
    return this.findAll({
        where: { property_id: propertyId },
        order: [['payment_date', 'DESC']]
    });
};

Payment.findPending = function() {
    return this.findAll({
        where: { status: 'pending' },
        order: [['due_date', 'ASC']]
    });
};

// Instance methods
Payment.prototype.complete = async function(transactionId, paymentDetails) {
    this.status = 'processed';
    this.transaction_id = transactionId;
    this.payment_date = new Date();
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

module.exports = { Payment };
