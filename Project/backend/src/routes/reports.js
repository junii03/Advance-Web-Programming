import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../middleware/errorHandler.js';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 3 // Max 3 files
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new AppError('Only image files are allowed', 400), false);
        }
    }
});

// Generate unique report ID
const generateReportId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `RPT-${timestamp}-${randomStr}`.toUpperCase();
};

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: User report management system
 */

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get user reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of reports per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [submitted, in_progress, resolved, closed]
 *         description: Filter by report status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by report category
 *     responses:
 *       200:
 *         description: List of user reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *       401:
 *         description: Unauthorized
 */

// @desc    Get user reports
// @route   GET /api/reports
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, category } = req.query;

        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        let reports = user.reports || [];

        // Filter by status
        if (status) {
            reports = reports.filter(report => report.status === status);
        }

        // Filter by category
        if (category) {
            reports = reports.filter(report => report.category === category);
        }

        // Sort by submission date (newest first)
        reports.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        // Paginate
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedReports = reports.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            count: paginatedReports.length,
            total: reports.length,
            page: parseInt(page),
            pages: Math.ceil(reports.length / parseInt(limit)),
            data: paginatedReports
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Submit a new report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - subject
 *               - description
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [account_issue, transaction_problem, card_issue, loan_problem, technical_issue, complaint, suggestion, other]
 *               subject:
 *                 type: string
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 3
 *     responses:
 *       201:
 *         description: Report submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Report'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

// @desc    Submit new report
// @route   POST /api/reports
// @access  Private
router.post('/', protect, upload.array('images', 3), [
    body('category').isIn(['account_issue', 'transaction_problem', 'card_issue', 'loan_problem', 'technical_issue', 'complaint', 'suggestion', 'other'])
        .withMessage('Please provide a valid category'),
    body('subject').notEmpty().withMessage('Subject is required')
        .isLength({ max: 200 }).withMessage('Subject cannot exceed 200 characters'),
    body('description').notEmpty().withMessage('Description is required')
        .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Please provide a valid priority level')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const { category, subject, description, priority = 'medium' } = req.body;
        const images = req.files || [];

        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Upload images to Cloudinary if provided
        const uploadedImages = [];
        if (images.length > 0) {
            try {
                for (const image of images) {
                    const uploadResult = await new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            {
                                folder: 'reports',
                                resource_type: 'image',
                                transformation: [
                                    { width: 800, height: 600, crop: 'limit' },
                                    { quality: 'auto' }
                                ]
                            },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }
                        );
                        uploadStream.end(image.buffer);
                    });

                    uploadedImages.push({
                        url: uploadResult.secure_url,
                        publicId: uploadResult.public_id,
                        uploadedAt: new Date()
                    });
                }
            } catch (uploadError) {
                logger.error('Image upload failed:', uploadError);
                return next(new AppError('Failed to upload images', 500));
            }
        }

        // Create new report
        const newReport = {
            reportId: generateReportId(),
            category,
            subject,
            description,
            priority,
            status: 'submitted',
            images: uploadedImages,
            submittedAt: new Date(),
            lastUpdated: new Date()
        };

        // Add report to user's reports array
        if (!user.reports) {
            user.reports = [];
        }
        user.reports.push(newReport);
        await user.save();

        logger.info(`New report submitted: ${newReport.reportId} by user: ${req.user.email}`);

        res.status(201).json({
            success: true,
            message: 'Report submitted successfully. We will review your report and get back to you soon.',
            data: newReport
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/reports/{reportId}:
 *   get:
 *     summary: Get specific report by ID
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Report'
 *       404:
 *         description: Report not found
 *       401:
 *         description: Unauthorized
 */

// @desc    Get specific report
// @route   GET /api/reports/:reportId
// @access  Private
router.get('/:reportId', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        const report = user.reports?.find(r => r.reportId === req.params.reportId);
        if (!report) {
            return next(new AppError('Report not found', 404));
        }

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/reports/{reportId}:
 *   put:
 *     summary: Update report (add comments/update description)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *     responses:
 *       200:
 *         description: Report updated successfully
 *       404:
 *         description: Report not found
 *       401:
 *         description: Unauthorized
 */

// @desc    Update report
// @route   PUT /api/reports/:reportId
// @access  Private
router.put('/:reportId', protect, [
    body('description').optional().isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Please provide a valid priority level')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        const reportIndex = user.reports?.findIndex(r => r.reportId === req.params.reportId);
        if (reportIndex === -1) {
            return next(new AppError('Report not found', 404));
        }

        const report = user.reports[reportIndex];

        // Only allow updates if report is not closed
        if (report.status === 'closed') {
            return next(new AppError('Cannot update a closed report', 400));
        }

        // Update allowed fields
        const { description, priority } = req.body;
        if (description) report.description = description;
        if (priority) report.priority = priority;
        report.lastUpdated = new Date();

        await user.save();

        logger.info(`Report updated: ${req.params.reportId} by user: ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Report updated successfully',
            data: report
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/reports/{reportId}:
 *   delete:
 *     summary: Delete report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *       404:
 *         description: Report not found
 *       401:
 *         description: Unauthorized
 */

// @desc    Delete report
// @route   DELETE /api/reports/:reportId
// @access  Private
router.delete('/:reportId', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        const reportIndex = user.reports?.findIndex(r => r.reportId === req.params.reportId);
        if (reportIndex === -1) {
            return next(new AppError('Report not found', 404));
        }

        const report = user.reports[reportIndex];

        // Only allow deletion if report is not in progress or resolved
        if (report.status === 'in_progress' || report.status === 'resolved') {
            return next(new AppError('Cannot delete a report that is being processed', 400));
        }

        // Delete images from Cloudinary if any
        if (report.images && report.images.length > 0) {
            try {
                for (const image of report.images) {
                    await cloudinary.uploader.destroy(image.publicId);
                }
            } catch (deleteError) {
                logger.warn('Failed to delete some images from Cloudinary:', deleteError);
            }
        }

        // Remove report from array
        user.reports.splice(reportIndex, 1);
        await user.save();

        logger.info(`Report deleted: ${req.params.reportId} by user: ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       properties:
 *         reportId:
 *           type: string
 *           example: "RPT-1234567890-ABC123"
 *         category:
 *           type: string
 *           enum: [account_issue, transaction_problem, card_issue, loan_problem, technical_issue, complaint, suggestion, other]
 *         subject:
 *           type: string
 *           maxLength: 200
 *         description:
 *           type: string
 *           maxLength: 2000
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         status:
 *           type: string
 *           enum: [submitted, in_progress, resolved, closed]
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               publicId:
 *                 type: string
 *               uploadedAt:
 *                 type: string
 *                 format: date-time
 *         submittedAt:
 *           type: string
 *           format: date-time
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *         resolution:
 *           type: object
 *           properties:
 *             resolvedAt:
 *               type: string
 *               format: date-time
 *             resolvedBy:
 *               type: string
 *             resolutionNote:
 *               type: string
 */

export default router;
