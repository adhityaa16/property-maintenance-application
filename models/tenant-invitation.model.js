const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');
const User = require('./user.model');
const Property = require('./property.model');

const TenantInvitation = sequelize.define('TenantInvitation', {
    invitation_id: {
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
    owner_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    invitation_token: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'expired'),
        defaultValue: 'pending'
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    accepted_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    tenant_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: User,
            key: 'user_id'
        }
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
        beforeSave: (invitation) => {
            if (invitation.changed()) {
                invitation.updated_at = new Date();
            }
        }
    }
});

// Define relationships
TenantInvitation.belongsTo(Property, { foreignKey: 'property_id' });
TenantInvitation.belongsTo(User, { as: 'owner', foreignKey: 'owner_id' });
TenantInvitation.belongsTo(User, { as: 'tenant', foreignKey: 'tenant_id' });

// Instance methods
TenantInvitation.prototype.accept = async function(tenantId) {
    this.status = 'accepted';
    this.tenant_id = tenantId;
    this.accepted_at = new Date();
    await this.save();
};

TenantInvitation.prototype.isExpired = function() {
    return new Date() > this.expires_at;
};

// Static methods
TenantInvitation.findPendingByEmail = function(email) {
    return this.findAll({
        where: {
            email,
            status: 'pending'
        },
        include: [
            {
                model: Property,
                attributes: ['property_id', 'name', 'address']
            },
            {
                model: User,
                as: 'owner',
                attributes: ['user_id', 'first_name', 'last_name', 'email']
            }
        ]
    });
};

TenantInvitation.findByToken = function(token) {
    return this.findOne({
        where: { invitation_token: token },
        include: [
            {
                model: Property,
                attributes: ['property_id', 'name', 'address']
            },
            {
                model: User,
                as: 'owner',
                attributes: ['user_id', 'first_name', 'last_name', 'email']
            }
        ]
    });
};

module.exports = TenantInvitation; 