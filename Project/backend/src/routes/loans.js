import express from 'express';
import { body, validationResult } from 'express-validator';
import { AppError } from '../middleware/errorHandler.js';
import { protect } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import { notifyLoanStatusChanged } from '../utils/notificationHelper.js';

const router = express.Router();

// Simple loan schema for demonstration
const loanSchema = new (await import('mongoose')).Schema({
    userId: { type: (await import('mongoose')).Schema.Types.ObjectId, ref: 'User', required: true },
    loanType: { type: String, enum: ['personal', 'home', 'car', 'business'], required: true },
    amount: { type: Number, required: true },
    tenure: { type: Number, required: true }, // in months
    interestRate: { type: Number, required: true },
    monthlyInstallment: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'active', 'closed'], default: 'pending' },
    applicationDate: { type: Date, default: Date.now },
    approvedDate: Date,
    disbursedDate: Date,
    purpose: String,
    collateral: String,
    outstandingAmount: { type: Number, default: 0 }
}, { timestamps: true });

const LoanModel = (await import('mongoose')).model('Loan', loanSchema);

/**
 * @swagger
 * tags:
 *   name: Loans
 *   description: Loan management and application
 */

/**
 * @swagger
 * /api/loans:
 *   get:
 *     summary: Get user's loans
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
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
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Loan'
 *       401:
 *         description: Unauthorized
 */

// @desc    Get user's loans
// @route   GET /api/loans
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const loans = await LoanModel.find({ userId: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: loans.length,
            data: loans
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/loans:
 *   post:
 *     summary: Apply for a loan
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loanType
 *               - amount
 *               - tenure
 *               - purpose
 *             properties:
 *               loanType:
 *                 type: string
 *                 enum: [personal, home, car, business]
 *                 example: personal
 *               amount:
 *                 type: number
 *                 example: 500000
 *               tenure:
 *                 type: integer
 *                 example: 36
 *               purpose:
 *                 type: string
 *                 example: "Home renovation"
 *               collateral:
 *                 type: string
 *                 example: "Property documents"
 *     responses:
 *       201:
 *         description: Loan application submitted successfully
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
 *                   example: Loan application submitted successfully
 *                 data:
 *                   $ref: '#/components/schemas/Loan'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

// @desc    Apply for a loan
// @route   POST /api/loans
// @access  Private
router.post('/', protect, [
    body('loanType').isIn(['personal', 'home', 'car', 'business']).withMessage('Invalid loan type'),
    body('amount').isNumeric().withMessage('Amount must be a number').custom(value => {
        if (value < 50000) throw new Error('Minimum loan amount is PKR 50,000');
        if (value > 10000000) throw new Error('Maximum loan amount is PKR 10,000,000');
        return true;
    }),
    body('tenure').isInt({ min: 6, max: 240 }).withMessage('Tenure must be between 6 and 240 months'),
    body('purpose').notEmpty().withMessage('Purpose is required')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const { loanType, amount, tenure, purpose, collateral } = req.body;

        // Calculate interest rate based on loan type
        let interestRate;
        switch (loanType) {
            case 'personal':
                interestRate = 18.5;
                break;
            case 'home':
                interestRate = 12.5;
                break;
            case 'car':
                interestRate = 15.5;
                break;
            case 'business':
                interestRate = 16.5;
                break;
            default:
                interestRate = 18.5;
        }

        // Calculate monthly installment using simple EMI formula
        const monthlyRate = interestRate / 100 / 12;
        const monthlyInstallment = amount * monthlyRate * Math.pow(1 + monthlyRate, tenure) /
            (Math.pow(1 + monthlyRate, tenure) - 1);

        const loan = await LoanModel.create({
            userId: req.user.id,
            loanType,
            amount,
            tenure,
            interestRate,
            monthlyInstallment: Math.round(monthlyInstallment),
            purpose,
            collateral,
            outstandingAmount: amount
        });

        logger.info(`Loan application submitted: ${loan._id} for user: ${req.user.email}`);

        // Send real-time notification via WebSocket
        await notifyLoanStatusChanged(req.user.id, {
            _id: loan._id,
            status: 'pending',
            amount: loan.amount,
            loanType: loanType
        });

        res.status(201).json({
            success: true,
            message: 'Loan application submitted successfully',
            data: loan
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/loans/{id}:
 *   get:
 *     summary: Get loan details
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Loan ID
 *     responses:
 *       200:
 *         description: Loan details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Loan'
 *       404:
 *         description: Loan not found
 *       401:
 *         description: Unauthorized
 */

// @desc    Get loan details
// @route   GET /api/loans/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
    try {
        const loan = await LoanModel.findOne({ _id: req.params.id, userId: req.user.id });

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        res.status(200).json({
            success: true,
            data: loan
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/loans/calculate:
 *   post:
 *     summary: Calculate loan EMI
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - tenure
 *               - loanType
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500000
 *               tenure:
 *                 type: integer
 *                 example: 36
 *               loanType:
 *                 type: string
 *                 enum: [personal, home, car, business]
 *                 example: personal
 *     responses:
 *       200:
 *         description: EMI calculation successful
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
 *                     loanAmount:
 *                       type: number
 *                       example: 500000
 *                     tenure:
 *                       type: integer
 *                       example: 36
 *                     interestRate:
 *                       type: number
 *                       example: 18.5
 *                     monthlyInstallment:
 *                       type: number
 *                       example: 18000
 *                     totalAmount:
 *                       type: number
 *                       example: 648000
 *                     totalInterest:
 *                       type: number
 *                       example: 148000
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

// @desc    Calculate loan EMI
// @route   POST /api/loans/calculate
// @access  Private
router.post('/calculate', protect, [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('tenure').isNumeric().withMessage('Tenure must be a number'),
    body('loanType').isIn(['personal', 'home', 'car', 'business']).withMessage('Invalid loan type')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array()[0].msg, 400));
        }

        const { amount, tenure, loanType } = req.body;

        // Get interest rate
        let interestRate;
        switch (loanType) {
            case 'personal': interestRate = 18.5; break;
            case 'home': interestRate = 12.5; break;
            case 'car': interestRate = 15.5; break;
            case 'business': interestRate = 16.5; break;
            default: interestRate = 18.5;
        }

        const monthlyRate = interestRate / 100 / 12;
        const monthlyInstallment = amount * monthlyRate * Math.pow(1 + monthlyRate, tenure) /
            (Math.pow(1 + monthlyRate, tenure) - 1);

        const totalAmount = monthlyInstallment * tenure;
        const totalInterest = totalAmount - amount;

        res.status(200).json({
            success: true,
            data: {
                loanAmount: amount,
                tenure,
                interestRate,
                monthlyInstallment: Math.round(monthlyInstallment),
                totalAmount: Math.round(totalAmount),
                totalInterest: Math.round(totalInterest)
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Loan:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Loan ID
 *         userId:
 *           type: string
 *           description: User ID
 *         loanType:
 *           type: string
 *           enum: [personal, home, car, business]
 *         amount:
 *           type: number
 *         tenure:
 *           type: integer
 *         interestRate:
 *           type: number
 *         monthlyInstallment:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, active, closed]
 *         applicationDate:
 *           type: string
 *           format: date-time
 *         approvedDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         disbursedDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         purpose:
 *           type: string
 *         collateral:
 *           type: string
 *         outstandingAmount:
 *           type: number
 *         rejectionReason:
 *           type: string
 *           description: Reason for loan rejection
 *         rejectedDate:
 *           type: string
 *           format: date-time
 *           description: Date when loan was rejected
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export default router;
