import express from 'express';
import { body, validationResult } from 'express-validator';
import { AppError } from '../middleware/errorHandler.js';
import { protect, authorize } from '../middleware/auth.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import logger from '../utils/logger.js';
import { createUserNotification } from '../utils/notificationHelper.js';

const router = express.Router();

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Get all accounts for logged in user
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Accounts retrieved successfully
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
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Account'
 *       401:
 *         description: Unauthorized
 */
// @desc    Get all accounts for logged in user
// @route   GET /api/accounts
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const accounts = await Account.find({
            userId: req.user.id,
            status: { $ne: 'closed' }
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: accounts.length,
            data: accounts
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     summary: Get single account by ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     responses:
 *       200:
 *         description: Account retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Account'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to access this account
 *       404:
 *         description: Account not found
 */
// @desc    Get single account
// @route   GET /api/accounts/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
    try {
        const account = await Account.findById(req.params.id).populate('userId', 'firstName lastName email');

        if (!account) {
            return next(new AppError('Account not found', 404));
        }

        // Check if user owns the account or is authorized to view it
        if (account.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new AppError('Not authorized to access this account', 403));
        }

        res.status(200).json({
            success: true,
            data: account
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Create new account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountType
 *               - accountTitle
 *               - branchCode
 *               - branchName
 *             properties:
 *               accountType:
 *                 type: string
 *                 enum: [savings, current, fixed_deposit, islamic_savings, salary]
 *                 example: "savings"
 *               accountTitle:
 *                 type: string
 *                 maxLength: 100
 *                 example: "John Doe Savings"
 *               branchCode:
 *                 type: string
 *                 pattern: "^[0-9]{4}$"
 *                 example: "1234"
 *               branchName:
 *                 type: string
 *                 example: "Karachi Main Branch"
 *               initialDeposit:
 *                 type: number
 *                 minimum: 1000
 *                 example: 5000
 *               depositTerm:
 *                 type: number
 *                 description: Term in months (for fixed deposits)
 *                 example: 12
 *               maturityDate:
 *                 type: string
 *                 format: date
 *                 description: Maturity date (for fixed deposits)
 *     responses:
 *       201:
 *         description: Account created successfully
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
 *                   example: "Account created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Account'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
// @desc    Create new account
// @route   POST /api/accounts
// @access  Private
router.post('/', protect, [
    body('accountType').isIn(['savings', 'current', 'fixed_deposit', 'islamic_savings', 'salary'])
        .withMessage('Please provide a valid account type'),
    body('accountTitle').notEmpty().withMessage('Account title is required')
        .isLength({ max: 100 }).withMessage('Account title cannot exceed 100 characters'),
    body('branchCode').matches(/^[0-9]{4}$/).withMessage('Branch code must be 4 digits'),
    body('branchName').notEmpty().withMessage('Branch name is required'),
    body('initialDeposit').optional().isNumeric().withMessage('Initial deposit must be a number')
        .custom(value => value >= 1000).withMessage('Minimum initial deposit is PKR 1,000')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const {
            accountType,
            accountTitle,
            branchCode,
            branchName,
            initialDeposit = 0,
            depositTerm,
            maturityDate
        } = req.body;

        // Set account specific configurations
        let accountConfig = {
            minimumBalance: 1000,
            interestRate: 0,
            dailyTransactionLimit: 500000,
            monthlyTransactionLimit: 2000000
        };

        switch (accountType) {
            case 'savings':
                accountConfig.interestRate = 7.5;
                break;
            case 'current':
                accountConfig.minimumBalance = 5000;
                accountConfig.dailyTransactionLimit = 1000000;
                accountConfig.monthlyTransactionLimit = 5000000;
                break;
            case 'fixed_deposit':
                accountConfig.interestRate = 12.5;
                accountConfig.minimumBalance = 50000;
                accountConfig.dailyTransactionLimit = 0; // No transactions allowed
                break;
            case 'islamic_savings':
                accountConfig.interestRate = 6.5;
                break;
            case 'salary':
                accountConfig.minimumBalance = 0;
                accountConfig.interestRate = 5.0;
                break;
        }

        const account = await Account.create({
            userId: req.user.id,
            accountType,
            accountTitle,
            branchCode,
            branchName,
            balance: initialDeposit,
            availableBalance: initialDeposit,
            ...accountConfig,
            ...(depositTerm && { depositTerm }),
            ...(maturityDate && { maturityDate })
        });

        // Create initial deposit transaction if there's an initial deposit
        if (initialDeposit > 0) {
            await Transaction.create({
                type: 'deposit',
                subType: 'branch_deposit',
                toAccount: account._id,
                amount: initialDeposit,
                currency: 'PKR',
                status: 'completed',
                description: 'Initial deposit',
                channel: 'branch',
                toAccountBalanceBefore: 0,
                toAccountBalanceAfter: initialDeposit
            });
        }

        logger.info(`New account created: ${account.accountNumber} for user: ${req.user.email}`);

        // Send real-time notification via WebSocket
        await createUserNotification(req.user.id, {
            title: 'Account Created',
            message: `Your ${accountType} account ${account.accountNumber} has been created successfully`,
            type: 'account',
            data: {
                accountId: account._id,
                accountNumber: account.accountNumber,
                accountType: accountType
            }
        });

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: account
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/accounts/{id}:
 *   put:
 *     summary: Update account details
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountTitle:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Updated Account Title"
 *               dailyTransactionLimit:
 *                 type: number
 *                 example: 100000
 *               monthlyTransactionLimit:
 *                 type: number
 *                 example: 500000
 *               statementPreference:
 *                 type: string
 *                 enum: [email, sms, postal]
 *                 example: "email"
 *               flags:
 *                 type: object
 *     responses:
 *       200:
 *         description: Account updated successfully
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
 *                   example: "Account updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Account'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to update this account
 *       404:
 *         description: Account not found
 */
// @desc    Update account details
// @route   PUT /api/accounts/:id
// @access  Private
router.put('/:id', protect, [
    body('accountTitle').optional().notEmpty().withMessage('Account title cannot be empty')
        .isLength({ max: 100 }).withMessage('Account title cannot exceed 100 characters'),
    body('dailyTransactionLimit').optional().isNumeric().withMessage('Daily limit must be a number'),
    body('monthlyTransactionLimit').optional().isNumeric().withMessage('Monthly limit must be a number')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const account = await Account.findById(req.params.id);

        if (!account) {
            return next(new AppError('Account not found', 404));
        }

        // Check ownership
        if (account.userId.toString() !== req.user.id) {
            return next(new AppError('Not authorized to update this account', 403));
        }

        const allowedUpdates = ['accountTitle', 'dailyTransactionLimit', 'monthlyTransactionLimit', 'statementPreference', 'flags'];
        const updates = {};

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const updatedAccount = await Account.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        logger.info(`Account updated: ${account.accountNumber} by user: ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Account updated successfully',
            data: updatedAccount
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/accounts/{id}/balance:
 *   get:
 *     summary: Get account balance
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     responses:
 *       200:
 *         description: Account balance retrieved successfully
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
 *                     accountNumber:
 *                       type: string
 *                       example: "1234-5678-9012-3456"
 *                     balance:
 *                       type: number
 *                       example: 75000.50
 *                     availableBalance:
 *                       type: number
 *                       example: 73000.50
 *                     formattedBalance:
 *                       type: string
 *                       example: "PKR 75,000.50"
 *                     currency:
 *                       type: string
 *                       example: "PKR"
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to view this account balance
 *       404:
 *         description: Account not found
 */
// @desc    Get account balance
// @route   GET /api/accounts/:id/balance
// @access  Private
router.get('/:id/balance', protect, async (req, res, next) => {
    try {
        const account = await Account.findById(req.params.id);

        if (!account) {
            return next(new AppError('Account not found', 404));
        }

        // Check ownership
        if (account.userId.toString() !== req.user.id) {
            return next(new AppError('Not authorized to view this account balance', 403));
        }

        res.status(200).json({
            success: true,
            data: {
                accountNumber: account.formattedAccountNumber,
                balance: account.balance,
                availableBalance: account.availableBalance,
                formattedBalance: account.formattedBalance,
                currency: 'PKR',
                lastUpdated: account.updatedAt
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/accounts/{id}/transactions:
 *   get:
 *     summary: Get account transaction history
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
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
 *         name: type
 *         schema:
 *           type: string
 *         description: Transaction type filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           default: completed
 *         description: Transaction status filter
 *     responses:
 *       200:
 *         description: Account transaction history retrieved successfully
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/Transaction'
 *                       - type: object
 *                         properties:
 *                           direction:
 *                             type: string
 *                             enum: [debit, credit, unknown]
 *                             example: "debit"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to view this account transactions
 *       404:
 *         description: Account not found
 */
// @desc    Get account transaction history
// @route   GET /api/accounts/:id/transactions
// @access  Private
router.get('/:id/transactions', protect, async (req, res, next) => {
    try {
        const account = await Account.findById(req.params.id);

        if (!account) {
            return next(new AppError('Account not found', 404));
        }

        // Check ownership
        if (account.userId.toString() !== req.user.id) {
            return next(new AppError('Not authorized to view this account transactions', 403));
        }

        const {
            page = 1,
            limit = 20,
            startDate,
            endDate,
            type,
            status = 'completed'
        } = req.query;

        const options = {
            limit: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit),
            startDate,
            endDate,
            type,
            status
        };

        const transactions = await Transaction.getAccountHistory(req.params.id, options);

        // Add direction field to each transaction
        const transactionsWithDirection = transactions.map(transaction => {
            const transactionObj = transaction.toObject();
            const isFromAccount = transaction.fromAccount && transaction.fromAccount._id.toString() === req.params.id;
            const isToAccount = transaction.toAccount && transaction.toAccount._id.toString() === req.params.id;

            // Determine direction based on transaction type and account involvement
            let direction = 'unknown';

            switch (transaction.type) {
                case 'deposit':
                    direction = 'credit'; // Always credit for deposits
                    break;
                case 'withdrawal':
                    direction = 'debit'; // Always debit for withdrawals
                    break;
                case 'transfer':
                    if (isFromAccount && isToAccount) {
                        // Self transfer - show as neutral or based on description
                        direction = 'transfer_self';
                    } else if (isFromAccount) {
                        // Check if it's an external transfer by looking at subType
                        if (transaction.subType === 'external_transfer') {
                            direction = 'external_debit'; // Money going out to external account
                        } else {
                            direction = 'debit'; // Money going out (internal)
                        }
                    } else if (isToAccount) {
                        // Check if it's an external transfer by looking at subType
                        if (transaction.subType === 'external_transfer') {
                            direction = 'external_credit'; // Money coming in from external account
                        } else {
                            direction = 'credit'; // Money coming in (internal)
                        }
                    }
                    break;
                case 'payment':
                    direction = 'debit'; // Payments are always outgoing
                    break;
                case 'fee':
                    direction = 'debit'; // Fees are always debited
                    break;
                case 'interest':
                    direction = 'credit'; // Interest earned is always credit
                    break;
                case 'reversal':
                    // For reversals, check the original transaction direction
                    if (isFromAccount && isToAccount) {
                        direction = 'reversal_self';
                    } else if (isFromAccount) {
                        direction = 'credit'; // Reversal of debit becomes credit
                    } else if (isToAccount) {
                        direction = 'debit'; // Reversal of credit becomes debit
                    }
                    break;
                case 'refund':
                    direction = 'credit'; // Refunds are always incoming
                    break;
                default:
                    // Fallback to account-based logic for unknown types
                    if (isFromAccount && isToAccount) {
                        direction = 'transfer_self'; // Self transfer
                    } else if (isFromAccount) {
                        direction = 'debit'; // Money going out
                    } else if (isToAccount) {
                        direction = 'credit'; // Money coming in
                    } else {
                        // If neither fromAccount nor toAccount matches, check transaction type
                        direction = transaction.type === 'deposit' ? 'credit' : 'debit';
                    }
            }

            transactionObj.direction = direction;
            return transactionObj;
        });

        const total = await Transaction.countDocuments({
            $or: [
                { fromAccount: req.params.id },
                { toAccount: req.params.id }
            ],
            status
        });

        res.status(200).json({
            success: true,
            count: transactions.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: transactionsWithDirection
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/accounts/{id}/summary/{year}/{month}:
 *   get:
 *     summary: Get account monthly summary
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year (YYYY)
 *         example: 2024
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month (1-12)
 *         example: 6
 *     responses:
 *       200:
 *         description: Account monthly summary retrieved successfully
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
 *                     year:
 *                       type: number
 *                       example: 2024
 *                     month:
 *                       type: number
 *                       example: 6
 *                     summary:
 *                       type: object
 *                       description: Monthly transaction summary with totals and counts
 *       400:
 *         description: Invalid year or month
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to view this account summary
 *       404:
 *         description: Account not found
 */
// @desc    Get account monthly summary
// @route   GET /api/accounts/:id/summary/:year/:month
// @access  Private
router.get('/:id/summary/:year/:month', protect, async (req, res, next) => {
    try {
        const account = await Account.findById(req.params.id);

        if (!account) {
            return next(new AppError('Account not found', 404));
        }

        // Check ownership
        if (account.userId.toString() !== req.user.id) {
            return next(new AppError('Not authorized to view this account summary', 403));
        }

        const { year, month } = req.params;

        if (!year || !month || month < 1 || month > 12) {
            return next(new AppError('Please provide valid year and month', 400));
        }

        const summary = await Transaction.getMonthlySummary(req.params.id, parseInt(year), parseInt(month));

        res.status(200).json({
            success: true,
            data: {
                year: parseInt(year),
                month: parseInt(month),
                summary
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/accounts/{id}/close:
 *   put:
 *     summary: Close account (Admin only)
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     responses:
 *       200:
 *         description: Account closed successfully
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
 *                   example: "Account closed successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Account'
 *       400:
 *         description: Account already closed or has positive balance
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Account not found
 */
// @desc    Close account (Admin only)
// @route   PUT /api/accounts/:id/close
// @access  Private (Admin)
router.put('/:id/close', protect, authorize('admin', 'manager'), async (req, res, next) => {
    try {
        const account = await Account.findById(req.params.id);

        if (!account) {
            return next(new AppError('Account not found', 404));
        }

        if (account.status === 'closed') {
            return next(new AppError('Account is already closed', 400));
        }

        if (account.balance > 0) {
            return next(new AppError('Cannot close account with positive balance', 400));
        }

        account.status = 'closed';
        account.closingDate = new Date();
        await account.save();

        logger.info(`Account closed: ${account.accountNumber} by admin: ${req.user.email}`);

        // Send real-time notification via WebSocket
        await createUserNotification(account.userId.toString(), {
            title: 'Account Closed',
            message: `Your ${account.accountType} account ${account.accountNumber} has been closed`,
            type: 'account',
            data: {
                accountId: account._id,
                accountNumber: account.accountNumber,
                closingDate: new Date()
            }
        });

        res.status(200).json({
            success: true,
            message: 'Account closed successfully',
            data: account
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/accounts/lookup/{accountNumber}:
 *   get:
 *     summary: Lookup account by account number (for transfer verification)
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Account number to lookup
 *     responses:
 *       200:
 *         description: Account found
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
 *                     accountNumber:
 *                       type: string
 *                     accountTitle:
 *                       type: string
 *                     accountType:
 *                       type: string
 *       404:
 *         description: Account not found
 */
// @desc    Lookup account by account number
// @route   GET /api/accounts/lookup/:accountNumber
// @access  Private
router.get('/lookup/:accountNumber', protect, async (req, res, next) => {
    try {
        const account = await Account.findByAccountNumber(req.params.accountNumber);

        if (!account) {
            return next(new AppError('Account not found', 404));
        }

        // Return limited account info for verification
        res.status(200).json({
            success: true,
            data: {
                accountNumber: account.formattedAccountNumber,
                accountTitle: account.accountTitle,
                accountType: account.accountType
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
