const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'landlord', 'tenant'),
        allowNull: false,
        defaultValue: 'tenant'
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            is: /^\+?[\d\s-]+$/
        }
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    companyRegistration: {
        type: DataTypes.STRING,
        allowNull: true
    },
    serviceCategories: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        validate: {
            isValidCategories(value) {
                const validCategories = [
                    'plumbing',
                    'electrical',
                    'hvac',
                    'appliance',
                    'structural',
                    'pest_control',
                    'other'
                ];
                if (!Array.isArray(value)) {
                    throw new Error('Service categories must be an array');
                }
                if (value.some(cat => !validCategories.includes(cat))) {
                    throw new Error('Invalid service category');
                }
            }
        }
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    emailVerificationToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    emailVerificationExpires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    approvedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'User',
            key: 'id'
        }
    },
    approvedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
            if (user.role === 'service_provider' && !user.companyName) {
                throw new Error('Company name is required for service providers');
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
            if (user.changed()) {
                user.updatedAt = new Date();
            }
        }
    },
    indexes: [
        {
            unique: true,
            fields: ['email']
        },
        {
            fields: ['role']
        },
        {
            fields: ['isApproved']
        }
    ],
    timestamps: true,
    underscored: true
});

// Define relationships
User.associate = (models) => {
    User.hasMany(models.Property, { 
        foreignKey: 'ownerId',
        as: 'ownedProperties'
    });

    User.hasMany(models.Property, {
        foreignKey: 'currentTenantId',
        as: 'rentedProperties'
    });

    User.hasMany(models.MaintenanceRequest, {
        foreignKey: 'tenantId',
        as: 'submittedRequests'
    });

    User.hasMany(models.MaintenanceRequest, {
        foreignKey: 'serviceProviderId',
        as: 'assignedRequests'
    });

    User.hasMany(models.Tenant, {
        foreignKey: 'userId',
        as: 'tenantInfo'
    });

    User.hasMany(models.Payment, {
        foreignKey: 'tenantId',
        as: 'payments'
    });

    User.hasMany(models.Chat, {
        foreignKey: 'senderId',
        as: 'sentMessages'
    });

    User.hasMany(models.Chat, {
        foreignKey: 'receiverId',
        as: 'receivedMessages'
    });

    User.hasMany(models.Notification, {
        foreignKey: 'userId',
        as: 'notifications'
    });

    User.hasMany(models.Invitation, {
        foreignKey: 'ownerId',
        as: 'sentInvitations'
    });
};

// Instance methods
User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
};

User.prototype.approve = async function(approverId) {
    this.isApproved = true;
    this.approvedBy = approverId;
    this.approvedAt = new Date();
    await this.save();
};

User.prototype.isServiceProvider = function() {
    return this.role === 'service_provider';
};

User.prototype.isOwner = function() {
    return this.role === 'owner';
};

User.prototype.isTenant = function() {
    return this.role === 'tenant';
};

User.prototype.isAdmin = function() {
    return this.role === 'admin';
};

User.prototype.canHandleCategory = function(category) {
    return this.isServiceProvider() && this.serviceCategories.includes(category);
};

User.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
};

// Static methods
User.findByEmail = function(email) {
    return this.findOne({ where: { email } });
};

User.findServiceProviders = function(categories = null) {
    const where = { 
        role: 'service_provider',
        isApproved: true,
        isActive: true
    };
    
    if (categories) {
        where.serviceCategories = {
            [Sequelize.Op.overlap]: categories
        };
    }
    
    return this.findAll({ where });
};

User.findPendingApprovals = function() {
    return this.findAll({
        where: {
            role: 'service_provider',
            isApproved: false,
            isActive: true
        }
    });
};

User.findActiveServiceProvidersForCategory = function(category) {
    return this.findAll({
        where: {
            role: 'service_provider',
            isApproved: true,
            isActive: true,
            serviceCategories: {
                [Sequelize.Op.contains]: [category]
            }
        }
    });
};

module.exports = User;

