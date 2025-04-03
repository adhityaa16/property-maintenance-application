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
        type: DataTypes.ENUM('owner', 'tenant', 'service_provider', 'admin'),
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
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
        defaultValue: []
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
        beforeSave: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
            if (user.changed()) {
                user.updatedAt = new Date();
            }
        }
    }
});

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

module.exports = User;

