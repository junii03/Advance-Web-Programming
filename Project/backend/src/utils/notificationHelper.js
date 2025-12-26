import { getSocketNotificationService } from '../services/socketNotificationService.js';
import logger from '../utils/logger.js';

/**
 * Helper function to create and emit notifications
 * Can be used from any route to send notifications to users
 */

/**
 * Create and send a notification to a user
 * @param {string} userId - Target user ID
 * @param {Object} notificationData - Notification object
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {string} notificationData.type - Notification type
 * @param {Object} [notificationData.data] - Additional data
 * @returns {Promise<Object>} Returns notification object
 */
export async function createUserNotification(userId, notificationData) {
    try {
        const notification = {
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type || 'system',
            read: false,
            createdAt: new Date(),
            data: notificationData.data || {},
        };

        // Emit real-time notification via WebSocket
        const socketService = getSocketNotificationService();
        if (socketService) {
            socketService.notifyUser(userId, notification);
            logger.info(`Real-time notification sent to user ${userId}: ${notification.title}`);
        } else {
            logger.warn('Socket notification service not available, notification will be stored only');
        }

        return notification;
    } catch (error) {
        logger.error(`Failed to create notification for user ${userId}:`, error);
        throw error;
    }
}

/**
 * Create and send notifications to multiple users
 * @param {Array<string>} userIds - Array of user IDs
 * @param {Object} notificationData - Notification object
 * @returns {Promise<Object>} Returns notification object
 */
export async function createBulkNotifications(userIds, notificationData) {
    try {
        const notification = {
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type || 'system',
            read: false,
            createdAt: new Date(),
            data: notificationData.data || {},
        };

        // Emit real-time notifications via WebSocket
        const socketService = getSocketNotificationService();
        if (socketService) {
            socketService.notifyUsers(userIds, notification);
            logger.info(`Real-time notifications sent to ${userIds.length} users: ${notification.title}`);
        } else {
            logger.warn('Socket notification service not available, notifications will be stored only');
        }

        return notification;
    } catch (error) {
        logger.error(`Failed to create bulk notifications:`, error);
        throw error;
    }
}

/**
 * Broadcast notification to all connected users
 * @param {Object} notificationData - Notification object
 * @returns {Promise<Object>} Returns notification object
 */
export async function broadcastNotification(notificationData) {
    try {
        const notification = {
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type || 'system',
            read: false,
            createdAt: new Date(),
            data: notificationData.data || {},
        };

        // Broadcast to all connected users
        const socketService = getSocketNotificationService();
        if (socketService) {
            socketService.broadcastNotification(notification);
            logger.info(`Broadcast notification sent: ${notification.title}`);
        } else {
            logger.warn('Socket notification service not available, notification will not be broadcast');
        }

        return notification;
    } catch (error) {
        logger.error(`Failed to broadcast notification:`, error);
        throw error;
    }
}

/**
 * Emit transaction notification
 * Example usage in transaction routes
 */
export async function notifyTransactionCompleted(userId, transactionData) {
    return createUserNotification(userId, {
        title: 'Transaction Completed',
        message: `Your transaction of ${transactionData.amount} has been completed successfully`,
        type: 'transaction',
        data: {
            transactionId: transactionData._id,
            amount: transactionData.amount,
            type: transactionData.type,
        },
    });
}

/**
 * Emit loan notification
 * Example usage in loan routes
 */
export async function notifyLoanStatusChanged(userId, loanData) {
    const statusMessages = {
        pending: 'Your loan application is pending review',
        approved: 'Congratulations! Your loan has been approved',
        rejected: 'Unfortunately, your loan application was rejected',
    };

    return createUserNotification(userId, {
        title: `Loan ${loanData.status}`,
        message: statusMessages[loanData.status] || 'Your loan status has been updated',
        type: 'loan',
        data: {
            loanId: loanData._id,
            status: loanData.status,
            amount: loanData.amount,
        },
    });
}

/**
 * Emit card notification
 * Example usage in card routes
 */
export async function notifyCardStatusChanged(userId, cardData) {
    const statusMessages = {
        active: 'Your card is now active',
        blocked: 'Your card has been blocked',
        expired: 'Your card has expired',
    };

    return createUserNotification(userId, {
        title: `Card ${cardData.status}`,
        message: statusMessages[cardData.status] || 'Your card status has been updated',
        type: 'card',
        data: {
            cardId: cardData._id,
            status: cardData.status,
            cardNumber: cardData.cardNumber,
        },
    });
}

/**
 * Emit security alert
 */
export async function notifySecurityAlert(userId, alertData) {
    return createUserNotification(userId, {
        title: 'Security Alert',
        message: alertData.message,
        type: 'security',
        data: alertData.data || {},
    });
}

export default {
    createUserNotification,
    createBulkNotifications,
    broadcastNotification,
    notifyTransactionCompleted,
    notifyLoanStatusChanged,
    notifyCardStatusChanged,
    notifySecurityAlert,
};
