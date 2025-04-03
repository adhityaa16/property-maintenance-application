const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validatePayment } = require('../middleware/validation.middleware');

// Apply auth middleware to all routes
router.use(authenticate);

// Payment routes
router.post('/', validatePayment, PaymentController.createPayment);
router.get('/tenant', PaymentController.getTenantPayments);
router.get('/property/:propertyId', PaymentController.getPropertyPayments);
router.post('/:paymentId/process', PaymentController.processPayment);
router.post('/:paymentId/refund', PaymentController.refundPayment);
router.get('/:paymentId/status', PaymentController.getPaymentStatus);

module.exports = router;
