const express = require('express');
const router = express.Router();
const MaintenanceController = require('../controllers/maintenance.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validateMaintenanceRequest } = require('../middleware/validation.middleware');
const upload = require('../middleware/upload.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Create and manage maintenance requests
router.post(
    '/',
    authorize(['tenant']),
    validateMaintenanceRequest,
    MaintenanceController.createRequest
);

router.get(
    '/:requestId',
    MaintenanceController.getRequest
);

router.put(
    '/:requestId',
    validateMaintenanceRequest,
    MaintenanceController.updateRequest
);

// Upload images
router.post(
    '/:requestId/images',
    upload.array('images', 5),
    MaintenanceController.uploadRequestImages
);

// Assign service provider (owner only)
router.post(
    '/:requestId/assign',
    authorize(['owner']),
    MaintenanceController.assignServiceProvider
);

// Update request status
router.patch(
    '/:requestId/status',
    authorize(['owner', 'service_provider']),
    MaintenanceController.updateRequestStatus
);

// Get requests by property
router.get(
    '/property/:propertyId',
    MaintenanceController.getPropertyRequests
);

// Get tenant's requests
router.get(
    '/tenant/requests',
    authorize(['tenant']),
    MaintenanceController.getTenantRequests
);

// Get service provider's requests
router.get(
    '/provider/requests',
    authorize(['service_provider']),
    MaintenanceController.getServiceProviderRequests
);

module.exports = router;
