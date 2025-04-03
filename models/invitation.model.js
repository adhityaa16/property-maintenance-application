const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');

const Invitation = sequelize.define('Invitation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    propertyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Properties',
            key: 'id'
        }
    },
    ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'expired'),
        defaultValue: 'pending'
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    acceptedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

// Static methods
Invitation.findByToken = function(token) {
    return this.findOne({ where: { token } });
};

Invitation.findByEmail = function(email) {
    return this.findOne({ where: { email } });
};

module.exports = Invitation; 