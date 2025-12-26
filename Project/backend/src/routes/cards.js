import express from 'express';
import { body, validationResult } from 'express-validator';
import { AppError } from '../middleware/errorHandler.js';
import { protect } from '../middleware/auth.js';
import Account from '../models/Account.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import { notifyCardStatusChanged } from '../utils/notificationHelper.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Card:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Card ID
 *         cardNumber:
 *           type: string
 *           description: Masked card number
 *           example: "4532-****-****-1234"
 *         maskedCardNumber:
 *           type: string
 *           description: Masked card number
 *           example: "4532-****-****-1234"
 *         cardType:
 *           type: string
 *           enum: [debit, credit]
 *           description: Type of card
 *         cardStatus:
 *           type: string
 *           enum: [active, blocked, pending, expired]
 *           description: Current status of the card
 *         expiryDate:
 *           type: string
 *           format: date-time
 *           description: Card expiry date
 *         cardName:
 *           type: string
 *           description: Name on the card
 *         accountId:
 *           type: string
 *           description: Associated account ID
 *         isContactless:
 *           type: boolean
 *           description: Whether card supports contactless payments
 *         cardLimit:
 *           type: number
 *           description: Card spending limit (0 for debit cards)
 *         availableLimit:
 *           type: number
 *           description: Available spending limit
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Card creation date
 *         account:
 *           type: object
 *           properties:
 *             accountNumber:
 *               type: string
 *             accountTitle:
 *               type: string
 *             balance:
 *               type: number
 *             formattedBalance:
 *               type: string
 *
 *     CardRequest:
 *       type: object
 *       required:
 *         - accountId
 *         - cardType
 *       properties:
 *         accountId:
 *           type: string
 *           description: Account ID to link the card to
 *         cardType:
 *           type: string
 *           enum: [debit, credit]
 *           description: Type of card to request
 *         cardName:
 *           type: string
 *           description: Optional name for the card
 *
 *     CardStatusUpdate:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [active, blocked]
 *           description: New status for the card
 *         reason:
 *           type: string
 *           description: Optional reason for status change
 *
 *     PINUpdate:
 *       type: object
 *       required:
 *         - newPin
 *         - confirmPin
 *       properties:
 *         currentPin:
 *           type: string
 *           minLength: 4
 *           maxLength: 4
 *           description: Current PIN (optional for first-time setup)
 *         newPin:
 *           type: string
 *           minLength: 4
 *           maxLength: 4
 *           description: New PIN (4 digits)
 *         confirmPin:
 *           type: string
 *           minLength: 4
 *           maxLength: 4
 *           description: Confirm new PIN (must match newPin)
 *
 *     CardTransaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Transaction ID
 *         date:
 *           type: string
 *           format: date-time
 *           description: Transaction date
 *         description:
 *           type: string
 *           description: Transaction description
 *         amount:
 *           type: number
 *           description: Transaction amount
 *         type:
 *           type: string
 *           enum: [purchase, withdrawal, refund]
 *           description: Transaction type
 *         status:
 *           type: string
 *           enum: [completed, pending, failed]
 *           description: Transaction status
 *         merchant:
 *           type: string
 *           description: Merchant name
 *         category:
 *           type: string
 *           description: Transaction category
 */

/**
 * @swagger
 * /api/cards:
 *   get:
 *     summary: Get user's cards
 *     description: Retrieve all cards associated with the authenticated user's accounts
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cards retrieved successfully
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
 *                   description: Number of cards returned
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Card'
 *             example:
 *               success: true
 *               count: 2
 *               data:
 *                 - _id: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                   cardNumber: "4532-****-****-1234"
 *                   cardType: "debit"
 *                   cardStatus: "active"
 *                   cardName: "John Doe"
 *                   cardLimit: 0
 *                   availableLimit: 0
 *                   account:
 *                     accountNumber: "001234567890"
 *                     balance: 25000
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// @desc    Get user's cards
// @route   GET /api/cards
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        // Create sample cards if none exist
        if (!user.cards || user.cards.length === 0) {
            const accounts = await Account.find({ userId: req.user.id });
            if (accounts.length > 0) {
                user.cards = [
                    {
                        cardNumber: '4532-****-****-1234',
                        maskedCardNumber: '4532-****-****-1234',
                        cardType: 'debit',
                        cardStatus: 'active',
                        expiryDate: new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000), // 4 years
                        cardName: `${user.firstName} ${user.lastName}`,
                        accountId: accounts[0]._id,
                        isContactless: true,
                        cardLimit: 0,
                        availableLimit: 0,
                        createdAt: new Date()
                    }
                ];

                if (accounts.length > 1 || accounts[0].accountType === 'current') {
                    user.cards.push({
                        cardNumber: '4532-****-****-5678',
                        maskedCardNumber: '4532-****-****-5678',
                        cardType: 'credit',
                        cardStatus: 'active',
                        expiryDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000), // 3 years
                        cardName: `${user.firstName} ${user.lastName}`,
                        accountId: accounts[0]._id,
                        isContactless: true,
                        cardLimit: 150000,
                        availableLimit: 145000,
                        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
                    });
                }

                await user.save();
            }
        }

        // Populate account details
        const cardsWithAccounts = await Promise.all(
            (user.cards || []).map(async (card) => {
                const account = await Account.findById(card.accountId);
                return {
                    ...card.toObject(),
                    account: account ? {
                        accountNumber: account.accountNumber,
                        accountTitle: account.accountTitle,
                        balance: account.balance,
                        formattedBalance: account.formattedBalance
                    } : null
                };
            })
        );

        res.status(200).json({
            success: true,
            count: cardsWithAccounts.length,
            data: cardsWithAccounts
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/cards:
 *   post:
 *     summary: Request a new card
 *     description: Submit a request for a new debit or credit card
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CardRequest'
 *           example:
 *             accountId: "64a1b2c3d4e5f6g7h8i9j0k1"
 *             cardType: "credit"
 *             cardName: "John Doe Business"
 *     responses:
 *       201:
 *         description: Card request submitted successfully
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
 *                   example: "Card request submitted successfully. Processing time: 5-7 business days."
 *                 data:
 *                   $ref: '#/components/schemas/Card'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Card type must be debit or credit"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Account not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Account not found or not authorized"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// @desc    Request new card
// @route   POST /api/cards
// @access  Private
router.post('/', protect, [
    body('accountId').isMongoId().withMessage('Valid account ID is required'),
    body('cardType').isIn(['debit', 'credit']).withMessage('Card type must be debit or credit'),
    body('cardName').optional().notEmpty().withMessage('Card name cannot be empty')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const { accountId, cardType, cardName } = req.body;

        // Verify account ownership
        const account = await Account.findOne({ _id: accountId, userId: req.user.id });
        if (!account) {
            return next(new AppError('Account not found or not authorized', 404));
        }

        const user = await User.findById(req.user.id);

        // Generate card details
        const lastFour = Math.floor(Math.random() * 9000) + 1000;
        const cardNumber = `4532-****-****-${lastFour}`;
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 4);

        const cardLimit = cardType === 'credit' ? 100000 : 0;

        const newCard = {
            cardNumber,
            maskedCardNumber: cardNumber,
            cardType,
            cardStatus: 'pending', // New cards start as pending
            expiryDate,
            cardName: cardName || `${user.firstName} ${user.lastName}`,
            accountId,
            isContactless: true,
            cardLimit,
            availableLimit: cardLimit,
            createdAt: new Date()
        };

        if (!user.cards) {
            user.cards = [];
        }

        user.cards.push(newCard);
        await user.save();

        // Add notification
        if (!user.notifications) {
            user.notifications = [];
        }

        user.notifications.push({
            title: 'Card Request Submitted',
            message: `Your ${cardType} card request has been submitted and is being processed. You will be notified once it's ready.`,
            type: 'account',
            read: false,
            createdAt: new Date()
        });

        await user.save();

        logger.info(`New ${cardType} card requested for account: ${account.accountNumber} by user: ${req.user.email}`);

        // Send real-time notification via WebSocket
        const createdCard = user.cards[user.cards.length - 1];
        await notifyCardStatusChanged(req.user.id, {
            _id: createdCard._id,
            status: 'pending',
            cardNumber: createdCard.cardNumber,
            cardType: createdCard.cardType
        });

        res.status(201).json({
            success: true,
            message: 'Card request submitted successfully. Processing time: 5-7 business days.',
            data: newCard
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/cards/{id}/status:
 *   put:
 *     summary: Block or unblock a card
 *     description: Change the status of a card to active or blocked
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CardStatusUpdate'
 *           examples:
 *             block_card:
 *               summary: Block a card
 *               value:
 *                 status: "blocked"
 *                 reason: "Suspicious activity detected"
 *             unblock_card:
 *               summary: Unblock a card
 *               value:
 *                 status: "active"
 *                 reason: "Issue resolved"
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
 *                   example: "Card blocked successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Card'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Status must be active or blocked"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Card not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Card not found"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// @desc    Block/Unblock card
// @route   PUT /api/cards/:id/status
// @access  Private
router.put('/:id/status', protect, [
    body('status').isIn(['active', 'blocked']).withMessage('Status must be active or blocked'),
    body('reason').optional().notEmpty().withMessage('Reason cannot be empty')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const user = await User.findById(req.user.id);
        const card = user.cards?.id(req.params.id);

        if (!card) {
            return next(new AppError('Card not found', 404));
        }

        const oldStatus = card.cardStatus;
        card.cardStatus = req.body.status;
        card.statusChangedAt = new Date();

        if (req.body.reason) {
            card.statusReason = req.body.reason;
        }

        await user.save();

        // Add notification
        if (!user.notifications) {
            user.notifications = [];
        }

        user.notifications.push({
            title: `Card ${req.body.status === 'blocked' ? 'Blocked' : 'Activated'}`,
            message: `Your ${card.cardType} card ending in ${card.cardNumber.slice(-4)} has been ${req.body.status}.`,
            type: 'security',
            read: false,
            createdAt: new Date()
        });

        await user.save();

        logger.info(`Card ${req.body.status}: ${card.cardNumber} (was ${oldStatus}) by user: ${req.user.email}`);

        // Send real-time notification via WebSocket
        await notifyCardStatusChanged(req.user.id, {
            _id: card._id,
            status: req.body.status,
            cardNumber: card.cardNumber,
            cardType: card.cardType
        });

        res.status(200).json({
            success: true,
            message: `Card ${req.body.status} successfully`,
            data: card
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/cards/{id}/pin:
 *   put:
 *     summary: Set or change card PIN
 *     description: Set a new PIN for a card or change existing PIN
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PINUpdate'
 *           examples:
 *             set_new_pin:
 *               summary: Set PIN for new card
 *               value:
 *                 newPin: "1234"
 *                 confirmPin: "1234"
 *             change_existing_pin:
 *               summary: Change existing PIN
 *               value:
 *                 currentPin: "1234"
 *                 newPin: "5678"
 *                 confirmPin: "5678"
 *     responses:
 *       200:
 *         description: PIN updated successfully
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
 *                   example: "PIN updated successfully"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               pin_mismatch:
 *                 summary: PIN confirmation mismatch
 *                 value:
 *                   success: false
 *                   error: "New PIN and confirm PIN do not match"
 *               invalid_pin:
 *                 summary: Invalid PIN format
 *                 value:
 *                   success: false
 *                   error: "New PIN must be 4 digits"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Card not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Card not found"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// @desc    Set card PIN
// @route   PUT /api/cards/:id/pin
// @access  Private
router.put('/:id/pin', protect, [
    body('currentPin').optional().isLength({ min: 4, max: 4 }).withMessage('Current PIN must be 4 digits'),
    body('newPin').isLength({ min: 4, max: 4 }).withMessage('New PIN must be 4 digits')
        .isNumeric().withMessage('PIN must contain only numbers'),
    body('confirmPin').isLength({ min: 4, max: 4 }).withMessage('Confirm PIN must be 4 digits')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const { newPin, confirmPin } = req.body;

        if (newPin !== confirmPin) {
            return next(new AppError('New PIN and confirm PIN do not match', 400));
        }

        const user = await User.findById(req.user.id);
        const card = user.cards?.id(req.params.id);

        if (!card) {
            return next(new AppError('Card not found', 404));
        }

        // In production, you would hash the PIN and verify current PIN
        card.pinSet = true;
        card.pinChangedAt = new Date();
        await user.save();

        // Add notification
        if (!user.notifications) {
            user.notifications = [];
        }

        user.notifications.push({
            title: 'PIN Changed Successfully',
            message: `PIN for your ${card.cardType} card ending in ${card.cardNumber.slice(-4)} has been updated.`,
            type: 'security',
            read: false,
            createdAt: new Date()
        });

        await user.save();

        logger.info(`PIN changed for card: ${card.cardNumber} by user: ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'PIN updated successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/cards/{id}/transactions:
 *   get:
 *     summary: Get card transactions
 *     description: Retrieve transaction history for a specific card with pagination
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of transactions per page
 *     responses:
 *       200:
 *         description: Card transactions retrieved successfully
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
 *                   description: Number of transactions in current page
 *                 total:
 *                   type: number
 *                   description: Total number of transactions
 *                 page:
 *                   type: number
 *                   description: Current page number
 *                 pages:
 *                   type: number
 *                   description: Total number of pages
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CardTransaction'
 *             example:
 *               success: true
 *               count: 3
 *               total: 3
 *               page: 1
 *               pages: 1
 *               data:
 *                 - id: "1"
 *                   date: "2025-06-13T10:30:00Z"
 *                   description: "Online Purchase - Amazon"
 *                   amount: 2500
 *                   type: "purchase"
 *                   status: "completed"
 *                   merchant: "Amazon.com"
 *                   category: "Shopping"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Card not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Card not found"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// @desc    Get card transactions
// @route   GET /api/cards/:id/transactions
// @access  Private
router.get('/:id/transactions', protect, async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const user = await User.findById(req.user.id);
        const card = user.cards?.id(req.params.id);

        if (!card) {
            return next(new AppError('Card not found', 404));
        }

        // Sample card transactions
        const sampleTransactions = [
            {
                id: '1',
                date: new Date(),
                description: 'Online Purchase - Amazon',
                amount: 2500,
                type: 'purchase',
                status: 'completed',
                merchant: 'Amazon.com',
                category: 'Shopping'
            },
            {
                id: '2',
                date: new Date(Date.now() - 24 * 60 * 60 * 1000),
                description: 'ATM Withdrawal',
                amount: 5000,
                type: 'withdrawal',
                status: 'completed',
                merchant: 'HBL ATM - Gulberg',
                category: 'Cash Withdrawal'
            },
            {
                id: '3',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                description: 'Grocery Store',
                amount: 3200,
                type: 'purchase',
                status: 'completed',
                merchant: 'Metro Cash & Carry',
                category: 'Groceries'
            }
        ];

        // Simple pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedTransactions = sampleTransactions.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            count: paginatedTransactions.length,
            total: sampleTransactions.length,
            page: parseInt(page),
            pages: Math.ceil(sampleTransactions.length / parseInt(limit)),
            data: paginatedTransactions
        });
    } catch (error) {
        next(error);
    }
});

export default router;
