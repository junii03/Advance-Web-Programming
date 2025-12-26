import { createClient } from 'redis';
import logger from '../utils/logger.js';

let redisClient = null;

export const connectRedis = async () => {
    try {
        redisClient = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            password: process.env.REDIS_PASSWORD || undefined,
            retry_strategy: (options) => {
                if (options.error && options.error.code === 'ECONNREFUSED') {
                    logger.error('Redis server refused connection');
                    return new Error('Redis server refused connection');
                }
                if (options.total_retry_time > 1000 * 60 * 60) {
                    logger.error('Redis retry time exhausted');
                    return new Error('Retry time exhausted');
                }
                if (options.attempt > 10) {
                    logger.error('Redis max retry attempts reached');
                    return undefined;
                }
                return Math.min(options.attempt * 100, 3000);
            }
        });

        redisClient.on('error', (err) => {
            logger.error('Redis Client Error:', err);
        });

        redisClient.on('connect', () => {
            logger.info('🔗 Redis Client Connected');
        });

        redisClient.on('ready', () => {
            logger.info('🚀 Redis Client Ready');
        });

        redisClient.on('end', () => {
            logger.warn('Redis Client Connection Ended');
        });

        await redisClient.connect();

    } catch (error) {
        logger.error('❌ Error connecting to Redis:', error.message);
        // Don't exit process for Redis connection failure - the app can work without Redis
        logger.warn('⚠️ Continuing without Redis caching...');
    }
};

export const getRedisClient = () => {
    return redisClient;
};

export const disconnectRedis = async () => {
    if (redisClient && redisClient.isOpen) {
        try {
            await redisClient.quit();
            logger.info('Redis connection closed');
        } catch (error) {
            logger.error('Error closing Redis connection:', error);
        }
    }
};
