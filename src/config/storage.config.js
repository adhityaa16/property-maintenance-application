const AWS = require('aws-sdk');
const logger = require('../utils/logger.util');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const uploadToS3 = async (file, folder) => {
    try {
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${folder}/${Date.now()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
        };

        const result = await s3.upload(params).promise();
        logger.info(`File uploaded successfully to S3: ${result.Location}`);
        return result.Location;
    } catch (error) {
        logger.error('Error uploading file to S3:', error);
        throw new Error('Failed to upload file');
    }
};

const deleteFromS3 = async (fileUrl) => {
    try {
        const key = fileUrl.split('/').slice(-2).join('/');
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        };

        await s3.deleteObject(params).promise();
        logger.info(`File deleted successfully from S3: ${fileUrl}`);
    } catch (error) {
        logger.error('Error deleting file from S3:', error);
        throw new Error('Failed to delete file');
    }
};

module.exports = {
    s3,
    uploadToS3,
    deleteFromS3
}; 