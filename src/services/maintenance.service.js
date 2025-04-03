const { AppError } = require('../utils/error-handler.util');
const { uploadToS3, deleteFromS3 } = require('../config/storage.config');
const MaintenanceRequest = require('../models/maintenance-request.model');
const Property = require('../models/property.model');
const User = require('../models/user.model');
const logger = require('../utils/logger.util');

class MaintenanceService {
    static async createRequest(tenantId, propertyId, requestData) {
        try {
            // Verify tenant has access to property
            const property = await Property.findOne({
                include: [{
                    model: User,
                    as: 'tenants',
                    where: { id: tenantId }
                }],
                where: { id: propertyId }
            });

            if (!property) {
                throw new AppError('Tenant does not have access to this property', 403);
            }

            const request = await MaintenanceRequest.create({
                ...requestData,
                tenantId,
                propertyId
            });

            logger.info(`Maintenance request created: ${request.id}`);
            return request;
        } catch (error) {
            logger.error('Error creating maintenance request:', error);
            throw error;
        }
    }

    static async updateRequest(requestId, userId, updateData) {
        try {
            const request = await MaintenanceRequest.findByPk(requestId);
            if (!request) {
                throw new AppError('Maintenance request not found', 404);
            }

            // Verify user has permission to update
            if (request.tenantId !== userId && 
                request.serviceProviderId !== userId &&
                !(await this.isPropertyOwner(userId, request.propertyId))) {
                throw new AppError('Not authorized to update this request', 403);
            }

            await request.update(updateData);
            logger.info(`Maintenance request updated: ${requestId}`);
            return request;
        } catch (error) {
            logger.error('Error updating maintenance request:', error);
            throw error;
        }
    }

    static async getRequest(requestId, userId) {
        try {
            const request = await MaintenanceRequest.findByPk(requestId, {
                include: [
                    { model: Property },
                    { model: User, as: 'tenant', attributes: ['id', 'firstName', 'lastName', 'email'] },
                    { model: User, as: 'serviceProvider', attributes: ['id', 'firstName', 'lastName', 'email'] }
                ]
            });

            if (!request) {
                throw new AppError('Maintenance request not found', 404);
            }

            // Verify user has permission to view
            if (request.tenantId !== userId && 
                request.serviceProviderId !== userId &&
                !(await this.isPropertyOwner(userId, request.propertyId))) {
                throw new AppError('Not authorized to view this request', 403);
            }

            return request;
        } catch (error) {
            logger.error('Error getting maintenance request:', error);
            throw error;
        }
    }

    static async uploadRequestImages(requestId, userId, files) {
        try {
            const request = await MaintenanceRequest.findByPk(requestId);
            if (!request) {
                throw new AppError('Maintenance request not found', 404);
            }

            // Verify user has permission to upload
            if (request.tenantId !== userId && 
                request.serviceProviderId !== userId &&
                !(await this.isPropertyOwner(userId, request.propertyId))) {
                throw new AppError('Not authorized to upload images', 403);
            }

            const imageUrls = [];
            for (const file of files) {
                const imageUrl = await uploadToS3(file, `maintenance/${requestId}`);
                imageUrls.push(imageUrl);
            }

            // Update appropriate image array based on user role
            if (request.serviceProviderId === userId) {
                request.completionPhotos = [...(request.completionPhotos || []), ...imageUrls];
            } else {
                request.images = [...(request.images || []), ...imageUrls];
            }

            await request.save();
            logger.info(`Images uploaded for maintenance request: ${requestId}`);
            return request;
        } catch (error) {
            logger.error('Error uploading maintenance request images:', error);
            throw error;
        }
    }

    static async assignServiceProvider(requestId, ownerId, serviceProviderId) {
        try {
            const request = await MaintenanceRequest.findByPk(requestId);
            if (!request) {
                throw new AppError('Maintenance request not found', 404);
            }

            // Verify owner has permission
            if (!(await this.isPropertyOwner(ownerId, request.propertyId))) {
                throw new AppError('Not authorized to assign service provider', 403);
            }

            // Verify service provider exists and has correct role
            const serviceProvider = await User.findOne({
                where: { id: serviceProviderId, role: 'service_provider' }
            });

            if (!serviceProvider) {
                throw new AppError('Invalid service provider', 400);
            }

            await request.assignServiceProvider(serviceProviderId);
            logger.info(`Service provider assigned to maintenance request: ${requestId}`);
            return request;
        } catch (error) {
            logger.error('Error assigning service provider:', error);
            throw error;
        }
    }

    static async updateRequestStatus(requestId, userId, status, notes) {
        try {
            const request = await MaintenanceRequest.findByPk(requestId);
            if (!request) {
                throw new AppError('Maintenance request not found', 404);
            }

            // Verify user has permission to update status
            if (request.serviceProviderId !== userId &&
                !(await this.isPropertyOwner(userId, request.propertyId))) {
                throw new AppError('Not authorized to update status', 403);
            }

            await request.updateStatus(status, notes);
            logger.info(`Maintenance request status updated: ${requestId}`);
            return request;
        } catch (error) {
            logger.error('Error updating maintenance request status:', error);
            throw error;
        }
    }

    static async isPropertyOwner(userId, propertyId) {
        const property = await Property.findOne({
            where: { id: propertyId, ownerId: userId }
        });
        return !!property;
    }
}

module.exports = MaintenanceService; 