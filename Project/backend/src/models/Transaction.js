import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    // Transaction Identification
    transactionId: {
        type: String,
        unique: true
    },
    referenceNumber: {
        type: String,
        unique: true,
        sparse: true
    },

    // Transaction Type
    type: {
        type: String,
        enum: [
            'transfer',
            'deposit',
            'withdrawal',
            'payment',
            'fee',
            'interest',
            'reversal',
            'adjustment'
        ],
        required: true
    },
    subType: {
        type: String,
        enum: [
            'online_transfer',
            'external_transfer',
            'atm_withdrawal',
            'branch_deposit',
            'mobile_payment',
            'bill_payment',
            'salary_credit',
            'merchant_payment',
            'card_payment'
        ]
    },

    // Account Information
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },

    // Amount Details
    amount: {
        type: Number,
        required: true,
        min: [0.01, 'Amount must be greater than 0']
    },
    currency: {
        type: String,
        default: 'PKR',
        enum: ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR']
    },
    exchangeRate: {
        type: Number,
        default: 1
    },

    // Balance Information
    fromAccountBalanceBefore: Number,
    fromAccountBalanceAfter: Number,
    toAccountBalanceBefore: Number,
    toAccountBalanceAfter: Number,

    // Transaction Status
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'reversed'],
        default: 'pending'
    },

    // Description and Notes
    description: {
        type: String,
        required: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },

    // Channel Information
    channel: {
        type: String,
        enum: ['online', 'mobile', 'atm', 'branch', 'pos', 'api'],
        required: true
    },
    deviceInfo: {
        deviceId: String,
        ipAddress: String,
        userAgent: String,
        location: {
            latitude: Number,
            longitude: Number,
            address: String
        }
    },

    // Fees and Charges
    fees: {
        transactionFee: { type: Number, default: 0 },
        processingFee: { type: Number, default: 0 },
        otherCharges: { type: Number, default: 0 },
        totalFees: { type: Number, default: 0 }
    },

    // Third Party Information (for external transfers)
    thirdParty: {
        bankName: String,
        bankCode: String,
        accountNumber: String,
        accountTitle: String,
        routingNumber: String
    },

    // Bill Payment Information
    billPayment: {
        billerName: String,
        billerId: String,
        consumerNumber: String,
        dueDate: Date,
        billAmount: Number
    },

    // Merchant Information (for card payments)
    merchant: {
        name: String,
        id: String,
        category: String,
        location: String
    },

    // Processing Information
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    processedAt: Date,

    // Approval Workflow
    approvalRequired: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: Date,

    // Failure Information
    failureReason: String,
    errorCode: String,

    // Reversal Information
    reversalOf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    },
    reversedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    },

    // Scheduled Transaction
    isScheduled: {
        type: Boolean,
        default: false
    },
    scheduledFor: Date,
    recurringType: {
        type: String,
        enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
        default: 'none'
    },

    // Compliance and Risk
    riskScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    flagged: {
        type: Boolean,
        default: false
    },
    flagReason: String,

    // Notification Status
    notificationSent: {
        type: Boolean,
        default: false
    },
    notificationSentAt: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function () {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: this.currency
    }).format(this.amount);
});

// Virtual for transaction direction (for a specific account)
transactionSchema.virtual('direction').get(function () {
    // This will be populated when querying for a specific account
    return this._direction || 'unknown';
});

// Indexes for performance
transactionSchema.index({ fromAccount: 1, createdAt: -1 });
transactionSchema.index({ toAccount: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ status: 1 });

// Compound indexes for common queries
transactionSchema.index({ fromAccount: 1, status: 1, createdAt: -1 });
transactionSchema.index({ toAccount: 1, status: 1, createdAt: -1 });

// Pre-save middleware to generate transaction ID
transactionSchema.pre('save', async function (next) {
    if (this.isNew && !this.transactionId) {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.transactionId = `TXN${timestamp}${random}`;
    }

    // Calculate total fees
    this.fees.totalFees =
        (this.fees.transactionFee || 0) +
        (this.fees.processingFee || 0) +
        (this.fees.otherCharges || 0);

    next();
});

// Static method to get transaction history for an account
transactionSchema.statics.getAccountHistory = function (accountId, options = {}) {
    const {
        limit = 50,
        skip = 0,
        startDate,
        endDate,
        type,
        status = 'completed'
    } = options;

    let query = {
        $or: [
            { fromAccount: accountId },
            { toAccount: accountId }
        ],
        status
    };

    if (startDate && endDate) {
        query.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    if (type) {
        query.type = type;
    }

    return this.find(query)
        .populate('fromAccount', 'accountNumber accountTitle')
        .populate('toAccount', 'accountNumber accountTitle')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
};

// Static method to get monthly summary
transactionSchema.statics.getMonthlySummary = function (accountId, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return this.aggregate([
        {
            $match: {
                $or: [
                    { fromAccount: accountId },
                    { toAccount: accountId }
                ],
                status: 'completed',
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
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
};

export default mongoose.model('Transaction', transactionSchema);
