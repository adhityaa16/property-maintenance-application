const { AppError } = require('../utils/error-handler.util');

const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('User not authenticated', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError('Access denied. Insufficient permissions.', 403));
        }

        next();
    };
};

const checkPropertyAccess = (req, res, next) => {
    if (!req.user) {
        return next(new AppError('User not authenticated', 401));
    }

    const propertyId = req.params.propertyId || req.body.propertyId;
    if (!propertyId) {
        return next(new AppError('Property ID is required', 400));
    }

    // Owners can access their own properties
    if (req.user.role === 'owner') {
        // Check if user owns the property
        if (req.user.properties && req.user.properties.includes(propertyId)) {
            return next();
        }
    }

    // Tenants can access their assigned properties
    if (req.user.role === 'tenant') {
        // Check if tenant is assigned to the property
        if (req.user.assignedProperties && req.user.assignedProperties.includes(propertyId)) {
            return next();
        }
    }

    return next(new AppError('Access denied. You do not have permission to access this property.', 403));
};

const checkMaintenanceAccess = (req, res, next) => {
    if (!req.user) {
        return next(new AppError('User not authenticated', 401));
    }

    const maintenanceId = req.params.maintenanceId || req.body.maintenanceId;
    if (!maintenanceId) {
        return next(new AppError('Maintenance ID is required', 400));
    }

    // Service providers can access their assigned maintenance requests
    if (req.user.role === 'service_provider') {
        // Check if service provider is assigned to the maintenance request
        if (req.user.assignedMaintenance && req.user.assignedMaintenance.includes(maintenanceId)) {
            return next();
        }
    }

    // Property owners can access maintenance requests for their properties
    if (req.user.role === 'owner') {
        // Check if maintenance request belongs to owner's property
        if (req.user.propertyMaintenance && req.user.propertyMaintenance.includes(maintenanceId)) {
            return next();
        }
    }

    // Tenants can access their own maintenance requests
    if (req.user.role === 'tenant') {
        // Check if tenant created the maintenance request
        if (req.user.maintenanceRequests && req.user.maintenanceRequests.includes(maintenanceId)) {
            return next();
        }
    }

    return next(new AppError('Access denied. You do not have permission to access this maintenance request.', 403));
};

module.exports = {
    checkRole,
    checkPropertyAccess,
    checkMaintenanceAccess
};
