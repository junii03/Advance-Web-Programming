import express from 'express';
import { AppError } from '../middleware/errorHandler.js';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import { getSocketNotificationService } from '../services/socketNotificationService.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notification management
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of notifications per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by notification type
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 */

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const { page = 1, limit = 20, type } = req.query;

        const user = await User.findById(req.user.id);

        // Create sample notifications if none exist
        if (!user.notifications || user.notifications.length === 0) {
            user.notifications = [
                {
                    title: 'Welcome to HBL Digital Banking',
                    message: 'Your account has been successfully set up. Start exploring our digital banking features.',
                    type: 'system',
                    read: false,
                    createdAt: new Date()
                },
                {
                    title: 'Security Alert',
                    message: 'Your account was accessed from a new device. If this wasn\'t you, please contact us immediately.',
                    type: 'security',
                    read: false,
                    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
                }
            ];
            await user.save();
        }

        let notifications = user.notifications || [];

        // Filter by type if specified
        if (type) {
            notifications = notifications.filter(n => n.type === type);
        }

        // Sort by creation date (newest first)
        notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Paginate
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedNotifications = notifications.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            count: paginatedNotifications.length,
            total: notifications.length,
            page: parseInt(page),
            pages: Math.ceil(notifications.length / parseInt(limit)),
            data: paginatedNotifications
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 */

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user.notifications || user.notifications.length === 0) {
            return next(new AppError('Notification not found', 404));
        }

        const notification = user.notifications.id(req.params.id);
        if (!notification) {
            return next(new AppError('Notification not found', 404));
        }

        notification.read = true;
        notification.readAt = new Date();
        await user.save();

        logger.info(`Notification marked as read: ${req.params.id} by user: ${req.user.email}`);

        // Emit WebSocket event for real-time update
        const socketService = getSocketNotificationService();
        if (socketService) {
            socketService.notifyUser(req.user.id, {
                title: 'Notification Read',
                message: 'A notification has been marked as read',
                type: 'system',
                data: {
                    notificationId: req.params.id,
                    action: 'marked_read'
                }
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (user.notifications && user.notifications.length > 0) {
            user.notifications.forEach(notification => {
                if (!notification.read) {
                    notification.read = true;
                    notification.readAt = new Date();
                }
            });
            await user.save();
        }

        logger.info(`All notifications marked as read by user: ${req.user.email}`);

        // Emit WebSocket event for real-time update
        const socketService = getSocketNotificationService();
        if (socketService) {
            socketService.notifyUser(req.user.id, {
                title: 'All Notifications Read',
                message: 'All your notifications have been marked as read',
                type: 'system',
                data: {
                    action: 'marked_all_read'
                }
            });
        }

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 */

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user.notifications || user.notifications.length === 0) {
            return next(new AppError('Notification not found', 404));
        }

        const notificationIndex = user.notifications.findIndex(n => n._id.toString() === req.params.id);
        if (notificationIndex === -1) {
            return next(new AppError('Notification not found', 404));
        }

        user.notifications.splice(notificationIndex, 1);
        await user.save();

        logger.info(`Notification deleted: ${req.params.id} by user: ${req.user.email}`);

        // Emit WebSocket event for real-time update
        const socketService = getSocketNotificationService();
        if (socketService) {
            socketService.notifyUser(req.user.id, {
                title: 'Notification Deleted',
                message: 'A notification has been removed',
                type: 'system',
                data: {
                    notificationId: req.params.id,
                    action: 'deleted'
                }
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     unreadCount:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
router.get('/unread-count', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const unreadCount = user.notifications
            ? user.notifications.filter(n => !n.read).length
            : 0;
        res.status(200).json({
            success: true,
            data: { unreadCount }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         type:
 *           type: string
 *         read:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

export default router;
