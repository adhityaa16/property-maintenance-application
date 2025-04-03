const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const logger = require('../utils/logger.util');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const uploadFile = async (file, key) => {
    try {
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        });

        await s3Client.send(command);
        return key;
    } catch (error) {
        logger.error('S3 upload error:', error);
        throw error;
    }
};

const getFileUrl = async (key) => {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return url;
    } catch (error) {
        logger.error('S3 get URL error:', error);
        throw error;
    }
};

const deleteFile = async (key) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        });

        await s3Client.send(command);
    } catch (error) {
        logger.error('S3 delete error:', error);
        throw error;
    }
};

module.exports = {
    uploadFile,
    getFileUrl,
    deleteFile
}; 