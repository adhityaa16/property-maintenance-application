const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');
const User = require('./user.model');

const Property = sequelize.define('Property', {
    property_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    owner_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    zip_code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('apartment', 'house', 'condo', 'commercial'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('available', 'occupied', 'maintenance', 'inactive'),
        defaultValue: 'available'
    },
    rent_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    security_deposit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    rent_due_day: {
        type: DataTypes.INTEGER, // Day of month when rent is due
        allowNull: false,
        validate: {
            min: 1,
            max: 31
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    amenities: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    current_tenant_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    lease_start_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    lease_end_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    maintenance_history: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
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
        beforeUpdate: (property) => {
            property.updated_at = new Date();
        }
    }
});

// Define relationships
Property.belongsTo(User, { as: 'owner', foreignKey: 'owner_id' });
Property.belongsTo(User, { as: 'current_tenant', foreignKey: 'current_tenant_id' });

// Static methods
Property.findByOwner = function(ownerId) {
    return this.findAll({
        where: { owner_id: ownerId },
        include: [
            {
                model: User,
                as: 'current_tenant',
                attributes: ['user_id', 'first_name', 'last_name', 'email', 'phone_number']
            }
        ]
    });
};

Property.findAvailable = function() {
    return this.findAll({
        where: {
            status: 'available',
            is_active: true
        }
    });
};

Property.findByTenant = function(tenantId) {
    return this.findAll({
        where: {
            current_tenant_id: tenantId,
            is_active: true
        },
        include: [
            {
                model: User,
                as: 'owner',
                attributes: ['user_id', 'first_name', 'last_name', 'email', 'phone_number']
            }
        ]
    });
};

// Instance methods
Property.prototype.isAvailable = function() {
    return this.status === 'available' && this.is_active;
};

Property.prototype.assignTenant = async function(tenantId, leaseStartDate, leaseEndDate) {
    this.current_tenant_id = tenantId;
    this.status = 'occupied';
    this.lease_start_date = leaseStartDate;
    this.lease_end_date = leaseEndDate;
    await this.save();
};

Property.prototype.removeTenant = async function() {
    this.current_tenant_id = null;
    this.status = 'available';
    this.lease_start_date = null;
    this.lease_end_date = null;
    await this.save();
};

Property.prototype.updateMaintenanceHistory = async function(maintenanceRequest) {
    this.maintenance_history = [
        ...this.maintenance_history,
        {
            request_id: maintenanceRequest.request_id,
            category: maintenanceRequest.category,
            status: maintenanceRequest.status,
            date: new Date()
        }
    ];
    await this.save();
};

Property.prototype.updateStatus = async function(newStatus, notes = null) {
    this.status = newStatus;
    if (notes) {
        this.maintenance_history = [
            ...this.maintenance_history,
            {
                status: newStatus,
                notes,
                date: new Date()
            }
        ];
    }
    await this.save();
};

module.exports = Property;
