const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');

const User = sequelize.define('User', {
    user_id: {
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
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('owner', 'tenant', 'service_provider'),
        allowNull: false
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    company_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    company_registration: {
        type: DataTypes.STRING,
        allowNull: true
    },
    service_categories: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    email_verification_token: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email_verification_expires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    reset_password_token: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reset_password_expires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    is_approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    approved_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'User',
            key: 'user_id'
        }
    },
    approved_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    last_login: {
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
        beforeSave: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
            if (user.changed()) {
                user.updated_at = new Date();
            }
        }
    }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.approve = async function(approverId) {
    this.is_approved = true;
    this.approved_by = approverId;
    this.approved_at = new Date();
    await this.save();
};

// Static methods
User.findByEmail = function(email) {
    return this.findOne({ where: { email } });
};

User.findServiceProviders = function(categories = null) {
    const where = { 
        role: 'service_provider',
        is_approved: true,
        is_active: true
    };
    
    if (categories) {
        where.service_categories = {
            [Sequelize.Op.overlap]: categories
        };
    }
    
    return this.findAll({ where });
};

User.findPendingApprovals = function() {
    return this.findAll({
        where: {
            role: 'service_provider',
            is_approved: false,
            is_active: true
        }
    });
};

module.exports = User;

