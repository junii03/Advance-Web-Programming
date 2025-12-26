import express from 'express';
import { body, validationResult } from 'express-validator';
import { AppError } from '../middleware/errorHandler.js';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Account from '../models/Account.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
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
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
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
 *                 pattern: "^(\\+92|0)?[0-9]{10}$"
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
 *               profilePicture:
 *                 type: string
 *                 example: "https://example.com/profile.jpg"
 *               preferences:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: "Profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, [
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('phone').optional().matches(/^(\+92|0)?[0-9]{10}$/).withMessage('Please provide a valid Pakistani phone number'),
    body('address.street').optional().notEmpty().withMessage('Street address cannot be empty'),
    body('address.city').optional().notEmpty().withMessage('City cannot be empty'),
    body('address.state').optional().notEmpty().withMessage('State cannot be empty'),
    body('address.postalCode').optional().notEmpty().withMessage('Postal code cannot be empty')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const allowedUpdates = [
            'firstName', 'lastName', 'phone', 'address',
            'profilePicture', 'preferences'
        ];

        const updates = {};
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        );

        logger.info(`User profile updated: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/users/dashboard:
 *   get:
 *     summary: Get comprehensive user dashboard data
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
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
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "60f7b3b3e1b3c12a3c4d5e6f"
 *                         fullName:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "john.doe@example.com"
 *                         customerNumber:
 *                           type: string
 *                           example: "HBL123456789"
 *                         profilePicture:
 *                           type: string
 *                           nullable: true
 *                           example: "https://res.cloudinary.com/yourcloud/image/upload/v1234567890/profile_pictures/profile_123_456.jpg"
 *                         isEmailVerified:
 *                           type: boolean
 *                           example: true
 *                           description: "Email verification status"
 *                         isPhoneVerified:
 *                           type: boolean
 *                           example: true
 *                           description: "Phone number verification status"
 *                         role:
 *                           type: string
 *                           example: "customer"
 *                     accounts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           accountNumber:
 *                             type: string
 *                           accountTitle:
 *                             type: string
 *                           accountType:
 *                             type: string
 *                           balance:
 *                             type: number
 *                           formattedBalance:
 *                             type: string
 *                           status:
 *                             type: string
 *                           interestRate:
 *                             type: number
 *                           dailyLimit:
 *                             type: number
 *                           monthlyLimit:
 *                             type: number
 *                     totalBalance:
 *                       type: number
 *                       example: 150000.50
 *                     formattedTotalBalance:
 *                       type: string
 *                       example: "PKR 150,000.50"
 *                     recentTransactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 *                     monthlyStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           totalAmount:
 *                             type: number
 *                           count:
 *                             type: number
 *                     spendingByCategory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           totalAmount:
 *                             type: number
 *                           count:
 *                             type: number
 *                     weeklyTrend:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: object
 *                             properties:
 *                               week:
 *                                 type: number
 *                               year:
 *                                 type: number
 *                           totalAmount:
 *                             type: number
 *                           count:
 *                             type: number
 *                     quickStats:
 *                       type: object
 *                       properties:
 *                         totalAccounts:
 *                           type: number
 *                           example: 3
 *                         activeAccounts:
 *                           type: number
 *                           example: 3
 *                         todayTransactions:
 *                           type: number
 *                           example: 5
 *                         pendingTransactions:
 *                           type: number
 *                           example: 2
 *                     pendingTransactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalAccounts:
 *                           type: number
 *                         activeAccounts:
 *                           type: number
 *                         recentTransactionsCount:
 *                           type: number
 *       401:
 *         description: Unauthorized
 */
// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res, next) => {
    try {
        // Get user's accounts
        const accounts = await Account.find({ userId: req.user.id, status: 'active' });

        // Get recent transactions (last 10) with proper direction calculation
        const accountIds = accounts.map(account => account._id);
        const Transaction = (await import('../models/Transaction.js')).default;

        const recentTransactions = await Transaction.aggregate([
            {
                $match: {
                    $or: [
                        { fromAccount: { $in: accountIds } },
                        { toAccount: { $in: accountIds } }
                    ],
                    status: 'completed'
                }
            },
            {
                $lookup: {
                    from: 'accounts',
                    localField: 'fromAccount',
                    foreignField: '_id',
                    as: 'fromAccountDetails'
                }
            },
            {
                $lookup: {
                    from: 'accounts',
                    localField: 'toAccount',
                    foreignField: '_id',
                    as: 'toAccountDetails'
                }
            },
            {
                $addFields: {
                    direction: {
                        $cond: [
                            {
                                $and: [
                                    { $in: ['$fromAccount', accountIds] },
                                    { $in: ['$toAccount', accountIds] }
                                ]
                            },
                            'transfer_self',
                            {
                                $cond: [
                                    { $in: ['$fromAccount', accountIds] },
                                    {
                                        $cond: [
                                            { $eq: ['$subType', 'external_transfer'] },
                                            'external_debit',
                                            'debit'
                                        ]
                                    },
                                    {
                                        $cond: [
                                            { $in: ['$toAccount', accountIds] },
                                            {
                                                $cond: [
                                                    { $eq: ['$subType', 'external_transfer'] },
                                                    'external_credit',
                                                    'credit'
                                                ]
                                            },
                                            // Final fallback based on transaction type
                                            {
                                                $switch: {
                                                    branches: [
                                                        { case: { $eq: ['$type', 'deposit'] }, then: 'credit' },
                                                        { case: { $eq: ['$type', 'withdrawal'] }, then: 'debit' },
                                                        { case: { $eq: ['$type', 'interest'] }, then: 'credit' },
                                                        { case: { $eq: ['$type', 'fee'] }, then: 'debit' },
                                                        { case: { $eq: ['$type', 'payment'] }, then: 'debit' },
                                                        { case: { $eq: ['$type', 'refund'] }, then: 'credit' }
                                                    ],
                                                    default: 'debit'
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                }
            },
            { $sort: { createdAt: -1 } },
            { $limit: 10 }
        ]);

        // Calculate total balance
        const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

        // Get monthly transaction summary
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const monthlyStats = await Transaction.aggregate([
            {
                $match: {
                    $or: [
                        { fromAccount: { $in: accountIds } },
                        { toAccount: { $in: accountIds } }
                    ],
                    status: 'completed',
                    createdAt: {
                        $gte: new Date(currentYear, currentMonth - 1, 1),
                        $lt: new Date(currentYear, currentMonth, 1)
                    }
                }
            },
            {
                $group: {
                    _id: '$type',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get spending by category for current month
        const spendingByCategory = await Transaction.aggregate([
            {
                $match: {
                    fromAccount: { $in: accountIds },
                    status: 'completed',
                    createdAt: {
                        $gte: new Date(currentYear, currentMonth - 1, 1),
                        $lt: new Date(currentYear, currentMonth, 1)
                    }
                }
            },
            {
                $group: {
                    _id: '$subType',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { totalAmount: -1 } },
            { $limit: 5 }
        ]);

        // Get weekly transaction trend (last 4 weeks)
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

        const weeklyTrend = await Transaction.aggregate([
            {
                $match: {
                    $or: [
                        { fromAccount: { $in: accountIds } },
                        { toAccount: { $in: accountIds } }
                    ],
                    status: 'completed',
                    createdAt: { $gte: fourWeeksAgo }
                }
            },
            {
                $group: {
                    _id: {
                        week: { $week: '$createdAt' },
                        year: { $year: '$createdAt' }
                    },
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.week': 1 } }
        ]);

        // Get quick stats
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayTransactions = await Transaction.countDocuments({
            $or: [
                { fromAccount: { $in: accountIds } },
                { toAccount: { $in: accountIds } }
            ],
            status: 'completed',
            createdAt: { $gte: todayStart }
        });

        // Get pending transactions
        const pendingTransactions = await Transaction.find({
            fromAccount: { $in: accountIds },
            status: { $in: ['pending', 'processing'] }
        })
            .populate('toAccount', 'accountNumber accountTitle')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get account breakdown
        const accountBreakdown = accounts.map(account => ({
            id: account._id,
            accountNumber: account.formattedAccountNumber,
            accountTitle: account.accountTitle,
            accountType: account.accountType,
            balance: account.balance,
            formattedBalance: account.formattedBalance,
            status: account.status,
            interestRate: account.interestRate,
            dailyLimit: account.dailyTransactionLimit,
            monthlyLimit: account.monthlyTransactionLimit
        }));

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: req.user.id,
                    fullName: req.user.fullName,
                    email: req.user.email,
                    customerNumber: req.user.customerNumber,
                    profilePicture: req.user.profilePicture,
                    isEmailVerified: req.user.isEmailVerified,
                    isPhoneVerified: req.user.isPhoneVerified,
                    role: req.user.role
                },
                accounts: accountBreakdown,
                totalBalance,
                formattedTotalBalance: new Intl.NumberFormat('en-PK', {
                    style: 'currency',
                    currency: 'PKR'
                }).format(totalBalance),
                recentTransactions,
                monthlyStats,
                spendingByCategory,
                weeklyTrend,
                quickStats: {
                    totalAccounts: accounts.length,
                    activeAccounts: accounts.filter(acc => acc.status === 'active').length,
                    todayTransactions,
                    pendingTransactions: pendingTransactions.length
                },
                pendingTransactions,
                summary: {
                    totalAccounts: accounts.length,
                    activeAccounts: accounts.filter(acc => acc.status === 'active').length,
                    recentTransactionsCount: recentTransactions.length
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/users/accounts-summary:
 *   get:
 *     summary: Get user's accounts summary
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Accounts summary retrieved successfully
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
 *                     totalAccounts:
 *                       type: number
 *                       example: 3
 *                     accountsByType:
 *                       type: object
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           count:
 *                             type: number
 *                           totalBalance:
 *                             type: number
 *                           formattedTotalBalance:
 *                             type: string
 *                     totalBalance:
 *                       type: number
 *                       example: 250000
 *                     averageBalance:
 *                       type: number
 *                       example: 83333.33
 *                     formattedTotalBalance:
 *                       type: string
 *                       example: "PKR 250,000.00"
 *       401:
 *         description: Unauthorized
 */
// @desc    Get user's accounts summary
// @route   GET /api/users/accounts-summary
// @access  Private
router.get('/accounts-summary', protect, async (req, res, next) => {
    try {
        const accounts = await Account.find({
            userId: req.user.id,
            status: { $ne: 'closed' }
        });

        const summary = {
            totalAccounts: accounts.length,
            accountsByType: {},
            totalBalance: 0,
            averageBalance: 0
        };

        accounts.forEach(account => {
            // Count by type
            if (!summary.accountsByType[account.accountType]) {
                summary.accountsByType[account.accountType] = {
                    count: 0,
                    totalBalance: 0
                };
            }

            summary.accountsByType[account.accountType].count++;
            summary.accountsByType[account.accountType].totalBalance += account.balance;
            summary.totalBalance += account.balance;
        });

        summary.averageBalance = accounts.length > 0 ? summary.totalBalance / accounts.length : 0;

        // Format balances
        summary.formattedTotalBalance = new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR'
        }).format(summary.totalBalance);

        Object.keys(summary.accountsByType).forEach(type => {
            summary.accountsByType[type].formattedTotalBalance = new Intl.NumberFormat('en-PK', {
                style: 'currency',
                currency: 'PKR'
            }).format(summary.accountsByType[type].totalBalance);
        });

        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/users/notifications:
 *   put:
 *     summary: Update notification preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferences:
 *                 type: object
 *                 properties:
 *                   notifications:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: boolean
 *                         example: true
 *                       sms:
 *                         type: boolean
 *                         example: false
 *                       push:
 *                         type: boolean
 *                         example: true
 *     responses:
 *       200:
 *         description: Notification preferences updated successfully
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
 *                   example: "Notification preferences updated successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
// @desc    Update notification preferences
// @route   PUT /api/users/notifications
// @access  Private
router.put('/notifications', protect, [
    body('preferences.notifications.email').optional().isBoolean(),
    body('preferences.notifications.sms').optional().isBoolean(),
    body('preferences.notifications.push').optional().isBoolean()
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const user = await User.findById(req.user.id);

        if (req.body.preferences && req.body.preferences.notifications) {
            user.preferences.notifications = {
                ...user.preferences.notifications,
                ...req.body.preferences.notifications
            };
        }

        await user.save();

        logger.info(`Notification preferences updated for user: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Notification preferences updated successfully',
            data: user.preferences.notifications
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/users/beneficiaries:
 *   get:
 *     summary: Get user's beneficiaries (frequent transfer recipients)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Beneficiaries retrieved successfully
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
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       accountNumber:
 *                         type: string
 *                         example: "1234567890"
 *                       accountTitle:
 *                         type: string
 *                         example: "Jane Doe"
 *                       recipientName:
 *                         type: string
 *                         example: "Jane Doe"
 *                       transferCount:
 *                         type: number
 *                         example: 5
 *                       lastTransfer:
 *                         type: string
 *                         format: date-time
 *                       totalAmount:
 *                         type: number
 *                         example: 50000
 *       401:
 *         description: Unauthorized
 */
// @desc    Get user's beneficiaries (frequent transfer recipients)
// @route   GET /api/users/beneficiaries
// @access  Private
router.get('/beneficiaries', protect, async (req, res, next) => {
    try {
        const Transaction = (await import('../models/Transaction.js')).default;

        const userAccounts = await Account.find({ userId: req.user.id }).select('_id');
        const accountIds = userAccounts.map(account => account._id);

        // Get frequent transfer recipients
        const beneficiaries = await Transaction.aggregate([
            {
                $match: {
                    fromAccount: { $in: accountIds },
                    type: 'transfer',
                    status: 'completed',
                    toAccount: { $exists: true }
                }
            },
            {
                $group: {
                    _id: '$toAccount',
                    transferCount: { $sum: 1 },
                    lastTransfer: { $max: '$createdAt' },
                    totalAmount: { $sum: '$amount' }
                }
            },
            {
                $match: {
                    transferCount: { $gte: 2 } // At least 2 transfers
                }
            },
            {
                $lookup: {
                    from: 'accounts',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'account'
                }
            },
            {
                $unwind: '$account'
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'account.userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    accountNumber: '$account.accountNumber',
                    accountTitle: '$account.accountTitle',
                    recipientName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
                    transferCount: 1,
                    lastTransfer: 1,
                    totalAmount: 1
                }
            },
            {
                $sort: { transferCount: -1, lastTransfer: -1 }
            },
            {
                $limit: 10
            }
        ]);

        res.status(200).json({
            success: true,
            count: beneficiaries.length,
            data: beneficiaries
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/users/analytics:
 *   get:
 *     summary: Get user analytics data
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [1month, 3months, 6months, 1year]
 *           default: 6months
 *         description: Time period for analytics
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
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
 *                     period:
 *                       type: string
 *                       example: "6months"
 *                     spendingByCategory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           totalAmount:
 *                             type: number
 *                           count:
 *                             type: number
 *                           avgAmount:
 *                             type: number
 *                     monthlyTrend:
 *                       type: array
 *                     incomeExpenses:
 *                       type: object
 *                       properties:
 *                         totalIncome:
 *                           type: number
 *                         totalExpenses:
 *                           type: number
 *                     accounts:
 *                       type: number
 *                     totalBalance:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
// @desc    Get analytics data
// @route   GET /api/users/analytics
// @access  Private
router.get('/analytics', protect, async (req, res, next) => {
    try {
        const { period = '6months' } = req.query;
        const accounts = await Account.find({ userId: req.user.id, status: 'active' });
        const accountIds = accounts.map(account => account._id);
        const Transaction = (await import('../models/Transaction.js')).default;

        // Calculate date range based on period
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
            case '1month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case '3months':
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            case '6months':
                startDate.setMonth(startDate.getMonth() - 6);
                break;
            case '1year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
        }

        // Get spending by category
        const spendingByCategory = await Transaction.aggregate([
            {
                $match: {
                    fromAccount: { $in: accountIds },
                    status: 'completed',
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$subType',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                    avgAmount: { $avg: '$amount' }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);

        // Get monthly spending trend
        const monthlyTrend = await Transaction.aggregate([
            {
                $match: {
                    fromAccount: { $in: accountIds },
                    status: 'completed',
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Get income vs expenses
        const incomeExpenses = await Transaction.aggregate([
            {
                $match: {
                    $or: [
                        { fromAccount: { $in: accountIds } },
                        { toAccount: { $in: accountIds } }
                    ],
                    status: 'completed',
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalIncome: {
                        $sum: {
                            $cond: [
                                { $in: ['$toAccount', accountIds] },
                                '$amount',
                                0
                            ]
                        }
                    },
                    totalExpenses: {
                        $sum: {
                            $cond: [
                                { $in: ['$fromAccount', accountIds] },
                                '$amount',
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                period,
                spendingByCategory,
                monthlyTrend,
                incomeExpenses: incomeExpenses[0] || { totalIncome: 0, totalExpenses: 0 },
                accounts: accounts.length,
                totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0)
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/users/transactions:
 *   get:
 *     summary: Get user's transaction history with filters
 *     tags: [Users]
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
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Transaction type filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Transaction status filter
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: Minimum amount filter
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: Maximum amount filter
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         description: Specific account ID filter
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
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
 *                   example: 20
 *                 total:
 *                   type: number
 *                   example: 150
 *                 page:
 *                   type: number
 *                   example: 1
 *                 pages:
 *                   type: number
 *                   example: 8
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized
 */
// @desc    Get user's transaction history with advanced filters
// @route   GET /api/users/transactions
// @access  Private
router.get('/transactions', protect, async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            type,
            status,
            startDate,
            endDate,
            minAmount,
            maxAmount,
            accountId
        } = req.query;

        const accounts = await Account.find({ userId: req.user.id });
        const accountIds = accounts.map(account => account._id);
        const Transaction = (await import('../models/Transaction.js')).default;

        let matchConditions = {
            $or: [
                { fromAccount: { $in: accountIds } },
                { toAccount: { $in: accountIds } }
            ]
        };

        // Search functionality - search in description, transactionId, and account details
        if (search && search.trim()) {
            const searchRegex = { $regex: search.trim(), $options: 'i' };
            matchConditions.$and = matchConditions.$and || [];
            matchConditions.$and.push({
                $or: [
                    { description: searchRegex },
                    { transactionId: searchRegex },
                    { 'thirdParty.accountTitle': searchRegex },
                    { 'billPayment.billerName': searchRegex },
                    { 'merchant.name': searchRegex }
                ]
            });
        }

        // Apply filters
        if (type && type.trim()) {
            matchConditions.type = type.trim();
        }

        if (status && status.trim()) {
            matchConditions.status = status.trim();
        }

        // Account filter - override the main account condition if specific account is selected
        if (accountId && accountId.trim()) {
            const mongoose = await import('mongoose');
            if (mongoose.default.Types.ObjectId.isValid(accountId)) {
                matchConditions.$or = [
                    { fromAccount: new mongoose.default.Types.ObjectId(accountId) },
                    { toAccount: new mongoose.default.Types.ObjectId(accountId) }
                ];
            }
        }

        // Date range filter
        if (startDate || endDate) {
            matchConditions.createdAt = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                matchConditions.createdAt.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchConditions.createdAt.$lte = end;
            }
        }

        // Amount range filter
        if (minAmount || maxAmount) {
            matchConditions.amount = {};
            if (minAmount && !isNaN(Number(minAmount))) {
                matchConditions.amount.$gte = Number(minAmount);
            }
            if (maxAmount && !isNaN(Number(maxAmount))) {
                matchConditions.amount.$lte = Number(maxAmount);
            }
        }

        // Enhanced transaction query with direction calculation
        const aggregationPipeline = [
            { $match: matchConditions },
            {
                $lookup: {
                    from: 'accounts',
                    localField: 'fromAccount',
                    foreignField: '_id',
                    as: 'fromAccountDetails'
                }
            },
            {
                $lookup: {
                    from: 'accounts',
                    localField: 'toAccount',
                    foreignField: '_id',
                    as: 'toAccountDetails'
                }
            },
            {
                $addFields: {
                    direction: {
                        $cond: [
                            {
                                $and: [
                                    { $in: ['$fromAccount', accountIds] },
                                    { $in: ['$toAccount', accountIds] }
                                ]
                            },
                            'transfer_self',
                            {
                                $cond: [
                                    { $in: ['$fromAccount', accountIds] },
                                    {
                                        $cond: [
                                            { $eq: ['$subType', 'external_transfer'] },
                                            'external_debit',
                                            'debit'
                                        ]
                                    },
                                    {
                                        $cond: [
                                            { $in: ['$toAccount', accountIds] },
                                            {
                                                $cond: [
                                                    { $eq: ['$subType', 'external_transfer'] },
                                                    'external_credit',
                                                    'credit'
                                                ]
                                            },
                                            // Final fallback based on transaction type
                                            {
                                                $switch: {
                                                    branches: [
                                                        { case: { $eq: ['$type', 'deposit'] }, then: 'credit' },
                                                        { case: { $eq: ['$type', 'withdrawal'] }, then: 'debit' },
                                                        { case: { $eq: ['$type', 'interest'] }, then: 'credit' },
                                                        { case: { $eq: ['$type', 'fee'] }, then: 'debit' },
                                                        { case: { $eq: ['$type', 'payment'] }, then: 'debit' },
                                                        { case: { $eq: ['$type', 'refund'] }, then: 'credit' }
                                                    ],
                                                    default: 'debit'
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                }
            },
            { $sort: { createdAt: -1 } }
        ];

        // Get total count for pagination
        const totalPipeline = [...aggregationPipeline, { $count: "total" }];
        const totalResult = await Transaction.aggregate(totalPipeline);
        const total = totalResult[0]?.total || 0;

        // Get paginated results
        const transactions = await Transaction.aggregate([
            ...aggregationPipeline,
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) }
        ]);

        res.status(200).json({
            success: true,
            count: transactions.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: transactions
        });
    } catch (error) {
        console.error('Transaction fetch error:', error);
        next(error);
    }
});

/**
 * @swagger
 * /api/users/export-transactions:
 *   get:
 *     summary: Export transaction data
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *           default: csv
 *         description: Export format
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for export
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for export
 *     responses:
 *       200:
 *         description: Transaction data exported successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized
 */
// @desc    Export transaction data
// @route   GET /api/users/export-transactions
// @access  Private
router.get('/export-transactions', protect, async (req, res, next) => {
    try {
        const { format = 'csv', startDate, endDate } = req.query;

        const accounts = await Account.find({ userId: req.user.id });
        const accountIds = accounts.map(account => account._id);
        const Transaction = (await import('../models/Transaction.js')).default;

        let matchConditions = {
            $or: [
                { fromAccount: { $in: accountIds } },
                { toAccount: { $in: accountIds } }
            ],
            status: 'completed'
        };

        if (startDate || endDate) {
            matchConditions.createdAt = {};
            if (startDate) matchConditions.createdAt.$gte = new Date(startDate);
            if (endDate) matchConditions.createdAt.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(matchConditions)
            .populate('fromAccount toAccount', 'accountNumber accountTitle')
            .sort({ createdAt: -1 });

        if (format === 'csv') {
            const csvData = transactions.map(t => ({
                Date: t.createdAt.toISOString().split('T')[0],
                'Transaction ID': t.transactionId,
                Description: t.description,
                Type: t.type,
                Amount: t.amount,
                'From Account': t.fromAccount?.accountNumber || 'N/A',
                'To Account': t.toAccount?.accountNumber || 'N/A',
                Status: t.status
            }));

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');

            // Simple CSV generation
            const headers = Object.keys(csvData[0] || {});
            const csvContent = [
                headers.join(','),
                ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
            ].join('\n');

            res.send(csvContent);
        } else {
            res.status(200).json({
                success: true,
                data: transactions
            });
        }
    } catch (error) {
        next(error);
    }
});

export default router;
