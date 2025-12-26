import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler.js';
import { protect } from '../middleware/auth.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import logger from '../utils/logger.js';
import { notifyTransactionCompleted } from '../utils/notificationHelper.js';

const router = express.Router();

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction (Transfer/Payment/Withdrawal)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - fromAccountId
 *               - amount
 *               - description
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [transfer, payment, withdrawal]
 *                 example: "transfer"
 *               fromAccountId:
 *                 type: string
 *                 format: objectId
 *                 example: "60f7b3b3e1b3c12a3c4d5e6f"
 *               toAccountId:
 *                 type: string
 *                 format: objectId
 *                 description: Required for transfers
 *                 example: "60f7b3b3e1b3c12a3c4d5e70"
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 5000.50
 *               description:
 *                 type: string
 *                 maxLength: 200
 *                 example: "Monthly rent payment"
 *               channel:
 *                 type: string
 *                 enum: [online, mobile, atm, branch]
 *                 default: online
 *                 example: "online"
 *               thirdParty:
 *                 type: object
 *                 description: Third party payment details
 *                 properties:
 *                   name:
 *                     type: string
 *                   accountNumber:
 *                     type: string
 *                   bankCode:
 *                     type: string
 *               billPayment:
 *                 type: object
 *                 description: Bill payment details
 *                 properties:
 *                   billType:
 *                     type: string
 *                   billNumber:
 *                     type: string
 *                   dueDate:
 *                     type: string
 *                     format: date
 *     responses:
 *       201:
 *         description: Transaction completed successfully
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
 *                   example: "Transaction completed successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Validation error, insufficient funds, or limit exceeded
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to use this account
 *       404:
 *         description: Account not found
 */
// @desc    Create a new transaction (Transfer/Payment)
// @route   POST /api/transactions
// @access  Private
router.post('/', protect, [
    body('type').isIn(['transfer', 'payment', 'withdrawal']).withMessage('Invalid transaction type'),
    body('fromAccountId').isMongoId().withMessage('Invalid source account ID'),
    body('amount').isNumeric().withMessage('Amount must be a number').custom(value => {
        if (value <= 0) throw new Error('Amount must be greater than 0');
        return true;
    }),
    body('description').notEmpty().withMessage('Description is required')
        .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const {
            type,
            fromAccountId,
            toAccountId,
            amount,
            description,
            channel = 'online',
            thirdParty,
            billPayment
        } = req.body;

        // Get source account
        const fromAccount = await Account.findById(fromAccountId);
        if (!fromAccount) {
            return next(new AppError('Source account not found', 404));
        }

        // Check ownership of source account
        if (fromAccount.userId.toString() !== req.user.id) {
            return next(new AppError('Not authorized to use this account', 403));
        }

        // Check account status
        if (fromAccount.status !== 'active') {
            return next(new AppError('Source account is not active', 400));
        }

        // Check if account can be debited
        if (!fromAccount.canDebit(amount)) {
            return next(new AppError('Insufficient funds or minimum balance constraint', 400));
        }

        // Check daily transaction limit
        try {
            const limitCheck = await fromAccount.checkDailyLimit(amount);
            if (!limitCheck.canTransact) {
                const formatCurrency = (amount) => new Intl.NumberFormat('en-PK', {
                    style: 'currency',
                    currency: 'PKR',
                    minimumFractionDigits: 0
                }).format(amount);

                const errorMessage = fromAccount.accountType === 'fixed_deposit'
                    ? `Fixed deposit accounts do not allow transactions. Please use a different account for transfers.`
                    : `Daily transaction limit exceeded. You have used ${formatCurrency(limitCheck.dailyTotal)} of your ${formatCurrency(limitCheck.dailyLimit)} daily limit. Remaining limit: ${formatCurrency(limitCheck.remainingLimit)}. This transaction would exceed your limit by ${formatCurrency(limitCheck.exceedsBy)}. Please try a smaller amount or wait until tomorrow.`;

                const error = new AppError(
                    errorMessage,
                    400,
                    'DAILY_LIMIT_EXCEEDED',
                    {
                        dailyTotal: limitCheck.dailyTotal,
                        dailyLimit: limitCheck.dailyLimit,
                        remainingLimit: limitCheck.remainingLimit,
                        requestedAmount: limitCheck.requestedAmount,
                        exceedsBy: limitCheck.exceedsBy,
                        accountType: fromAccount.accountType
                    }
                );

                return next(error);
            }
        } catch (limitError) {
            logger.error('Error checking daily limit:', limitError);
            return next(new AppError('Error checking transaction limits. Please try again.', 500));
        }

        let toAccount = null;
        let transactionData = {
            type,
            fromAccount: fromAccountId,
            amount,
            currency: 'PKR',
            description,
            channel,
            status: 'processing',
            fromAccountBalanceBefore: fromAccount.balance,
            deviceInfo: {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            }
        };

        // Handle different transaction types
        if (type === 'transfer') {
            if (toAccountId) {
                // Internal transfer (between user's own accounts)
                toAccount = await Account.findById(toAccountId);
                if (!toAccount) {
                    return next(new AppError('Destination account not found', 404));
                }

                if (toAccount.status !== 'active') {
                    return next(new AppError('Destination account is not active', 400));
                }

                transactionData.toAccount = toAccountId;
                transactionData.toAccountBalanceBefore = toAccount.balance;
                transactionData.subType = 'online_transfer';
            } else if (thirdParty && thirdParty.accountNumber) {
                // External transfer to another person's account
                toAccount = await Account.findByAccountNumber(thirdParty.accountNumber);

                if (!toAccount) {
                    return next(new AppError('Destination account not found or inactive', 404));
                }

                // Verify account title matches (basic security check)
                const titleMatch = toAccount.accountTitle.toLowerCase().includes(thirdParty.accountTitle.toLowerCase()) ||
                    thirdParty.accountTitle.toLowerCase().includes(toAccount.accountTitle.toLowerCase());

                if (!titleMatch) {
                    return next(new AppError('Account title does not match. Please verify the recipient details.', 400));
                }

                transactionData.toAccount = toAccount._id;
                transactionData.toAccountBalanceBefore = toAccount.balance;
                transactionData.subType = 'external_transfer';
                transactionData.thirdParty = thirdParty;
            } else {
                return next(new AppError('Destination account information is required for transfers', 400));
            }
        } else if (type === 'payment') {
            if (thirdParty) {
                transactionData.subType = 'bill_payment';
                transactionData.thirdParty = thirdParty;
            }
            if (billPayment) {
                transactionData.billPayment = billPayment;
            }
        }

        // Calculate fees (simplified)
        const fees = {
            transactionFee: type === 'transfer' && transactionData.subType === 'external_transfer' ? 50 : 0, // External transfer fee
            processingFee: 0,
            otherCharges: 0
        };
        fees.totalFees = fees.transactionFee + fees.processingFee + fees.otherCharges;
        transactionData.fees = fees;

        const totalAmount = amount + fees.transactionFee;

        // Final balance check including fees
        if (!fromAccount.canDebit(totalAmount)) {
            return next(new AppError('Insufficient funds including transaction fees', 400));
        }

        // Create transaction record first
        const transaction = new Transaction(transactionData);
        await transaction.save();

        try {
            // Update account balances sequentially
            fromAccount.balance -= totalAmount;
            fromAccount.availableBalance = fromAccount.balance;
            transaction.fromAccountBalanceAfter = fromAccount.balance;
            await fromAccount.save();

            if (toAccount) {
                toAccount.balance += amount;
                toAccount.availableBalance = toAccount.balance;
                transaction.toAccountBalanceAfter = toAccount.balance;
                await toAccount.save();
            }

            // Mark transaction as completed
            transaction.status = 'completed';
            transaction.processedAt = new Date();
            await transaction.save();

            logger.info(`Transaction created: ${transaction.transactionId} by user: ${req.user.email}`);

            // Send real-time notification via WebSocket
            await notifyTransactionCompleted(req.user.id, {
                _id: transaction._id,
                amount: transaction.amount,
                type: transaction.type
            });

            res.status(201).json({
                success: true,
                message: 'Transaction completed successfully',
                data: transaction
            });

        } catch (updateError) {
            // If account updates fail, mark transaction as failed
            transaction.status = 'failed';
            await transaction.save();
            throw updateError;
        }

    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get user's transactions with filters
 *     tags: [Transactions]
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
 *           enum: [transfer, payment, withdrawal, deposit]
 *         description: Transaction type filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled]
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
 *         name: accountId
 *         schema:
 *           type: string
 *         description: Filter by specific account
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
// @desc    Get user's transactions
// @route   GET /api/transactions
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            type,
            status,
            startDate,
            endDate,
            accountId
        } = req.query;

        // Get user's accounts
        const userAccounts = await Account.find({ userId: req.user.id }).select('_id');
        const accountIds = userAccounts.map(account => account._id);

        let query = {
            $or: [
                { fromAccount: { $in: accountIds } },
                { toAccount: { $in: accountIds } }
            ]
        };

        if (type) query.type = type;
        if (status) query.status = status;
        if (accountId) {
            query = {
                $or: [
                    { fromAccount: accountId },
                    { toAccount: accountId }
                ]
            };
        }

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const transactions = await Transaction.find(query)
            .populate('fromAccount', 'accountNumber accountTitle')
            .populate('toAccount', 'accountNumber accountTitle')
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
 * /api/transactions/{id}:
 *   get:
 *     summary: Get single transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to view this transaction
 *       404:
 *         description: Transaction not found
 */
// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('fromAccount', 'accountNumber accountTitle userId')
            .populate('toAccount', 'accountNumber accountTitle userId');

        if (!transaction) {
            return next(new AppError('Transaction not found', 404));
        }

        // Check if user is authorized to view this transaction
        const isAuthorized =
            (transaction.fromAccount && transaction.fromAccount.userId.toString() === req.user.id) ||
            (transaction.toAccount && transaction.toAccount.userId.toString() === req.user.id);

        if (!isAuthorized) {
            return next(new AppError('Not authorized to view this transaction', 403));
        }

        res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/transactions/{id}/receipt:
 *   get:
 *     summary: Get transaction receipt
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction receipt retrieved successfully
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
 *                     transactionId:
 *                       type: string
 *                       example: "TXN-20240612-001234"
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     type:
 *                       type: string
 *                       example: "transfer"
 *                     subType:
 *                       type: string
 *                       example: "online_transfer"
 *                     amount:
 *                       type: string
 *                       example: "PKR 5,000.50"
 *                     fees:
 *                       type: object
 *                       properties:
 *                         transactionFee:
 *                           type: number
 *                         processingFee:
 *                           type: number
 *                         otherCharges:
 *                           type: number
 *                     description:
 *                       type: string
 *                       example: "Monthly rent payment"
 *                     status:
 *                       type: string
 *                       example: "completed"
 *                     fromAccount:
 *                       type: object
 *                       properties:
 *                         accountNumber:
 *                           type: string
 *                         accountTitle:
 *                           type: string
 *                     toAccount:
 *                       type: object
 *                       properties:
 *                         accountNumber:
 *                           type: string
 *                         accountTitle:
 *                           type: string
 *                     referenceNumber:
 *                       type: string
 *                     channel:
 *                       type: string
 *                       example: "online"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to view this transaction
 *       404:
 *         description: Transaction not found
 */
// @desc    Get transaction receipt
// @route   GET /api/transactions/:id/receipt
// @access  Private
router.get('/:id/receipt', protect, async (req, res, next) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('fromAccount', 'accountNumber accountTitle userId')
            .populate('toAccount', 'accountNumber accountTitle userId');

        if (!transaction) {
            return next(new AppError('Transaction not found', 404));
        }

        // Check authorization
        const isAuthorized =
            (transaction.fromAccount && transaction.fromAccount.userId.toString() === req.user.id) ||
            (transaction.toAccount && transaction.toAccount.userId.toString() === req.user.id);

        if (!isAuthorized) {
            return next(new AppError('Not authorized to view this transaction', 403));
        }

        const receipt = {
            transactionId: transaction.transactionId,
            date: transaction.createdAt,
            type: transaction.type,
            subType: transaction.subType,
            amount: transaction.formattedAmount,
            fees: transaction.fees,
            description: transaction.description,
            status: transaction.status,
            fromAccount: transaction.fromAccount ? {
                accountNumber: transaction.fromAccount.accountNumber,
                accountTitle: transaction.fromAccount.accountTitle
            } : null,
            toAccount: transaction.toAccount ? {
                accountNumber: transaction.toAccount.accountNumber,
                accountTitle: transaction.toAccount.accountTitle
            } : null,
            referenceNumber: transaction.referenceNumber,
            channel: transaction.channel
        };

        res.status(200).json({
            success: true,
            data: receipt
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/transactions/{id}/cancel:
 *   put:
 *     summary: Cancel pending transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction cancelled successfully
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
 *                   example: "Transaction cancelled successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Only pending transactions can be cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to cancel this transaction
 *       404:
 *         description: Transaction not found
 */
// @desc    Cancel pending transaction
// @route   PUT /api/transactions/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res, next) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return next(new AppError('Transaction not found', 404));
        }

        // Check if transaction belongs to user
        const fromAccount = await Account.findById(transaction.fromAccount);
        if (!fromAccount || fromAccount.userId.toString() !== req.user.id) {
            return next(new AppError('Not authorized to cancel this transaction', 403));
        }

        // Check if transaction can be cancelled
        if (transaction.status !== 'pending') {
            return next(new AppError('Only pending transactions can be cancelled', 400));
        }

        // Update transaction status
        transaction.status = 'cancelled';
        await transaction.save();

        logger.info(`Transaction cancelled: ${transaction.transactionId} by user: ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Transaction cancelled successfully',
            data: transaction
        });

    } catch (error) {
        next(error);
    }
});

export default router;
