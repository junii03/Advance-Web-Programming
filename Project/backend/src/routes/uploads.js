import express from 'express';
import { body, validationResult } from 'express-validator';
import { AppError } from '../middleware/errorHandler.js';
import { protect } from '../middleware/auth.js';
import {
    uploadProfilePicture,
    uploadDocument,
    uploadGeneral,
    uploadProfilePictureToCloudinary,
    uploadDocumentToCloudinary,
    uploadToCloudinary,
    deleteFromCloudinary
} from '../config/cloudinary.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const router = express.Router();

// @desc    Upload profile picture
// @route   POST /api/uploads/profile-picture
// @access  Private
router.post('/profile-picture', protect, (req, res, next) => {
    uploadProfilePicture.single('profilePicture')(req, res, (err) => {
        if (err) {
            return next(new AppError(err.message, 400));
        }

        handleProfilePictureUpload(req, res, next);
    });
});

const handleProfilePictureUpload = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError('Please select a file to upload', 400));
        }

        const user = await User.findById(req.user.id);

        // Delete old profile picture if exists
        if (user.profilePicture && user.profilePicture.publicId) {
            try {
                await deleteFromCloudinary(user.profilePicture.publicId);
            } catch (error) {
                logger.warn(`Failed to delete old profile picture: ${error.message}`);
            }
        }

        // Upload to Cloudinary
        const result = await uploadProfilePictureToCloudinary(req.file.buffer, req.user.id);

        // Update user with new profile picture
        user.profilePicture = {
            url: result.secure_url,
            publicId: result.public_id,
            uploadedAt: new Date()
        };

        await user.save();

        logger.info(`Profile picture uploaded for user: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Profile picture uploaded successfully',
            data: {
                url: result.secure_url,
                publicId: result.public_id
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload document
// @route   POST /api/uploads/document
// @access  Private
router.post('/document', protect, [
    body('documentType').notEmpty().withMessage('Document type is required')
        .isIn(['cnic_front', 'cnic_back', 'passport', 'utility_bill', 'bank_statement', 'salary_certificate', 'other'])
        .withMessage('Invalid document type'),
    body('description').optional().isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters')
], (req, res, next) => {
    uploadDocument.single('document')(req, res, (err) => {
        if (err) {
            return next(new AppError(err.message, 400));
        }

        handleDocumentUpload(req, res, next);
    });
});

const handleDocumentUpload = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        if (!req.file) {
            return next(new AppError('Please select a document to upload', 400));
        }

        const { documentType, description } = req.body;

        // Upload to Cloudinary
        const result = await uploadDocumentToCloudinary(req.file.buffer, req.user.id, documentType);

        const user = await User.findById(req.user.id);

        // Initialize documents array if it doesn't exist
        if (!user.documents) {
            user.documents = [];
        }

        // Add document to user's documents array
        const newDocument = {
            type: documentType,
            url: result.secure_url,
            publicId: result.public_id,
            originalName: req.file.originalname,
            description: description || '',
            uploadedAt: new Date(),
            verified: false
        };

        user.documents.push(newDocument);
        await user.save();

        logger.info(`Document uploaded for user: ${user.email}, type: ${documentType}`);

        res.status(200).json({
            success: true,
            message: 'Document uploaded successfully',
            data: newDocument
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's uploaded documents
// @route   GET /api/uploads/documents
// @access  Private
router.get('/documents', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('documents');

        res.status(200).json({
            success: true,
            count: user.documents ? user.documents.length : 0,
            data: user.documents || []
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Delete document
// @route   DELETE /api/uploads/document/:documentId
// @access  Private
router.delete('/document/:documentId', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user.documents) {
            return next(new AppError('No documents found', 404));
        }

        const documentIndex = user.documents.findIndex(
            doc => doc._id.toString() === req.params.documentId
        );

        if (documentIndex === -1) {
            return next(new AppError('Document not found', 404));
        }

        const document = user.documents[documentIndex];

        // Delete from Cloudinary
        try {
            await deleteFromCloudinary(document.publicId);
        } catch (error) {
            logger.warn(`Failed to delete document from Cloudinary: ${error.message}`);
        }

        // Remove from user's documents array
        user.documents.splice(documentIndex, 1);
        await user.save();

        logger.info(`Document deleted for user: ${user.email}, documentId: ${req.params.documentId}`);

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Upload general file
// @route   POST /api/uploads/file
// @access  Private
router.post('/file', protect, (req, res, next) => {
    uploadGeneral.single('file')(req, res, (err) => {
        if (err) {
            return next(new AppError(err.message, 400));
        }

        handleGeneralUpload(req, res, next);
    });
});

const handleGeneralUpload = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError('Please select a file to upload', 400));
        }

        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, {
            folder: 'hbl-banking/general',
            public_id: `upload_${req.user.id}_${Date.now()}`
        });

        logger.info(`File uploaded by user: ${req.user.email}, filename: ${req.file.originalname}`);

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                url: result.secure_url,
                publicId: result.public_id,
                originalName: req.file.originalname,
                size: req.file.size,
                format: result.format
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete profile picture
// @route   DELETE /api/uploads/profile-picture
// @access  Private
router.delete('/profile-picture', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user.profilePicture || !user.profilePicture.publicId) {
            return next(new AppError('No profile picture found', 404));
        }

        // Delete from Cloudinary
        try {
            await deleteFromCloudinary(user.profilePicture.publicId);
        } catch (error) {
            logger.warn(`Failed to delete profile picture from Cloudinary: ${error.message}`);
        }

        // Remove from user
        user.profilePicture = null;
        await user.save();

        logger.info(`Profile picture deleted for user: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Profile picture deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
