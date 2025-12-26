import express from 'express';
import { body, validationResult } from 'express-validator';
import { AppError } from '../middleware/errorHandler.js';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import logger from '../utils/logger.js';
import { notifyLoanStatusChanged, notifyCardStatusChanged, createUserNotification } from '../utils/notificationHelper.js';

const router = express.Router();

// Apply authorization middleware to all admin routes
router.use(protect);
router.use(authorize('admin', 'manager'));

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get dashboard statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         active:
 *                           type: number
 *                         newThisMonth:
 *                           type: number
 *                         activePercentage:
 *                           type: string
 *                     accounts:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         active:
 *                           type: number
 *                         byType:
 *                           type: array
 *                     transactions:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         today:
 *                           type: number
 *                         volume:
 *                           type: object
 *                     flaggedTransactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 *       403:
 *         description: Admin access required
 */
// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin/Manager)
router.get('/stats', async (req, res, next) => {
    try {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        // User statistics
        const totalUsers = await User.countDocuments({ role: 'customer' });
        const activeUsers = await User.countDocuments({ role: 'customer', isActive: true });
        const newUsersThisMonth = await User.countDocuments({
            role: 'customer',
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Account statistics
        const totalAccounts = await Account.countDocuments();
        const activeAccounts = await Account.countDocuments({ status: 'active' });
        const accountsByType = await Account.aggregate([
            { $group: { _id: '$accountType', count: { $sum: 1 }, totalBalance: { $sum: '$balance' } } }
        ]);

        // Transaction statistics
        const totalTransactions = await Transaction.countDocuments({ status: 'completed' });
        const transactionsToday = await Transaction.countDocuments({
            status: 'completed',
            createdAt: { $gte: new Date(today.setHours(0, 0, 0, 0)) }
        });

        const transactionVolume = await Transaction.aggregate([
            { $match: { status: 'completed', createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        // Recent transactions requiring attention
        const flaggedTransactions = await Transaction.find({
            flagged: true,
            status: { $in: ['pending', 'processing'] }
        }).limit(10).populate('fromAccount toAccount', 'accountNumber accountTitle');

        const stats = {
            users: {
                total: totalUsers,
                active: activeUsers,
                newThisMonth: newUsersThisMonth,
                activePercentage: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0
            },
            accounts: {
                total: totalAccounts,
                active: activeAccounts,
                byType: accountsByType
            },
            transactions: {
                total: totalTransactions,
                today: transactionsToday,
                volume: transactionVolume[0] || { totalAmount: 0, count: 0 }
            },
            flaggedTransactions
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with pagination and filters (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or customer number
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [customer, admin, manager]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 pages:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       403:
 *         description: Admin access required
 */
// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private (Admin/Manager)
router.get('/users', async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            role,
            status,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { customerNumber: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) query.role = role;
        if (status === 'active') query.isActive = true;
        if (status === 'inactive') query.isActive = false;

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const users = await User.find(query)
            .select('-password')
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: users
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details with accounts and transactions (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accounts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Account'
 *                     recentTransactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
// @desc    Get user details with accounts
// @route   GET /api/admin/users/:id
// @access  Private (Admin/Manager)
router.get('/users/:id', async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        const accounts = await Account.find({ userId: req.params.id });
        const recentTransactions = await Transaction.find({
            $or: [
                { fromAccount: { $in: accounts.map(acc => acc._id) } },
                { toAccount: { $in: accounts.map(acc => acc._id) } }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('fromAccount toAccount', 'accountNumber accountTitle');

        res.status(200).json({
            success: true,
            data: {
                user,
                accounts,
                recentTransactions
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Update user status (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: User status updated successfully
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
 *                   example: "User status updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
router.put('/users/:id/status', authorize('admin'), [
    body('isActive').isBoolean().withMessage('Status must be true or false')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: req.body.isActive },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        logger.info(`User status updated: ${user.email} - Active: ${req.body.isActive} by admin: ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'User status updated successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/admin/users/{id}/verify:
 *   put:
 *     summary: Verify user email and/or phone number (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verifyEmail:
 *                 type: boolean
 *                 example: true
 *                 description: Set to true to verify email
 *               verifyPhone:
 *                 type: boolean
 *                 example: true
 *                 description: Set to true to verify phone number
 *             anyOf:
 *               - required: [verifyEmail]
 *               - required: [verifyPhone]
 *     responses:
 *       200:
 *         description: User verification status updated successfully
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
 *                   example: "User email and phone verified successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     verificationChanges:
 *                       type: object
 *                       properties:
 *                         emailVerified:
 *                           type: boolean
 *                         phoneVerified:
 *                           type: boolean
 *       400:
 *         description: Validation error - At least one verification field required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
// @desc    Verify user email and/or phone number
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin only)
router.put('/users/:id/verify', authorize('admin'), [
    body('verifyEmail').optional().isBoolean().withMessage('verifyEmail must be true or false'),
    body('verifyPhone').optional().isBoolean().withMessage('verifyPhone must be true or false')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const { verifyEmail, verifyPhone } = req.body;

        // Validate that at least one verification field is provided
        if (verifyEmail === undefined && verifyPhone === undefined) {
            return next(new AppError('At least one verification field (verifyEmail or verifyPhone) is required', 400));
        }

        // Find the user
        const user = await User.findById(req.params.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Track what was changed for response
        const verificationChanges = {};
        const updates = {};

        // Handle email verification
        if (verifyEmail !== undefined) {
            if (verifyEmail === true) {
                updates.isEmailVerified = true;
                // Clear any existing email verification token
                updates.emailVerificationToken = undefined;
                verificationChanges.emailVerified = true;
            } else {
                updates.isEmailVerified = false;
                verificationChanges.emailVerified = false;
            }
        }

        // Handle phone verification
        if (verifyPhone !== undefined) {
            if (verifyPhone === true) {
                updates.isPhoneVerified = true;
                // Clear any existing phone verification token
                updates.phoneVerificationToken = undefined;
                verificationChanges.phoneVerified = true;
            } else {
                updates.isPhoneVerified = false;
                verificationChanges.phoneVerified = false;
            }
        }

        // Update the user
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        // Create a descriptive message
        let message = 'User verification status updated: ';
        const changes = [];
        if (verificationChanges.emailVerified !== undefined) {
            changes.push(`email ${verificationChanges.emailVerified ? 'verified' : 'unverified'}`);
        }
        if (verificationChanges.phoneVerified !== undefined) {
            changes.push(`phone ${verificationChanges.phoneVerified ? 'verified' : 'unverified'}`);
        }
        message += changes.join(' and ');

        // Log the admin action
        logger.info(`Admin verification action: ${req.user.email} updated verification for user ${updatedUser.email} - ${message}`);

        res.status(200).json({
            success: true,
            message,
            data: {
                user: updatedUser,
                verificationChanges
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/admin/transactions:
 *   get:
 *     summary: Get all transactions with filters (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [transfer, payment, withdrawal, deposit]
 *       - in: query
 *         name: flagged
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 pages:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *       403:
 *         description: Admin access required
 */
// @desc    Get all transactions with filters
// @route   GET /api/admin/transactions
// @access  Private (Admin/Manager)
router.get('/transactions', async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 50,
            status,
            type,
            flagged,
            startDate,
            endDate,
            minAmount,
            maxAmount
        } = req.query;

        let query = {};

        if (status) query.status = status;
        if (type) query.type = type;
        if (flagged === 'true') query.flagged = true;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        if (minAmount || maxAmount) {
            query.amount = {};
            if (minAmount) query.amount.$gte = parseFloat(minAmount);
            if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
        }

        const transactions = await Transaction.find(query)
            .populate('fromAccount toAccount', 'accountNumber accountTitle userId')
            .populate('fromAccount.userId toAccount.userId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Transaction.countDocuments(query);

        res.status(200).json({
            success: true,
            count: transactions.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: transactions
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/admin/transactions/{id}/flag:
 *   put:
 *     summary: Flag or unflag transaction (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - flagged
 *             properties:
 *               flagged:
 *                 type: boolean
 *                 example: true
 *               flagReason:
 *                 type: string
 *                 example: "Suspicious activity detected"
 *     responses:
 *       200:
 *         description: Transaction flag status updated successfully
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
 *                   example: "Transaction flagged successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Transaction not found
 */
// @desc    Flag/unflag transaction
// @route   PUT /api/admin/transactions/:id/flag
// @access  Private (Admin/Manager)
router.put('/transactions/:id/flag', [
    body('flagged').isBoolean().withMessage('Flagged must be true or false'),
    body('flagReason').optional().notEmpty().withMessage('Flag reason cannot be empty')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const { flagged, flagReason } = req.body;

        const transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            {
                flagged,
                ...(flagged && flagReason && { flagReason }),
                ...(!flagged && { $unset: { flagReason: 1 } })
            },
            { new: true }
        );

        if (!transaction) {
            return next(new AppError('Transaction not found', 404));
        }

        logger.info(`Transaction ${flagged ? 'flagged' : 'unflagged'}: ${transaction.transactionId} by admin: ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: `Transaction ${flagged ? 'flagged' : 'unflagged'} successfully`,
            data: transaction
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/admin/reports/{type}:
 *   get:
 *     summary: Generate system reports (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [transactions, accounts, users]
 *         description: Report type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Report start date (defaults to 30 days ago)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Report end date (defaults to today)
 *     responses:
 *       200:
 *         description: Report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 reportType:
 *                   type: string
 *                   example: "transactions"
 *                 period:
 *                   type: object
 *                   properties:
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                 data:
 *                   type: array
 *                   description: Report data aggregated by the specified criteria
 *       400:
 *         description: Invalid report type
 *       403:
 *         description: Admin access required
 */
// @desc    Generate system report
// @route   GET /api/admin/reports/:type
// @access  Private (Admin)
router.get('/reports/:type', authorize('admin'), async (req, res, next) => {
    try {
        const { type } = req.params;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        let report = {};

        switch (type) {
            case 'transactions':
                report = await Transaction.aggregate([
                    { $match: { createdAt: { $gte: start, $lte: end }, status: 'completed' } },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                            totalAmount: { $sum: '$amount' },
                            count: { $sum: 1 },
                            avgAmount: { $avg: '$amount' }
                        }
                    },
                    { $sort: { _id: 1 } }
                ]);
                break;

            case 'accounts':
                report = await Account.aggregate([
                    { $match: { createdAt: { $gte: start, $lte: end } } },
                    {
                        $group: {
                            _id: '$accountType',
                            count: { $sum: 1 },
                            totalBalance: { $sum: '$balance' },
                            avgBalance: { $avg: '$balance' }
                        }
                    }
                ]);
                break;

            case 'users':
                report = await User.aggregate([
                    { $match: { createdAt: { $gte: start, $lte: end }, role: 'customer' } },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                            newUsers: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: 1 } }
                ]);
                break;

            default:
                return next(new AppError('Invalid report type', 400));
        }

        res.status(200).json({
            success: true,
            reportType: type,
            period: { startDate: start, endDate: end },
            data: report
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/admin/users/{userId}/cards/{cardId}/status:
 *   put:
 *     summary: Change card status for any user (Admin only)
 *     description: Allow admin to block, unblock, or change the status of any user's card
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID who owns the card
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID to update
 *         example: "64a1b2c3d4e5f6g7h8i9j0k2"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, blocked, pending, expired]
 *                 description: New status for the card
 *               reason:
 *                 type: string
 *                 description: Admin reason for status change
 *               adminNotes:
 *                 type: string
 *                 description: Internal admin notes (not visible to user)
 *           examples:
 *             block_suspicious:
 *               summary: Block card for suspicious activity
 *               value:
 *                 status: "blocked"
 *                 reason: "Suspicious transactions detected"
 *                 adminNotes: "Flagged by fraud detection system - Case #12345"
 *             activate_card:
 *               summary: Activate pending card
 *               value:
 *                 status: "active"
 *                 reason: "Card activation approved"
 *                 adminNotes: "Manual verification completed"
 *             expire_card:
 *               summary: Mark card as expired
 *               value:
 *                 status: "expired"
 *                 reason: "Card expired - replacement issued"
 *     responses:
 *       200:
 *         description: Card status updated successfully
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
 *                   example: "Card status updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         email:
 *                           type: string
 *                     card:
 *                       $ref: '#/components/schemas/Card'
 *                     statusChange:
 *                       type: object
 *                       properties:
 *                         previousStatus:
 *                           type: string
 *                         newStatus:
 *                           type: string
 *                         changedBy:
 *                           type: string
 *                         changedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalid_status:
 *                 summary: Invalid status value
 *                 value:
 *                   success: false
 *                   error: "Status must be one of: active, blocked, pending, expired"
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Admin access required"
 *       404:
 *         description: User or card not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               user_not_found:
 *                 summary: User not found
 *                 value:
 *                   success: false
 *                   error: "User not found"
 *               card_not_found:
 *                 summary: Card not found
 *                 value:
 *                   success: false
 *                   error: "Card not found for this user"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// @desc    Change card status for any user
// @route   PUT /api/admin/users/:userId/cards/:cardId/status
// @access  Private (Admin only)
router.put('/users/:userId/cards/:cardId/status', authorize('admin'), [
    body('status').isIn(['active', 'blocked', 'pending', 'expired']).withMessage('Status must be one of: active, blocked, pending, expired'),
    body('reason').optional().isString().withMessage('Reason must be a string'),
    body('adminNotes').optional().isString().withMessage('Admin notes must be a string')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const { userId, cardId } = req.params;
        const { status, reason, adminNotes } = req.body;

        // Find the user
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Find the specific card
        const card = user.cards?.id(cardId);
        if (!card) {
            return next(new AppError('Card not found for this user', 404));
        }

        // Store previous status for audit trail
        const previousStatus = card.cardStatus;

        // Generate default reason if not provided
        let statusReason = reason;
        if (!statusReason) {
            switch (status) {
                case 'active':
                    statusReason = 'Card activated by admin';
                    break;
                case 'blocked':
                    statusReason = 'Card blocked by admin';
                    break;
                case 'pending':
                    statusReason = 'Card status set to pending by admin';
                    break;
                case 'expired':
                    statusReason = 'Card marked as expired by admin';
                    break;
                default:
                    statusReason = `Card status changed to ${status} by admin`;
            }
        }

        // Update card status
        card.cardStatus = status;
        card.statusChangedAt = new Date();
        card.statusReason = statusReason;

        // Add admin-specific fields
        if (adminNotes) {
            card.adminNotes = adminNotes;
        }
        card.statusChangedBy = req.user.id;
        card.adminStatusChange = {
            previousStatus,
            newStatus: status,
            changedBy: req.user.email,
            changedAt: new Date(),
            reason: statusReason,
            adminNotes
        };

        await user.save();

        // Create audit log entry
        if (!user.adminAuditLog) {
            user.adminAuditLog = [];
        }

        user.adminAuditLog.push({
            action: 'CARD_STATUS_CHANGE',
            adminUser: req.user.email,
            adminUserId: req.user.id,
            details: {
                cardId: card._id,
                cardNumber: card.maskedCardNumber || `****${card.cardNumber?.slice(-4)}`,
                previousStatus,
                newStatus: status,
                reason: statusReason,
                adminNotes
            },
            timestamp: new Date()
        });

        // Add notification to user
        if (!user.notifications) {
            user.notifications = [];
        }

        let notificationMessage = '';
        let notificationType = 'account';

        switch (status) {
            case 'active':
                notificationMessage = `Your ${card.cardType} card ending in ${card.cardNumber?.slice(-4) || '****'} has been activated.`;
                notificationType = 'account';
                break;
            case 'blocked':
                notificationMessage = `Your ${card.cardType} card ending in ${card.cardNumber?.slice(-4) || '****'} has been blocked. Contact customer service for assistance.`;
                notificationType = 'security';
                break;
            case 'expired':
                notificationMessage = `Your ${card.cardType} card ending in ${card.cardNumber?.slice(-4) || '****'} has expired. A replacement card will be issued.`;
                notificationType = 'account';
                break;
            case 'pending':
                notificationMessage = `Your ${card.cardType} card ending in ${card.cardNumber?.slice(-4) || '****'} is under review.`;
                notificationType = 'account';
                break;
        }

        user.notifications.push({
            title: `Card Status Updated`,
            message: notificationMessage,
            type: notificationType,
            read: false,
            createdAt: new Date()
        });

        await user.save();

        // Log the admin action
        logger.info(`Admin card status change: ${req.user.email} changed card ${card.maskedCardNumber || `****${card.cardNumber?.slice(-4)}`} status from ${previousStatus} to ${status} for user ${user.email}. Reason: ${statusReason}`);

        // Send real-time notification via WebSocket
        await notifyCardStatusChanged(user._id.toString(), {
            _id: card._id,
            status: status,
            cardNumber: card.cardNumber,
            cardType: card.cardType
        });

        // Prepare response data
        const statusChange = {
            previousStatus,
            newStatus: status,
            changedBy: req.user.email,
            changedAt: new Date(),
            reason: statusReason,
            adminNotes
        };

        res.status(200).json({
            success: true,
            message: 'Card status updated successfully',
            data: {
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                },
                card: card,
                statusChange
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/admin/users/{userId}/cards:
 *   get:
 *     summary: Get all cards for a specific user (Admin only)
 *     description: Retrieve all cards associated with a specific user for admin review
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *     responses:
 *       200:
 *         description: User cards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   description: Number of cards
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         customerNumber:
 *                           type: string
 *                     cards:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Card'
 *                           - type: object
 *                             properties:
 *                               adminNotes:
 *                                 type: string
 *                               statusChangedBy:
 *                                 type: string
 *                               adminStatusChange:
 *                                 type: object
 *                                 description: Admin audit information
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// @desc    Get all cards for a specific user
// @route   GET /api/admin/users/:userId/cards
// @access  Private (Admin/Manager)
router.get('/users/:userId/cards', async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Find the user with populated account information
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Get user's accounts for card-account mapping
        const accounts = await Account.find({ userId: userId });

        // Populate card information with account details
        const cardsWithAccounts = await Promise.all(
            (user.cards || []).map(async (card) => {
                const account = accounts.find(acc => acc._id.toString() === card.accountId?.toString());
                return {
                    ...card.toObject(),
                    account: account ? {
                        accountNumber: account.accountNumber,
                        accountTitle: account.accountTitle,
                        balance: account.balance,
                        formattedBalance: account.formattedBalance,
                        accountType: account.accountType
                    } : null
                };
            })
        );

        res.status(200).json({
            success: true,
            count: cardsWithAccounts.length,
            data: {
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    customerNumber: user.customerNumber
                },
                cards: cardsWithAccounts
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/admin/loans/{id}/approve:
 *   put:
 *     summary: Approve or reject a loan (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Loan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *                 description: Approve or reject the loan
 *               rejectionReason:
 *                 type: string
 *                 description: Reason for rejection (required if action is reject)
 *           examples:
 *             approve:
 *               summary: Approve a loan
 *               value:
 *                 action: approve
 *             reject:
 *               summary: Reject a loan
 *               value:
 *                 action: reject
 *                 rejectionReason: "Insufficient credit score"
 *     responses:
 *       200:
 *         description: Loan approved and amount disbursed, or loan rejected
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
 *                   example: Loan approved and amount disbursed
 *                 data:
 *                   type: object
 *                   properties:
 *                     loan:
 *                       $ref: '#/components/schemas/Loan'
 *                     transaction:
 *                       $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Loan already processed, no active account, or missing rejection reason
 *       404:
 *         description: Loan not found
 *       403:
 *         description: Admin access required
 */

// @desc    Approve a loan and disburse amount
// @route   PUT /api/admin/loans/:id/approve
// @access  Private (Admin/Manager)
router.put('/loans/:id/approve', authorize('admin', 'manager'), async (req, res, next) => {
    try {
        // Import models directly
        const Loan = (await import('../models/Loan.js')).default;
        const Transaction = (await import('../models/Transaction.js')).default;
        const Account = (await import('../models/Account.js')).default;
        const User = (await import('../models/User.js')).default;

        const loan = await Loan.findById(req.params.id);
        if (!loan) return next(new AppError('Loan not found', 404));
        if (loan.status === 'approved' || loan.status === 'active' || loan.status === 'rejected') {
            return next(new AppError('Loan already processed (approved, active, or rejected)', 400));
        }

        const { action, rejectionReason } = req.body;
        if (!action || !['approve', 'reject'].includes(action)) {
            return next(new AppError('Action must be either "approve" or "reject"', 400));
        }

        // Find user and their primary/first active account
        const user = await User.findById(loan.userId);
        if (!user) return next(new AppError('User not found', 404));

        if (action === 'approve') {
            const account = await Account.findOne({ userId: user._id, status: 'active' }).sort({ createdAt: 1 });
            if (!account) return next(new AppError('No active account found for user', 400));

            // Disburse loan amount
            account.balance += loan.amount;
            account.availableBalance = account.balance;
            await account.save();

            // Create transaction
            const transaction = await Transaction.create({
                type: 'deposit',
                fromAccount: null,
                toAccount: account._id,
                amount: loan.amount,
                currency: 'PKR',
                description: `Loan disbursement for ${loan.loanType} loan`,
                channel: 'branch',
                status: 'completed',
                processedAt: new Date(),
                toAccountBalanceAfter: account.balance,
                deviceInfo: { ipAddress: req.ip, userAgent: req.get('User-Agent') },
            });

            // Update loan status
            loan.status = 'approved';
            loan.approvedDate = new Date();
            loan.disbursedDate = new Date();
            await loan.save();

            // Add notification
            if (!user.notifications) user.notifications = [];
            user.notifications.push({
                title: 'Loan Approved',
                message: `Your ${loan.loanType} loan has been approved and PKR ${loan.amount.toLocaleString()} has been credited to your account (${account.accountNumber}).`,
                type: 'account',
                read: false,
                createdAt: new Date()
            });
            await user.save();

            // Send real-time notification via WebSocket
            await notifyLoanStatusChanged(loan.userId.toString(), {
                _id: loan._id,
                status: 'approved',
                amount: loan.amount,
                loanType: loan.loanType
            });

            return res.status(200).json({
                success: true,
                message: 'Loan approved and amount disbursed',
                data: { loan, transaction }
            });
        } else if (action === 'reject') {
            if (!rejectionReason || typeof rejectionReason !== 'string' || !rejectionReason.trim()) {
                return next(new AppError('Rejection reason is required when rejecting a loan', 400));
            }
            loan.status = 'rejected';
            loan.rejectionReason = rejectionReason;
            loan.rejectedDate = new Date();
            await loan.save();

            // Add notification
            if (!user.notifications) user.notifications = [];
            user.notifications.push({
                title: 'Loan Rejected',
                message: `Your ${loan.loanType} loan application has been rejected. Reason: ${rejectionReason}`,
                type: 'account',
                read: false,
                createdAt: new Date()
            });
            await user.save();

            // Send real-time notification via WebSocket
            await notifyLoanStatusChanged(loan.userId.toString(), {
                _id: loan._id,
                status: 'rejected',
                amount: loan.amount,
                loanType: loan.loanType
            });

            return res.status(200).json({
                success: true,
                message: 'Loan rejected',
                data: { loan }
            });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/admin/loans:
 *   get:
 *     summary: Get all loan applications from all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, active, closed]
 *       - in: query
 *         name: loanType
 *         schema:
 *           type: string
 *           enum: [personal, home, car, business]
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by loan ID, user name, email, or purpose
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: applicationDate
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Loans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 pages:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Loan'
 *                       - type: object
 *                         properties:
 *                           user:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               customerNumber:
 *                                 type: string
 *       403:
 *         description: Admin access required
 */
// @desc    Get all loan applications from all users
// @route   GET /api/admin/loans
// @access  Private (Admin/Manager)
router.get('/loans', async (req, res, next) => {
    try {
        // Import Loan model
        const Loan = (await import('../models/Loan.js')).default;

        const {
            page = 1,
            limit = 20,
            status,
            loanType,
            minAmount,
            maxAmount,
            startDate,
            endDate,
            search,
            sortBy = 'applicationDate',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        let query = {};

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by loan type
        if (loanType) {
            query.loanType = loanType;
        }

        // Filter by amount range
        if (minAmount || maxAmount) {
            query.amount = {};
            if (minAmount) query.amount.$gte = parseFloat(minAmount);
            if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
        }

        // Filter by date range
        if (startDate || endDate) {
            query.applicationDate = {};
            if (startDate) query.applicationDate.$gte = new Date(startDate);
            if (endDate) query.applicationDate.$lte = new Date(endDate);
        }

        // Build aggregation pipeline for search
        let pipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            }
        ];

        // Add search functionality
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { _id: { $regex: search, $options: 'i' } },
                        { purpose: { $regex: search, $options: 'i' } },
                        { 'user.firstName': { $regex: search, $options: 'i' } },
                        { 'user.lastName': { $regex: search, $options: 'i' } },
                        { 'user.email': { $regex: search, $options: 'i' } },
                        { 'user.customerNumber': { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }

        // Add query filters
        if (Object.keys(query).length > 0) {
            pipeline.push({ $match: query });
        }

        // Add user data projection and sorting
        pipeline.push(
            {
                $addFields: {
                    user: {
                        _id: '$user._id',
                        firstName: '$user.firstName',
                        lastName: '$user.lastName',
                        email: '$user.email',
                        customerNumber: '$user.customerNumber'
                    }
                }
            },
            {
                $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
            }
        );

        // Get total count for pagination
        const totalPipeline = [...pipeline, { $count: "total" }];
        const totalResult = await Loan.aggregate(totalPipeline);
        const total = totalResult[0]?.total || 0;

        // Add pagination
        pipeline.push(
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) }
        );

        // Execute the aggregation
        const loans = await Loan.aggregate(pipeline);

        res.status(200).json({
            success: true,
            count: loans.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: loans
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/admin/customer-reports:
 *   get:
 *     summary: Get all customer reports (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [submitted, in_progress, resolved, closed]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [account_issue, transaction_problem, card_issue, loan_problem, technical_issue, complaint, suggestion, other]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by report ID, subject, or user details
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: submittedAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Customer reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 pages:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Report'
 *                       - type: object
 *                         properties:
 *                           user:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               customerNumber:
 *                                 type: string
 *       403:
 *         description: Admin access required
 */
// @desc    Get all customer reports
// @route   GET /api/admin/customer-reports
// @access  Private (Admin/Manager)
router.get('/customer-reports', async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            category,
            priority,
            search,
            startDate,
            endDate,
            sortBy = 'submittedAt',
            sortOrder = 'desc'
        } = req.query;

        // Build aggregation pipeline
        let pipeline = [
            {
                $match: {
                    role: 'customer',
                    reports: { $exists: true, $ne: [] }
                }
            },
            {
                $unwind: '$reports'
            }
        ];

        // Build match conditions for reports
        let reportMatchConditions = {};

        if (status) {
            reportMatchConditions['reports.status'] = status;
        }

        if (category) {
            reportMatchConditions['reports.category'] = category;
        }

        if (priority) {
            reportMatchConditions['reports.priority'] = priority;
        }

        if (startDate || endDate) {
            reportMatchConditions['reports.submittedAt'] = {};
            if (startDate) reportMatchConditions['reports.submittedAt'].$gte = new Date(startDate);
            if (endDate) reportMatchConditions['reports.submittedAt'].$lte = new Date(endDate);
        }

        // Add report filters
        if (Object.keys(reportMatchConditions).length > 0) {
            pipeline.push({ $match: reportMatchConditions });
        }

        // Add search functionality
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'reports.reportId': { $regex: search, $options: 'i' } },
                        { 'reports.subject': { $regex: search, $options: 'i' } },
                        { 'reports.description': { $regex: search, $options: 'i' } },
                        { firstName: { $regex: search, $options: 'i' } },
                        { lastName: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                        { customerNumber: { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }

        // Project required fields
        pipeline.push({
            $project: {
                reportId: '$reports.reportId',
                category: '$reports.category',
                subject: '$reports.subject',
                description: '$reports.description',
                priority: '$reports.priority',
                status: '$reports.status',
                images: '$reports.images',
                submittedAt: '$reports.submittedAt',
                lastUpdated: '$reports.lastUpdated',
                resolution: '$reports.resolution',
                user: {
                    _id: '$_id',
                    firstName: '$firstName',
                    lastName: '$lastName',
                    email: '$email',
                    customerNumber: '$customerNumber'
                }
            }
        });

        // Get total count for pagination
        const totalPipeline = [...pipeline, { $count: "total" }];
        const totalResult = await User.aggregate(totalPipeline);
        const total = totalResult[0]?.total || 0;

        // Add sorting
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        pipeline.push({ $sort: sortOptions });

        // Add pagination
        pipeline.push(
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) }
        );

        // Execute aggregation
        const reports = await User.aggregate(pipeline);

        res.status(200).json({
            success: true,
            count: reports.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: reports
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/admin/customer-reports/{userId}/{reportId}/status:
 *   put:
 *     summary: Update customer report status (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [submitted, in_progress, resolved, closed]
 *               resolutionNote:
 *                 type: string
 *                 description: Resolution note (required for resolved status)
 *               adminNotes:
 *                 type: string
 *                 description: Internal admin notes
 *     responses:
 *       200:
 *         description: Report status updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User or report not found
 */
// @desc    Update customer report status
// @route   PUT /api/admin/customer-reports/:userId/:reportId/status
// @access  Private (Admin/Manager)
router.put('/customer-reports/:userId/:reportId/status', [
    body('status').isIn(['submitted', 'in_progress', 'resolved', 'closed'])
        .withMessage('Status must be one of: submitted, in_progress, resolved, closed'),
    body('resolutionNote').optional().isString().withMessage('Resolution note must be a string'),
    body('adminNotes').optional().isString().withMessage('Admin notes must be a string')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const { userId, reportId } = req.params;
        const { status, resolutionNote, adminNotes } = req.body;

        // Validate resolution note for resolved status
        if (status === 'resolved' && (!resolutionNote || !resolutionNote.trim())) {
            return next(new AppError('Resolution note is required when marking report as resolved', 400));
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Find the specific report
        const reportIndex = user.reports?.findIndex(r => r.reportId === reportId);
        if (reportIndex === -1) {
            return next(new AppError('Report not found', 404));
        }

        const report = user.reports[reportIndex];
        const previousStatus = report.status;

        // Update report status
        report.status = status;
        report.lastUpdated = new Date();

        // Handle resolution details
        if (status === 'resolved' || status === 'closed') {
            if (!report.resolution) {
                report.resolution = {};
            }

            if (status === 'resolved') {
                report.resolution.resolvedAt = new Date();
                report.resolution.resolvedBy = req.user.id;
                report.resolution.resolutionNote = resolutionNote;
            }
        }

        // Add admin notes if provided
        if (adminNotes) {
            if (!report.adminNotes) {
                report.adminNotes = [];
            }
            report.adminNotes.push({
                note: adminNotes,
                addedBy: req.user.id,
                addedAt: new Date()
            });
        }

        await user.save();

        // Add notification to user
        if (!user.notifications) {
            user.notifications = [];
        }

        let notificationMessage = '';
        let notificationType = 'account';

        switch (status) {
            case 'in_progress':
                notificationMessage = `Your support report "${report.subject}" is now being reviewed by our team.`;
                break;
            case 'resolved':
                notificationMessage = `Your support report "${report.subject}" has been resolved. ${resolutionNote}`;
                break;
            case 'closed':
                notificationMessage = `Your support report "${report.subject}" has been closed.`;
                break;
        }

        if (notificationMessage) {
            user.notifications.push({
                title: 'Report Status Updated',
                message: notificationMessage,
                type: notificationType,
                read: false,
                createdAt: new Date()
            });
            await user.save();
        }

        // Log the admin action
        logger.info(`Admin updated report status: ${req.user.email} changed report ${reportId} from ${previousStatus} to ${status} for user ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Report status updated successfully',
            data: {
                report: report,
                statusChange: {
                    previousStatus,
                    newStatus: status,
                    changedBy: req.user.email,
                    changedAt: new Date()
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/admin/customer-reports/{userId}/{reportId}:
 *   get:
 *     summary: Get specific customer report details (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report details retrieved successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User or report not found
 */
// @desc    Get specific customer report details
// @route   GET /api/admin/customer-reports/:userId/:reportId
// @access  Private (Admin/Manager)
router.get('/customer-reports/:userId/:reportId', async (req, res, next) => {
    try {
        const { userId, reportId } = req.params;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        const report = user.reports?.find(r => r.reportId === reportId);
        if (!report) {
            return next(new AppError('Report not found', 404));
        }

        res.status(200).json({
            success: true,
            data: {
                report,
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    customerNumber: user.customerNumber
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
