const MaintenanceService = require('../services/maintenance.service');
const { AppError } = require('../utils/error-handler.util');
const logger = require('../utils/logger.util');

class MaintenanceController {
    static async createRequest(req, res, next) {
        try {
            const request = await MaintenanceService.createRequest(
                req.user.id,
                req.body.propertyId,
                req.body
            );

            res.status(201).json({
                status: 'success',
                data: { request }
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateRequest(req, res, next) {
        try {
            const request = await MaintenanceService.updateRequest(
                req.params.requestId,
                req.user.id,
                req.body
            );

            res.status(200).json({
                status: 'success',
                data: { request }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getRequest(req, res, next) {
        try {
            const request = await MaintenanceService.getRequest(
                req.params.requestId,
                req.user.id
            );

            res.status(200).json({
                status: 'success',
                data: { request }
            });
        } catch (error) {
            next(error);
        }
    }

    static async uploadRequestImages(req, res, next) {
        try {
            if (!req.files || req.files.length === 0) {
                throw new AppError('No files uploaded', 400);
            }

            const request = await MaintenanceService.uploadRequestImages(
                req.params.requestId,
                req.user.id,
                req.files
            );

            res.status(200).json({
                status: 'success',
                data: { request }
            });
        } catch (error) {
            next(error);
        }
    }

    static async assignServiceProvider(req, res, next) {
        try {
            const request = await MaintenanceService.assignServiceProvider(
                req.params.requestId,
                req.user.id,
                req.body.serviceProviderId
            );

            res.status(200).json({
                status: 'success',
                data: { request }
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateRequestStatus(req, res, next) {
        try {
            const request = await MaintenanceService.updateRequestStatus(
                req.params.requestId,
                req.user.id,
                req.body.status,
                req.body.notes
            );

            res.status(200).json({
                status: 'success',
                data: { request }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getPropertyRequests(req, res, next) {
        try {
            const requests = await MaintenanceService.getPropertyRequests(
                req.params.propertyId,
                req.user.id
            );

            res.status(200).json({
                status: 'success',
                data: { requests }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getTenantRequests(req, res, next) {
        try {
            const requests = await MaintenanceService.getTenantRequests(req.user.id);

            res.status(200).json({
                status: 'success',
                data: { requests }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getServiceProviderRequests(req, res, next) {
        try {
            const requests = await MaintenanceService.getServiceProviderRequests(req.user.id);

            res.status(200).json({
                status: 'success',
                data: { requests }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = MaintenanceController;
