const PaymentService = require('../services/payment.service');
const { AppError } = require('../utils/error-handler.util');
const logger = require('../utils/logger.util');

class PaymentController {
    static async createPayment(req, res, next) {
        try {
            const payment = await PaymentService.createPayment(
                req.user.id,
                req.body.propertyId,
                req.body
            );

            res.status(201).json({
                status: 'success',
                data: { payment }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getTenantPayments(req, res, next) {
        try {
            const payments = await PaymentService.getTenantPayments(req.user.id);

            res.status(200).json({
                status: 'success',
                data: { payments }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getPropertyPayments(req, res, next) {
        try {
            const payments = await PaymentService.getPropertyPayments(
                req.params.propertyId,
                req.user.id
            );

            res.status(200).json({
                status: 'success',
                data: { payments }
            });
        } catch (error) {
            next(error);
        }
    }

    static async processPayment(req, res, next) {
        try {
            const payment = await PaymentService.processPayment(
                req.params.paymentId,
                req.body
            );

            res.status(200).json({
                status: 'success',
                data: { payment }
            });
        } catch (error) {
            next(error);
        }
    }

    static async refundPayment(req, res, next) {
        try {
            const payment = await PaymentService.refundPayment(
                req.params.paymentId,
                req.body.notes
            );

            res.status(200).json({
                status: 'success',
                data: { payment }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getPaymentStatus(req, res, next) {
        try {
            const status = await PaymentService.getPaymentStatus(
                req.params.paymentId
            );

            res.status(200).json({
                status: 'success',
                data: { status }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PaymentController;
