import logger from '../utils/logger.js';

/**
 * Socket notification service
 * Handles emitting real-time notifications to clients
 */
class SocketNotificationService {
    constructor(io) {
        this.io = io;
    }

    /**
     * Send notification to a specific user
     * @param {string} userId - Target user ID
     * @param {Object} notification - Notification object
     * @param {string} notification.title - Notification title
     * @param {string} notification.message - Notification message
     * @param {string} notification.type - Notification type (transaction, account, card, loan, security, promo, system)
     * @param {Object} [notification.data] - Additional data
     */
    notifyUser(userId, notification) {
        if (!this.io) {
            logger.warn('Socket.IO not initialized, skipping real-time notification');
            return false;
        }

        const userRoom = `user-${userId}`;
        const payload = {
            _id: notification._id || Date.now().toString(),
            title: notification.title,
            message: notification.message,
            type: notification.type,
            read: notification.read || false,
            createdAt: notification.createdAt || new Date().toISOString(),
            data: notification.data,
        };

        try {
            this.io.to(userRoom).emit('notification:new', payload);
            logger.info(`Notification sent to user ${userId}: ${notification.title}`);
            return true;
        } catch (error) {
            logger.error(`Failed to send notification to user ${userId}:`, error);
            return false;
        }
    }

    /**
     * Send notification to multiple users
     * @param {Array<string>} userIds - Array of user IDs
     * @param {Object} notification - Notification object
     */
    notifyUsers(userIds, notification) {
        if (!this.io) {
            logger.warn('Socket.IO not initialized, skipping real-time notifications');
            return false;
        }

        const payload = {
            _id: notification._id || Date.now().toString(),
            title: notification.title,
            message: notification.message,
            type: notification.type,
            read: notification.read || false,
            createdAt: notification.createdAt || new Date().toISOString(),
            data: notification.data,
        };

        try {
            userIds.forEach((userId) => {
                const userRoom = `user-${userId}`;
                this.io.to(userRoom).emit('notification:new', payload);
            });
            logger.info(`Notification sent to ${userIds.length} users: ${notification.title}`);
            return true;
        } catch (error) {
            logger.error(`Failed to send notifications:`, error);
            return false;
        }
    }

    /**
     * Broadcast notification to all connected users
     * @param {Object} notification - Notification object
     */
    broadcastNotification(notification) {
        if (!this.io) {
            logger.warn('Socket.IO not initialized, skipping broadcast');
            return false;
        }

        const payload = {
            _id: notification._id || Date.now().toString(),
            title: notification.title,
            message: notification.message,
            type: notification.type,
            read: notification.read || false,
            createdAt: notification.createdAt || new Date().toISOString(),
            data: notification.data,
        };

        try {
            this.io.emit('notification:broadcast', payload);
            logger.info(`Broadcast notification: ${notification.title}`);
            return true;
        } catch (error) {
            logger.error(`Failed to broadcast notification:`, error);
            return false;
        }
    }

    /**
     * Send real-time status update to a user
     * @param {string} userId - Target user ID
     * @param {string} status - Status message
     */
    sendStatusUpdate(userId, status) {
        if (!this.io) return false;

        try {
            const userRoom = `user-${userId}`;
            this.io.to(userRoom).emit('status:update', {
                status,
                timestamp: new Date().toISOString(),
            });
            return true;
        } catch (error) {
            logger.error(`Failed to send status update to user ${userId}:`, error);
            return false;
        }
    }

    /**
     * Get total connected users count
     */
    getConnectedUsersCount() {
        if (!this.io) return 0;
        return this.io.engine.clientsCount;
    }

    /**
     * Get all rooms
     */
    getRooms() {
        if (!this.io) return {};
        return this.io.sockets.adapter.rooms;
    }
}

// Singleton instance
let socketNotificationService = null;

export function initializeSocketNotificationService(io) {
    socketNotificationService = new SocketNotificationService(io);
    return socketNotificationService;
}

export function getSocketNotificationService() {
    return socketNotificationService;
}

export default SocketNotificationService;
