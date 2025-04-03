const { AppError } = require('../utils/error-handler.util');
const { uploadToS3, deleteFromS3 } = require('../config/storage.config');
const Property = require('../models/property.model');
const Tenant = require('../models/tenant.model');
const User = require('../models/user.model');
const logger = require('../utils/logger.util');

class PropertyService {
    static async createProperty(ownerId, propertyData) {
        try {
            const property = await Property.create({
                ...propertyData,
                ownerId
            });

            logger.info(`Property created successfully: ${property.id}`);
            return property;
        } catch (error) {
            logger.error('Error creating property:', error);
            throw error;
        }
    }

    static async updateProperty(propertyId, ownerId, updateData) {
        try {
            const property = await Property.findOne({
                where: { id: propertyId, ownerId }
            });

            if (!property) {
                throw new AppError('Property not found', 404);
            }

            await property.update(updateData);
            logger.info(`Property updated successfully: ${propertyId}`);
            return property;
        } catch (error) {
            logger.error('Error updating property:', error);
            throw error;
        }
    }

    static async deleteProperty(propertyId, ownerId) {
        try {
            const property = await Property.findOne({
                where: { id: propertyId, ownerId }
            });

            if (!property) {
                throw new AppError('Property not found', 404);
            }

            // Delete property images from S3
            if (property.images) {
                for (const imageUrl of property.images) {
                    await deleteFromS3(imageUrl);
                }
            }

            await property.destroy();
            logger.info(`Property deleted successfully: ${propertyId}`);
            return true;
        } catch (error) {
            logger.error('Error deleting property:', error);
            throw error;
        }
    }

    static async getProperty(propertyId) {
        try {
            const property = await Property.findByPk(propertyId, {
                include: [
                    { model: User, as: 'owner', attributes: ['id', 'firstName', 'lastName', 'email'] },
                    { model: Tenant, include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }] }
                ]
            });

            if (!property) {
                throw new AppError('Property not found', 404);
            }

            return property;
        } catch (error) {
            logger.error('Error getting property:', error);
            throw error;
        }
    }

    static async getOwnerProperties(ownerId) {
        try {
            const properties = await Property.findAll({
                where: { ownerId },
                include: [
                    { model: Tenant, include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }] }
                ]
            });

            return properties;
        } catch (error) {
            logger.error('Error getting owner properties:', error);
            throw error;
        }
    }

    static async uploadPropertyImages(propertyId, ownerId, files) {
        try {
            const property = await Property.findOne({
                where: { id: propertyId, ownerId }
            });

            if (!property) {
                throw new AppError('Property not found', 404);
            }

            const imageUrls = [];
            for (const file of files) {
                const imageUrl = await uploadToS3(file, `properties/${propertyId}`);
                imageUrls.push(imageUrl);
            }

            property.images = [...(property.images || []), ...imageUrls];
            await property.save();

            logger.info(`Property images uploaded successfully: ${propertyId}`);
            return property;
        } catch (error) {
            logger.error('Error uploading property images:', error);
            throw error;
        }
    }

    static async deletePropertyImage(propertyId, ownerId, imageUrl) {
        try {
            const property = await Property.findOne({
                where: { id: propertyId, ownerId }
            });

            if (!property) {
                throw new AppError('Property not found', 404);
            }

            if (!property.images || !property.images.includes(imageUrl)) {
                throw new AppError('Image not found', 404);
            }

            await deleteFromS3(imageUrl);
            property.images = property.images.filter(url => url !== imageUrl);
            await property.save();

            logger.info(`Property image deleted successfully: ${propertyId}`);
            return property;
        } catch (error) {
            logger.error('Error deleting property image:', error);
            throw error;
        }
    }

    static async updatePropertyStatus(propertyId, ownerId, status) {
        try {
            const property = await Property.findOne({
                where: { id: propertyId, ownerId }
            });

            if (!property) {
                throw new AppError('Property not found', 404);
            }

            if (!['available', 'occupied', 'maintenance', 'inactive'].includes(status)) {
                throw new AppError('Invalid status', 400);
            }

            property.status = status;
            await property.save();

            logger.info(`Property status updated successfully: ${propertyId}`);
            return property;
        } catch (error) {
            logger.error('Error updating property status:', error);
            throw error;
        }
    }
}

module.exports = PropertyService; 