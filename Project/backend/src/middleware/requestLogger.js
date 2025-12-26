import logger from '../utils/logger.js';

export const requestLogger = (req, res, next) => {
    // Log the request
    logger.http(`${req.method} ${req.url} - ${req.ip}`, {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    // Log the response when it finishes
    const originalSend = res.send;
    res.send = function (data) {
        logger.http(`${req.method} ${req.url} - ${res.statusCode}`, {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: Date.now() - req.startTime
        });
        originalSend.call(this, data);
    };

    req.startTime = Date.now();
    next();
};
