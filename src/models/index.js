const { sequelize } = require('../config/database.config');
const fs = require('fs');
const path = require('path');
const User = require('./user.model');

const models = {};

// Import all models
fs.readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf('.') !== 0 &&
            file !== 'index.js' &&
            file.slice(-3) === '.js'
        );
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file));
        models[model.name] = model;
    });

// Set up associations
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

// Define model relationships here as we add more models
// Example:
// User.hasMany(Property);
// Property.belongsTo(User);

module.exports = {
    sequelize,
    ...models,
    User
}; 