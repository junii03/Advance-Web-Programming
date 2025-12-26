import logger from '../utils/logger.js';

/**
 * Basic authentication middleware for Swagger documentation
 * Protects API documentation with username and password
 */
export const swaggerAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if authorization header is present
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
        return res.status(401).json({
            success: false,
            error: 'Authentication required to access API documentation'
        });
    }

    try {
        // Extract and decode credentials
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
        const [username, password] = credentials.split(':');

        // Get credentials from environment variables
        const validUsername = process.env.SWAGGER_USERNAME || 'admin';
        const validPassword = process.env.SWAGGER_PASSWORD || 'admin123';

        // Validate credentials
        if (username === validUsername && password === validPassword) {
            logger.info(`Swagger documentation accessed by: ${username}`);
            next();
        } else {
            logger.warn(`Failed Swagger authentication attempt with username: ${username}`);
            res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
    } catch (error) {
        logger.error('Error in Swagger authentication:', error);
        res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
        return res.status(401).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};
