const PropertyService = require('../services/property.service');
const { AppError } = require('../utils/error-handler.util');
const logger = require('../utils/logger.util');

class PropertyController {
    static async createProperty(req, res, next) {
        try {
            const property = await PropertyService.createProperty(req.user.id, req.body);
            res.status(201).json({
                status: 'success',
                data: { property }
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateProperty(req, res, next) {
        try {
            const property = await PropertyService.updateProperty(
                req.params.propertyId,
                req.user.id,
                req.body
            );
            res.status(200).json({
                status: 'success',
                data: { property }
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteProperty(req, res, next) {
        try {
            await PropertyService.deleteProperty(req.params.propertyId, req.user.id);
            res.status(204).json({
                status: 'success',
                data: null
            });
        } catch (error) {
            next(error);
        }
    }

    static async getProperty(req, res, next) {
        try {
            const property = await PropertyService.getProperty(req.params.propertyId);
            res.status(200).json({
                status: 'success',
                data: { property }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getOwnerProperties(req, res, next) {
        try {
            const properties = await PropertyService.getOwnerProperties(req.user.id);
            res.status(200).json({
                status: 'success',
                data: { properties }
            });
        } catch (error) {
            next(error);
        }
    }

    static async uploadPropertyImages(req, res, next) {
        try {
            if (!req.files || req.files.length === 0) {
                throw new AppError('No files uploaded', 400);
            }

            const property = await PropertyService.uploadPropertyImages(
                req.params.propertyId,
                req.user.id,
                req.files
            );

            res.status(200).json({
                status: 'success',
                data: { property }
            });
        } catch (error) {
            next(error);
        }
    }

    static async deletePropertyImage(req, res, next) {
        try {
            const property = await PropertyService.deletePropertyImage(
                req.params.propertyId,
                req.user.id,
                req.body.imageUrl
            );

            res.status(200).json({
                status: 'success',
                data: { property }
            });
        } catch (error) {
            next(error);
        }
    }

    static async updatePropertyStatus(req, res, next) {
        try {
            const property = await PropertyService.updatePropertyStatus(
                req.params.propertyId,
                req.user.id,
                req.body.status
            );

            res.status(200).json({
                status: 'success',
                data: { property }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PropertyController;
