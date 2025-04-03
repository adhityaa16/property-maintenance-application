const { Payment } = require('../models/payment.model');
const { AppError } = require('../utils/error-handler.util');
const logger = require('../utils/logger.util');

class PaymentService {
    async createPayment(paymentData) {
        try {
            const payment = await Payment.create(paymentData);
            return payment;
        } catch (error) {
            logger.error('Error creating payment:', error);
            throw new AppError('Failed to create payment', 500);
        }
    }

    async getTenantPayments(tenantId) {
        try {
            const payments = await Payment.findAll({
                where: { tenant_id: tenantId },
                order: [['created_at', 'DESC']]
            });
            return payments;
        } catch (error) {
            logger.error('Error fetching tenant payments:', error);
            throw new AppError('Failed to fetch tenant payments', 500);
        }
    }

    async getPropertyPayments(propertyId) {
        try {
            const payments = await Payment.findAll({
                where: { property_id: propertyId },
                order: [['created_at', 'DESC']]
            });
            return payments;
        } catch (error) {
            logger.error('Error fetching property payments:', error);
            throw new AppError('Failed to fetch property payments', 500);
        }
    }

    async processPayment(paymentId) {
        try {
            const payment = await Payment.findByPk(paymentId);
            if (!payment) {
                throw new AppError('Payment not found', 404);
            }
            
            // TODO: Implement actual payment processing logic
            payment.status = 'processed';
            await payment.save();
            
            return payment;
        } catch (error) {
            logger.error('Error processing payment:', error);
            throw new AppError('Failed to process payment', 500);
        }
    }

    async refundPayment(paymentId) {
        try {
            const payment = await Payment.findByPk(paymentId);
            if (!payment) {
                throw new AppError('Payment not found', 404);
            }
            
            // TODO: Implement actual refund logic
            payment.status = 'refunded';
            await payment.save();
            
            return payment;
        } catch (error) {
            logger.error('Error refunding payment:', error);
            throw new AppError('Failed to refund payment', 500);
        }
    }

    async getPaymentStatus(paymentId) {
        try {
            const payment = await Payment.findByPk(paymentId);
            if (!payment) {
                throw new AppError('Payment not found', 404);
            }
            return payment.status;
        } catch (error) {
            logger.error('Error fetching payment status:', error);
            throw new AppError('Failed to fetch payment status', 500);
        }
    }
}

module.exports = new PaymentService(); 