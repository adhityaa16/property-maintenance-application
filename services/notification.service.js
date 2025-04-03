const { AppError } = require('../utils/error-handler.util');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const { sendEmail } = require('../config/email.config');
const logger = require('../utils/logger.util');

class NotificationService {
    static async createNotification(userId, type, title, message, data = null, options = {}) {
        try {
            const notification = await Notification.create({
                userId,
                type,
                title,
                message,
                data,
                priority: options.priority || 'medium',
                expiresAt: options.expiresAt || null
            });

            // Send email notification if enabled for the user
            const user = await User.findByPk(userId);
            if (user && user.emailNotifications) {
                await this.sendEmailNotification(user.email, title, message);
            }

            // Emit socket event for real-time notification
            if (global.io) {
                global.io.to(`user_${userId}`).emit('notification', {
                    type: 'new_notification',
                    data: notification
                });
            }

            logger.info(`Notification created for user ${userId}: ${type}`);
            return notification;
        } catch (error) {
            logger.error('Error creating notification:', error);
            throw error;
        }
    }

    static async getUserNotifications(userId, options = {}) {
        try {
            const query = {
                where: { userId },
                order: [['createdAt', 'DESC']]
            };

            if (options.unreadOnly) {
                query.where.isRead = false;
            }

            if (options.limit) {
                query.limit = options.limit;
            }

            if (options.offset) {
                query.offset = options.offset;
            }

            const notifications = await Notification.findAll(query);
            return notifications;
        } catch (error) {
            logger.error('Error getting user notifications:', error);
            throw error;
        }
    }

    static async markAsRead(notificationId, userId) {
        try {
            const notification = await Notification.findOne({
                where: { id: notificationId, userId }
            });

            if (!notification) {
                throw new AppError('Notification not found', 404);
            }

            await notification.markAsRead();
            return notification;
        } catch (error) {
            logger.error('Error marking notification as read:', error);
            throw error;
        }
    }

    static async markAllAsRead(userId) {
        try {
            await Notification.update(
                { isRead: true },
                { where: { userId, isRead: false } }
            );

            return true;
        } catch (error) {
            logger.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    static async deleteNotification(notificationId, userId) {
        try {
            const notification = await Notification.findOne({
                where: { id: notificationId, userId }
            });

            if (!notification) {
                throw new AppError('Notification not found', 404);
            }

            await notification.destroy();
            return true;
        } catch (error) {
            logger.error('Error deleting notification:', error);
            throw error;
        }
    }

    static async deleteAllNotifications(userId) {
        try {
            await Notification.destroy({
                where: { userId }
            });

            return true;
        } catch (error) {
            logger.error('Error deleting all notifications:', error);
            throw error;
        }
    }

    static async sendEmailNotification(email, title, message) {
        try {
            await sendEmail({
                email,
                subject: title,
                text: message,
                html: `<h1>${title}</h1><p>${message}</p>`
            });
        } catch (error) {
            logger.error('Error sending email notification:', error);
            // Don't throw error as email notification is not critical
        }
    }

    // Helper methods for creating specific types of notifications
    static async createMaintenanceRequestNotification(userId, requestData) {
        return this.createNotification(
            userId,
            'maintenance_request',
            'New Maintenance Request',
            `A new maintenance request has been created for ${requestData.property.name}`,
            requestData,
            { priority: 'high' }
        );
    }

    static async createMaintenanceUpdateNotification(userId, requestData) {
        return this.createNotification(
            userId,
            'maintenance_update',
            'Maintenance Request Update',
            `The status of your maintenance request has been updated to ${requestData.status}`,
            requestData
        );
    }

    static async createRentReminderNotification(userId, rentData) {
        return this.createNotification(
            userId,
            'rent_reminder',
            'Rent Payment Reminder',
            `Your rent payment of $${rentData.amount} is due on ${rentData.dueDate}`,
            rentData,
            {
                priority: 'high',
                expiresAt: new Date(rentData.dueDate)
            }
        );
    }

    static async createChatMessageNotification(userId, messageData) {
        return this.createNotification(
            userId,
            'chat_message',
            'New Message',
            `You have a new message from ${messageData.senderName}`,
            messageData
        );
    }
}

module.exports = NotificationService;
