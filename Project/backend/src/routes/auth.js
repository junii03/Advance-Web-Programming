import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { AppError } from '../middleware/errorHandler.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { getRedisClient } from '../config/redis.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Helper functions for uploading different types of images
const uploadProfilePictureToCloudinary = async (buffer, userId) => {
    return await uploadToCloudinary(buffer, {
        folder: 'hbl-banking/profile_pictures',
        public_id: `profile_${userId}_${Date.now()}`,
        transformation: [
            { width: 300, height: 300, crop: 'fill', quality: 'auto' }
        ]
    });
};

const uploadDocumentToCloudinary = async (buffer, userId, documentType) => {
    return await uploadToCloudinary(buffer, {
        folder: 'hbl-banking/documents',
        public_id: `${documentType}_${userId}_${Date.now()}`,
        transformation: [
            { width: 800, quality: 'auto' }
        ]
    });
};

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - phone
 *         - cnic
 *         - dateOfBirth
 *         - gender
 *         - address
 *         - profilePicture
 *         - cnicFront
 *         - cnicBack
 *       properties:
 *         firstName:
 *           type: string
 *           example: "John"
 *         lastName:
 *           type: string
 *           example: "Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           minLength: 8
 *           example: "SecurePass123"
 *         phone:
 *           type: string
 *           pattern: "^(\\+92|0)?[0-9]{10}$"
 *           example: "03001234567"
 *         cnic:
 *           type: string
 *           pattern: "^[0-9]{5}-[0-9]{7}-[0-9]$"
 *           example: "42101-1234567-1"
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           example: "male"
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *               example: "123 Main Street"
 *             city:
 *               type: string
 *               example: "Karachi"
 *             state:
 *               type: string
 *               example: "Sindh"
 *             postalCode:
 *               type: string
 *               example: "75500"
 *         profilePicture:
 *           type: string
 *           format: binary
 *           description: "Profile picture image file (Required)"
 *         cnicFront:
 *           type: string
 *           format: binary
 *           description: "Front side of CNIC image file (Required)"
 *         cnicBack:
 *           type: string
 *           format: binary
 *           description: "Back side of CNIC image file (Required)"
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           example: "SecurePass123"
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Login successful"
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "60f7b3b3e1b3c12a3c4d5e6f"
 *             firstName:
 *               type: string
 *               example: "John"
 *             lastName:
 *               type: string
 *               example: "Doe"
 *             email:
 *               type: string
 *               example: "john.doe@example.com"
 *             phone:
 *               type: string
 *               example: "03001234567"
 *             customerNumber:
 *               type: string
 *               example: "HBL123456789"
 *             role:
 *               type: string
 *               example: "customer"
 *             profilePicture:
 *               type: string
 *               nullable: true
 *               example: "https://res.cloudinary.com/yourcloud/image/upload/v1234567890/profile_pictures/profile_123_456.jpg"
 *               description: "URL of the user's profile picture"
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user with required documents
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - phone
 *               - cnic
 *               - dateOfBirth
 *               - gender
 *               - address
 *               - profilePicture
 *               - cnicFront
 *               - cnicBack
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "SecurePass123"
 *               phone:
 *                 type: string
 *                 pattern: "^(\\+92|0)?[0-9]{10}$"
 *                 example: "03001234567"
 *               cnic:
 *                 type: string
 *                 pattern: "^[0-9]{5}-[0-9]{7}-[0-9]$"
 *                 example: "42101-1234567-1"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: "male"
 *               address:
 *                 type: string
 *                 description: "JSON string of address object"
 *                 example: '{"street":"123 Main St","city":"Karachi","state":"Sindh","postalCode":"74000"}'
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: "Profile picture image file (Required - Max 5MB)"
 *               cnicFront:
 *                 type: string
 *                 format: binary
 *                 description: "Front side of CNIC image file (Required - Max 5MB)"
 *               cnicBack:
 *                 type: string
 *                 format: binary
 *                 description: "Back side of CNIC image file (Required - Max 5MB)"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request - Validation error, user already exists, or missing files
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// @desc    Register user with required documents
// @route   POST /api/auth/register
// @access  Public
router.post('/register', upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'cnicFront', maxCount: 1 },
    { name: 'cnicBack', maxCount: 1 }
]), [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').matches(/^(\+92|0)?[0-9]{10}$/).withMessage('Please provide a valid Pakistani phone number'),
    body('cnic').matches(/^[0-9]{5}-[0-9]{7}-[0-9]$/).withMessage('Please provide a valid CNIC format (12345-1234567-1)'),
    body('dateOfBirth').isISO8601().toDate().withMessage('Please provide a valid date of birth'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
    body('address').notEmpty().withMessage('Address is required').custom(value => {
        try {
            const address = JSON.parse(value);
            if (!address.street || !address.city || !address.state || !address.postalCode) {
                throw new Error('Address must include street, city, state, and postalCode');
            }
            return true;
        } catch (error) {
            throw new Error('Address must be a valid JSON object with street, city, state, and postalCode');
        }
    })
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        // Check if all required files are uploaded
        if (!req.files ||
            !req.files.profilePicture ||
            !req.files.cnicFront ||
            !req.files.cnicBack) {
            return next(new AppError('Profile picture, CNIC front, and CNIC back images are required', 400));
        }

        const {
            firstName,
            lastName,
            email,
            password,
            phone,
            cnic,
            dateOfBirth,
            gender,
            address
        } = req.body;

        // Parse address from JSON string
        let parsedAddress;
        try {
            parsedAddress = JSON.parse(address);
        } catch (error) {
            return next(new AppError('Invalid address format', 400));
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email },
                { phone },
                { cnic }
            ]
        });

        if (existingUser) {
            return next(new AppError('User already exists with this email, phone, or CNIC', 400));
        }

        // Create user first to get user ID for file uploads
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            phone,
            cnic,
            dateOfBirth,
            gender,
            address: parsedAddress
        });

        try {
            // Upload files to Cloudinary
            const profilePictureResult = await uploadProfilePictureToCloudinary(
                req.files.profilePicture[0].buffer,
                user._id
            );

            const cnicFrontResult = await uploadDocumentToCloudinary(
                req.files.cnicFront[0].buffer,
                user._id,
                'cnic_front'
            );

            const cnicBackResult = await uploadDocumentToCloudinary(
                req.files.cnicBack[0].buffer,
                user._id,
                'cnic_back'
            );

            // Update user with uploaded file data - properly structured
            user.profilePicture = {
                url: profilePictureResult.secure_url,
                publicId: profilePictureResult.public_id,
                uploadedAt: new Date()
            };

            if (!user.documents) {
                user.documents = [];
            }

            user.documents.push(
                {
                    type: 'cnic_front',
                    url: cnicFrontResult.secure_url,
                    publicId: cnicFrontResult.public_id,
                    originalName: req.files.cnicFront[0].originalname,
                    uploadedAt: new Date(),
                    verified: false
                },
                {
                    type: 'cnic_back',
                    url: cnicBackResult.secure_url,
                    publicId: cnicBackResult.public_id,
                    originalName: req.files.cnicBack[0].originalname,
                    uploadedAt: new Date(),
                    verified: false
                }
            );

            await user.save();

            // Generate JWT token
            const token = user.getSignedJwtToken();

            logger.info(`New user registered with documents: ${user.email}`);

            res.status(201).json({
                success: true,
                message: 'User registered successfully with documents',
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    customerNumber: user.customerNumber,
                    role: user.role,
                    profilePicture: user.profilePicture?.url || null,
                    documentsUploaded: true
                }
            });

        } catch (uploadError) {
            // If file upload fails, clean up the created user
            await User.findByIdAndDelete(user._id);
            logger.error('File upload failed during registration:', uploadError);
            return next(new AppError('Failed to upload documents. Please try again.', 500));
        }

    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials or account locked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       423:
 *         description: Account locked due to too many failed attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const { email, password } = req.body;

        // Check for user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return next(new AppError('Invalid credentials', 401));
        }

        // Check if account is locked
        if (user.isLocked) {
            return next(new AppError('Account is temporarily locked due to too many failed login attempts', 423));
        }

        // Check if account is active
        if (!user.isActive) {
            return next(new AppError('Account has been deactivated', 401));
        }

        // Check password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            // Increment login attempts
            await user.incLoginAttempts();
            return next(new AppError('Invalid credentials', 401));
        }

        // Reset login attempts on successful login
        if (user.loginAttempts > 0) {
            await user.resetLoginAttempts();
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = user.getSignedJwtToken();

        logger.info(`User logged in: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                customerNumber: user.customerNumber,
                role: user.role,
                profilePicture: user.profilePicture?.url || null,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logout successful"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.authorization.split(' ')[1];

        // Add token to blacklist in Redis
        const redisClient = getRedisClient();
        if (redisClient && redisClient.isOpen) {
            const decoded = jwt.decode(token);
            const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
            await redisClient.setEx(`blacklist_${token}`, expiresIn, 'blacklisted');
        }

        logger.info(`User logged out: ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/updatedetails:
 *   put:
 *     summary: Update user details
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               phone:
 *                 type: string
 *                 example: "03001234567"
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: "123 Main Street"
 *                   city:
 *                     type: string
 *                     example: "Karachi"
 *                   state:
 *                     type: string
 *                     example: "Sindh"
 *                   postalCode:
 *                     type: string
 *                     example: "75500"
 *     responses:
 *       200:
 *         description: User details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User details updated successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
router.put('/updatedetails', protect, [
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('phone').optional().matches(/^(\+92|0)?[0-9]{10}$/).withMessage('Please provide a valid Pakistani phone number'),
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const fieldsToUpdate = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            address: req.body.address,
            preferences: req.body.preferences
        };

        // Remove undefined fields
        Object.keys(fieldsToUpdate).forEach(key =>
            fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
        );

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        logger.info(`User details updated: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'User details updated successfully',
            user
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/updatepassword:
 *   put:
 *     summary: Update user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "OldSecurePass123"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: "NewSecurePass123"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password updated successfully"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Bad request - Validation error or current password incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
router.put('/updatepassword', protect, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        if (!(await user.matchPassword(req.body.currentPassword))) {
            return next(new AppError('Current password is incorrect', 400));
        }

        user.password = req.body.newPassword;
        await user.save();

        const token = user.getSignedJwtToken();

        logger.info(`Password updated for user: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Password updated successfully',
            token
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/forgotpassword:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: Password reset token sent to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password reset token sent to email"
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
router.post('/forgotpassword', [
    body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return next(new AppError('There is no user with that email', 404));
        }

        // Generate reset token
        const resetToken = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);

        user.passwordResetToken = resetToken;
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save({ validateBeforeSave: false });

        // In a real application, you would send an email here
        logger.info(`Password reset requested for user: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Password reset token sent to email',
            // In development only - remove in production
            ...(process.env.NODE_ENV === 'development' && { resetToken })
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/resetpassword/{resettoken}:
 *   put:
 *     summary: Reset password using token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "SecurePass123"
 *     parameters:
 *       - in: path
 *         name: resettoken
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password reset successful"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Bad request - Validation error or invalid/expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
router.put('/resetpassword/:resettoken', [
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const user = await User.findOne({
            passwordResetToken: req.params.resettoken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return next(new AppError('Invalid or expired token', 400));
        }

        // Set new password
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        const token = user.getSignedJwtToken();

        logger.info(`Password reset completed for user: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Password reset successful',
            token
        });
    } catch (error) {
        next(error);
    }
});

export default router;
