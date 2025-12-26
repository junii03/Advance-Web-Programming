import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import User from '../models/User.js';
import { getRedisClient } from '../config/redis.js';

// Protect routes - authentication middleware
export const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('Access denied. No token provided.', 401));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if token is blacklisted (Redis)
        const redisClient = getRedisClient();
        if (redisClient && redisClient.isOpen) {
            const isBlacklisted = await redisClient.get(`blacklist_${token}`);
            if (isBlacklisted) {
                return next(new AppError('Token has been revoked', 401));
            }
        }

        // Check if user still exists
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return next(new AppError('User no longer exists', 401));
        }

        // Check if user is active
        if (!user.isActive) {
            return next(new AppError('Account has been deactivated', 401));
        }

        req.user = user;
        next();
    } catch (error) {
        next(new AppError('Invalid token', 401));
    }
};

// Authorization middleware
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('Access denied. Insufficient permissions.', 403));
        }
        next();
    };
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (user && user.isActive) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};
