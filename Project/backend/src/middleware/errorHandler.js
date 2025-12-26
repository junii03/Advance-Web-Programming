import logger from '../utils/logger.js';

// Custom error class
export class AppError extends Error {
    constructor(message, statusCode, code = null, data = null) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.code = code; // Error code for specific error types
        this.data = data; // Additional error data

        Error.captureStackTrace(this, this.constructor);
    }
}

// Not found middleware
export const notFound = (req, res, next) => {
    const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
    next(error);
};

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
    let error = err;

    // Log error
    logger.error(`Error: ${err.message}`, {
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    // If it's not an AppError, create one
    if (!(err instanceof AppError)) {
        // Mongoose bad ObjectId
        if (err.name === 'CastError') {
            const message = 'Resource not found';
            error = new AppError(message, 404);
        }
        // Mongoose duplicate key
        else if (err.code === 11000) {
            const message = 'Duplicate field value entered';
            error = new AppError(message, 400);
        }
        // Mongoose validation error
        else if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(val => val.message).join(', ');
            error = new AppError(message, 400);
        }
        // JWT errors
        else if (err.name === 'JsonWebTokenError') {
            const message = 'Invalid token';
            error = new AppError(message, 401);
        }
        else if (err.name === 'TokenExpiredError') {
            const message = 'Token expired';
            error = new AppError(message, 401);
        }
        // Generic error
        else {
            error = new AppError(err.message || 'Server Error', 500);
        }
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
        code: error.code || null,
        data: error.data || null,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
