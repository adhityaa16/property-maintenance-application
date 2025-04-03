const AWS = require('aws-sdk');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../utils/error-handler.util');
const logger = require('../utils/logger.util');

class UploadService {
    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });
        this.bucketName = process.env.AWS_BUCKET_NAME;
    }

    async uploadImage(file, folder = 'general', options = {}) {
        try {
            const {
                width = 1200,
                height = 1200,
                quality = 80,
                format = 'jpeg'
            } = options;

            // Process image with sharp
            let processedImage = sharp(file.buffer)
                .resize(width, height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .toFormat(format, { quality });

            // Convert to buffer
            const buffer = await processedImage.toBuffer();

            // Generate unique filename
            const filename = `${folder}/${uuidv4()}.${format}`;

            // Upload to S3
            const uploadResult = await this.s3.upload({
                Bucket: this.bucketName,
                Key: filename,
                Body: buffer,
                ContentType: `image/${format}`,
                ACL: 'public-read'
            }).promise();

            return {
                url: uploadResult.Location,
                key: uploadResult.Key,
                size: buffer.length
            };
        } catch (error) {
            logger.error('Error uploading image:', error);
            throw new AppError('Failed to upload image', 500);
        }
    }

    async uploadDocument(file, folder = 'documents') {
        try {
            // Generate unique filename
            const extension = file.originalname.split('.').pop();
            const filename = `${folder}/${uuidv4()}.${extension}`;

            // Upload to S3
            const uploadResult = await this.s3.upload({
                Bucket: this.bucketName,
                Key: filename,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: 'public-read'
            }).promise();

            return {
                url: uploadResult.Location,
                key: uploadResult.Key,
                size: file.size
            };
        } catch (error) {
            logger.error('Error uploading document:', error);
            throw new AppError('Failed to upload document', 500);
        }
    }

    async deleteFile(key) {
        try {
            await this.s3.deleteObject({
                Bucket: this.bucketName,
                Key: key
            }).promise();
        } catch (error) {
            logger.error('Error deleting file:', error);
            throw new AppError('Failed to delete file', 500);
        }
    }

    // Utility method to generate thumbnail
    async generateThumbnail(file, options = {}) {
        try {
            const {
                width = 200,
                height = 200,
                quality = 60,
                format = 'jpeg'
            } = options;

            const thumbnail = await sharp(file.buffer)
                .resize(width, height, {
                    fit: 'cover',
                    position: 'center'
                })
                .toFormat(format, { quality })
                .toBuffer();

            return thumbnail;
        } catch (error) {
            logger.error('Error generating thumbnail:', error);
            throw new AppError('Failed to generate thumbnail', 500);
        }
    }
}

module.exports = new UploadService();
