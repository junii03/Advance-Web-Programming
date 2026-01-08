import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables first
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import configurations and utilities (after dotenv)
import { connectDB } from './config/database.js';
import { connectRedis } from './config/redis.js';
import { testCloudinaryConnection } from './config/cloudinary.js';
import { initializeSocket, setupSocketHandlers } from './config/socket.js';
import { initializeSocketNotificationService } from './services/socketNotificationService.js';
import logger from './utils/logger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { swaggerAuth } from './middleware/swaggerAuth.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import accountRoutes from './routes/accounts.js';
import transactionRoutes from './routes/transactions.js';
import cardRoutes from './routes/cards.js';
import loanRoutes from './routes/loans.js';
import branchRoutes from './routes/branches.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/uploads.js';
import reportRoutes from './routes/reports.js';

// Debug environment variables loading
console.log('Environment variables check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CLOUDINARY_NAME:', process.env.CLOUDINARY_NAME ? 'Present' : 'Missing');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing');

const app = express();
const server = createServer(app);

// Initialize Socket.IO with authentication
const io = initializeSocket(server);
setupSocketHandlers(io);
initializeSocketNotificationService(io);

// Load Swagger specs from YAML file
const swaggerFilePath = path.join(__dirname, '../swagger.yaml');
const swaggerSpecs = YAML.load(swaggerFilePath);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://hbl-clone-project.vercel.app',
    'https://hbl.junaidafzal.dev',
    'exp://',  // Expo mobile app
];

// If CORS_ORIGIN env var is set, add it to allowed origins
if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '0.0.0.0') {
    allowedOrigins.push(process.env.CORS_ORIGIN);
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl requests, etc.)
        if (!origin) {
            return callback(null, true);
        }

        // Check if origin matches any allowed origin exactly
        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed === 'exp://') {
                // Special case for Expo mobile apps
                return origin.startsWith('exp://');
            }
            return origin === allowed;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Request logging
app.use(requestLogger);

// Swagger Documentation with password protection and dynamic specs
app.use('/api-docs', swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'HBL Banking API Documentation',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'list',
        filter: true,
        showRequestHeaders: true
    }
}));

// API Documentation JSON endpoint (also password protected)
app.get('/api-docs.json', swaggerAuth, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpecs);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'HBL Banking API is running',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        documentation: '/api-docs'
    });
});

// WebSocket connectivity diagnostic endpoint
app.get('/socket-test', (req, res) => {
    res.status(200).json({
        status: 'WebSocket server is ready',
        socketIoPath: '/socket.io/',
        supportedTransports: ['websocket', 'polling'],
        message: 'Try connecting to /socket.io/ with auth token',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);

// Socket.IO for real-time features
io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('join-user-room', (userId) => {
        socket.join(`user-${userId}`);
        logger.info(`User ${userId} joined their room`);
    });

    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});

// Legacy code compatibility - keep this for backward compatibility
// But the main socket setup is now in config/socket.js

// Make io accessible to other modules
app.set('io', io);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Connect to databases
connectDB();
connectRedis();

// Test Cloudinary connection (non-blocking)
testCloudinaryConnection().catch(error => {
    logger.warn('Cloudinary connection test failed, but server will continue running');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    logger.info(`HBL Banking API server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`Frontend URL: ${process.env.CORS_ORIGIN}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
    // Don't crash the server, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    // For uncaught exceptions, we should gracefully shut down
    process.exit(1);
});

export default app;
