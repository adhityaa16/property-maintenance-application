const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');

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
            model: 'Users',
            key: 'id'
        }
    },
    propertyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Properties',
            key: 'id'
        }
    },
    leaseStartDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    leaseEndDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    rentAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    securityDeposit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'pending', 'terminated', 'expired'),
        defaultValue: 'pending'
    },
    paymentHistory: {
        type: DataTypes.JSON,
        allowNull: true
    },
    documents: {
        type: DataTypes.JSON,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    validate: {
        leaseEndDateAfterStartDate() {
            if (this.leaseEndDate <= this.leaseStartDate) {
                throw new Error('Lease end date must be after start date');
            }
        }
    }
});

// Static methods
Tenant.findByUser = function(userId) {
    return this.findAll({ where: { userId } });
};

Tenant.findByProperty = function(propertyId) {
    return this.findAll({ where: { propertyId } });
};

Tenant.findActive = function() {
    return this.findAll({ where: { status: 'active' } });
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
    this.notes = `${this.notes}\nLease terminated on ${terminationDate}. Reason: ${reason}`;
    await this.save();
};

module.exports = Tenant; 