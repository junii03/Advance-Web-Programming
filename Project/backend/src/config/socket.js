import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getRedisClient } from './redis.js';
import logger from '../utils/logger.js';

/**
 * Initialize Socket.IO with authentication and Redis adapter
 * @param {http.Server} server - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
export function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
            credentials: true,
            methods: ['GET', 'POST'],
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
    });

    // Optional: Add Redis adapter for horizontal scaling
    // Uncomment if running multiple instances
    // import { createAdapter } from '@socket.io/redis-adapter';
    // const pubClient = createClient({ host: process.env.REDIS_HOST || 'localhost', port: process.env.REDIS_PORT || 6379 });
    // const subClient = pubClient.duplicate();
    // io.adapter(createAdapter(pubClient, subClient));

    /**
     * Middleware: Authenticate socket connection with JWT
     */
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                logger.warn(`Socket connection attempt without token: ${socket.id}`);
                return next(new Error('Authentication error: No token provided'));
            }

            // Verify JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check if token is blacklisted in Redis
            const redisClient = getRedisClient();
            if (redisClient && redisClient.isOpen) {
                const isBlacklisted = await redisClient.get(`blacklist_${token}`);
                if (isBlacklisted) {
                    logger.warn(`Socket connection with revoked token: ${socket.id}`);
                    return next(new Error('Authentication error: Token has been revoked'));
                }
            }

            // Verify user exists and is active
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                logger.warn(`Socket connection with non-existent user: ${socket.id}`);
                return next(new Error('Authentication error: User not found'));
            }

            if (!user.isActive) {
                logger.warn(`Socket connection attempt from inactive user: ${user._id}`);
                return next(new Error('Authentication error: Account is deactivated'));
            }

            // Attach user to socket object for later access
            socket.userId = user._id.toString();
            socket.user = user;
            socket.token = token;

            logger.info(`Socket authenticated for user: ${user._id}`);
            next();
        } catch (error) {
            logger.error('Socket authentication error:', error.message);
            next(new Error(`Authentication error: ${error.message}`));
        }
    });

    return io;
}

/**
 * Setup Socket.IO event handlers
 * @param {Server} io - Socket.IO server instance
 */
export function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        const userId = socket.userId;
        const userRoom = `user-${userId}`;

        logger.info(`[${socket.id}] Socket connected for user ${userId}`);

        // User joins their personal notification room
        socket.join(userRoom);
        logger.info(`User ${userId} joined room: ${userRoom}`);

        // Notify client of successful connection
        socket.emit('connect:success', {
            message: 'Connected to notification service',
            userId,
            socketId: socket.id,
            timestamp: new Date().toISOString(),
        });

        /**
         * Event: Mark notification as read
         * Client can emit this to update notification status
         */
        socket.on('notification:read', async (data) => {
            try {
                const { notificationId } = data;
                if (!notificationId) {
                    socket.emit('notification:error', {
                        message: 'notificationId is required',
                    });
                    return;
                }

                logger.info(`User ${userId} marking notification as read: ${notificationId}`);
                // Could update database here if needed
                socket.emit('notification:read:success', { notificationId });
            } catch (error) {
                logger.error(`Error marking notification as read: ${error.message}`);
                socket.emit('notification:error', {
                    message: 'Failed to mark notification as read',
                });
            }
        });

        /**
         * Event: Mark all notifications as read
         */
        socket.on('notification:read-all', async () => {
            try {
                logger.info(`User ${userId} marking all notifications as read`);
                socket.emit('notification:read-all:success', {
                    message: 'All notifications marked as read',
                });
            } catch (error) {
                logger.error(`Error marking all notifications as read: ${error.message}`);
                socket.emit('notification:error', {
                    message: 'Failed to mark all notifications as read',
                });
            }
        });

        /**
         * Event: Ping (for connection health check)
         */
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: new Date().toISOString() });
        });

        /**
         * Event: User disconnects
         */
        socket.on('disconnect', () => {
            logger.info(`[${socket.id}] Socket disconnected for user ${userId}`);
        });

        /**
         * Event: Handle errors
         */
        socket.on('error', (error) => {
            logger.error(`Socket error for user ${userId}:`, error);
        });
    });

    logger.info('Socket.IO handlers setup complete');
}

export default { initializeSocket, setupSocketHandlers };
