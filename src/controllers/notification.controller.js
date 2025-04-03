const NotificationService = require('../services/notification.service');
const { AppError } = require('../utils/error-handler.util');
const logger = require('../utils/logger.util');

class NotificationController {
    static async getNotifications(req, res, next) {
        try {
            const options = {
                unreadOnly: req.query.unread === 'true',
                limit: parseInt(req.query.limit) || undefined,
                offset: parseInt(req.query.offset) || undefined
            };

            const notifications = await NotificationService.getUserNotifications(
                req.user.id,
                options
            );

            res.status(200).json({
                status: 'success',
                data: { notifications }
            });
        } catch (error) {
            next(error);
        }
    }

    static async markAsRead(req, res, next) {
        try {
            const notification = await NotificationService.markAsRead(
                req.params.notificationId,
                req.user.id
            );

            res.status(200).json({
                status: 'success',
                data: { notification }
            });
        } catch (error) {
            next(error);
        }
    }

    static async markAllAsRead(req, res, next) {
        try {
            await NotificationService.markAllAsRead(req.user.id);

            res.status(200).json({
                status: 'success',
                message: 'All notifications marked as read'
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteNotification(req, res, next) {
        try {
            await NotificationService.deleteNotification(
                req.params.notificationId,
                req.user.id
            );

            res.status(204).json({
                status: 'success',
                data: null
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteAllNotifications(req, res, next) {
        try {
            await NotificationService.deleteAllNotifications(req.user.id);

            res.status(204).json({
                status: 'success',
                data: null
            });
        } catch (error) {
            next(error);
        }
    }

    static async getUnreadCount(req, res, next) {
        try {
            const notifications = await NotificationService.getUserNotifications(
                req.user.id,
                { unreadOnly: true }
            );

            res.status(200).json({
                status: 'success',
                data: { count: notifications.length }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = NotificationController; 