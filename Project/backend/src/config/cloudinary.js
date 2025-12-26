import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import logger from '../utils/logger.js';

// Initialize Cloudinary configuration lazily
let isConfigured = false;

const configureCloudinary = () => {
    if (!isConfigured) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        isConfigured = true;
        logger.info(`Cloudinary configured with cloud_name: ${process.env.CLOUDINARY_NAME ? 'Present' : 'Missing'}`);
    }
};

// Test Cloudinary connection
export const testCloudinaryConnection = async () => {
    try {
        // Ensure Cloudinary is configured first
        configureCloudinary();

        const result = await cloudinary.api.ping();
        logger.info('Cloudinary connected successfully');
        return result;
    } catch (error) {
        logger.error('Cloudinary connection failed:', error.message);
        // Log more details for debugging
        if (error.message.includes('cloud_name')) {
            logger.error('Cloud name not found. Check CLOUDINARY_NAME in .env file');
        } else if (error.message.includes('api_key')) {
            logger.error('API key not found. Check CLOUDINARY_API_KEY in .env file');
        } else if (error.message.includes('api_secret')) {
            logger.error('API secret not found. Check CLOUDINARY_API_SECRET in .env file');
        }
        throw error;
    }
};

// File filter function
const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, and DOCX files are allowed.'));
    }
};

// Profile picture filter
const profilePictureFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG and PNG files are allowed for profile pictures.'));
    }
};

// Memory storage configuration
const storage = multer.memoryStorage();

// Multer configurations
export const uploadProfilePicture = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: profilePictureFilter
});

export const uploadDocument = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter
});

export const uploadGeneral = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter
});

// Upload to Cloudinary function
export const uploadToCloudinary = async (fileBuffer, options = {}) => {
    // Ensure Cloudinary is configured
    configureCloudinary();

    return new Promise((resolve, reject) => {
        const uploadOptions = {
            resource_type: 'auto',
            folder: 'hbl-banking/uploads',
            ...options
        };

        cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        ).end(fileBuffer);
    });
};

// Upload profile picture to Cloudinary
export const uploadProfilePictureToCloudinary = async (fileBuffer, userId) => {
    // Ensure Cloudinary is configured
    configureCloudinary();

    const options = {
        folder: 'hbl-banking/profile-pictures',
        public_id: `profile_${userId}_${Date.now()}`,
        transformation: [
            { width: 500, height: 500, crop: 'fill' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
        ]
    };

    return await uploadToCloudinary(fileBuffer, options);
};

// Upload document to Cloudinary
export const uploadDocumentToCloudinary = async (fileBuffer, userId, documentType) => {
    // Ensure Cloudinary is configured
    configureCloudinary();

    const options = {
        folder: 'hbl-banking/documents',
        public_id: `${documentType}_${userId}_${Date.now()}`,
        transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
        ]
    };

    return await uploadToCloudinary(fileBuffer, options);
};

// Utility functions
export const deleteFromCloudinary = async (publicId) => {
    try {
        // Ensure Cloudinary is configured
        configureCloudinary();

        const result = await cloudinary.uploader.destroy(publicId);
        logger.info(`File deleted from Cloudinary: ${publicId}`);
        return result;
    } catch (error) {
        logger.error(`Error deleting file from Cloudinary: ${error.message}`);
        throw error;
    }
};

export const getCloudinaryUrl = (publicId, options = {}) => {
    // Ensure Cloudinary is configured
    configureCloudinary();

    return cloudinary.url(publicId, {
        secure: true,
        ...options
    });
};

export default cloudinary;
