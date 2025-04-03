const express = require('express');
const router = express.Router();
const PropertyController = require('../controllers/property.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validateProperty } = require('../middleware/validation.middleware');
const upload = require('../middleware/upload.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Property CRUD routes
router.post('/', authorize(['owner']), validateProperty, PropertyController.createProperty);
router.get('/', authorize(['owner']), PropertyController.getOwnerProperties);
router.get('/:propertyId', PropertyController.getProperty);
router.put('/:propertyId', authorize(['owner']), validateProperty, PropertyController.updateProperty);
router.delete('/:propertyId', authorize(['owner']), PropertyController.deleteProperty);

// Property image routes
router.post(
    '/:propertyId/images',
    authorize(['owner']),
    upload.array('images', 5),
    PropertyController.uploadPropertyImages
);
router.delete(
    '/:propertyId/images',
    authorize(['owner']),
    PropertyController.deletePropertyImage
);

// Property status route
router.patch(
    '/:propertyId/status',
    authorize(['owner']),
    PropertyController.updatePropertyStatus
);

module.exports = router;
