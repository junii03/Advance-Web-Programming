import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
    // Account Identification
    accountNumber: {
        type: String,
        unique: true,
        match: [/^[0-9]{10,16}$/, 'Account number must be 10-16 digits']
    },
    iban: {
        type: String,
        unique: true,
        match: [/^PK[0-9]{2}[A-Z]{4}[0-9]{16}$/, 'Invalid IBAN format']
    },

    // Account Owner
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Account Details
    accountType: {
        type: String,
        enum: ['savings', 'current', 'fixed_deposit', 'islamic_savings', 'salary'],
        required: true
    },
    accountTitle: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Account title cannot exceed 100 characters']
    },

    // Balance Information
    balance: {
        type: Number,
        default: 0,
        min: [0, 'Balance cannot be negative']
    },
    availableBalance: {
        type: Number,
        default: 0,
        min: [0, 'Available balance cannot be negative']
    },

    // Account Limits
    dailyTransactionLimit: {
        type: Number,
        default: 500000, // PKR
        min: [0, 'Daily limit cannot be negative']
    },
    monthlyTransactionLimit: {
        type: Number,
        default: 2000000, // PKR
        min: [0, 'Monthly limit cannot be negative']
    },
    minimumBalance: {
        type: Number,
        default: 1000, // PKR
        min: [0, 'Minimum balance cannot be negative']
    },

    // Account Status
    status: {
        type: String,
        enum: ['active', 'inactive', 'frozen', 'closed'],
        default: 'active'
    },
    isJointAccount: {
        type: Boolean,
        default: false
    },

    // Joint Account Holders (if applicable)
    jointHolders: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        relationship: {
            type: String,
            enum: ['spouse', 'parent', 'child', 'sibling', 'other']
        },
        permissions: {
            view: { type: Boolean, default: true },
            withdraw: { type: Boolean, default: false },
            transfer: { type: Boolean, default: false }
        }
    }],

    // Branch Information
    branchCode: {
        type: String,
        required: true,
        match: [/^[0-9]{4}$/, 'Branch code must be 4 digits']
    },
    branchName: {
        type: String,
        required: true
    },

    // Interest Information (for savings accounts)
    interestRate: {
        type: Number,
        default: 0,
        min: [0, 'Interest rate cannot be negative'],
        max: [100, 'Interest rate cannot exceed 100%']
    },
    lastInterestCalculated: {
        type: Date,
        default: Date.now
    },

    // Fixed Deposit specific (if applicable)
    maturityDate: Date,
    depositTerm: Number, // in months

    // Account Opening Details
    openingDate: {
        type: Date,
        default: Date.now
    },
    closingDate: Date,

    // Monthly Statement
    statementPreference: {
        type: String,
        enum: ['email', 'postal', 'both', 'none'],
        default: 'email'
    },

    // Flags and Alerts
    flags: {
        largeTransactionAlert: { type: Boolean, default: true },
        lowBalanceAlert: { type: Boolean, default: true },
        securityAlert: { type: Boolean, default: true }
    },

    // Metadata
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for formatted account number
accountSchema.virtual('formattedAccountNumber').get(function () {
    if (!this.accountNumber) return '';
    return this.accountNumber.replace(/(\d{4})(?=\d)/g, '$1-');
});

// Virtual for formatted balance
accountSchema.virtual('formattedBalance').get(function () {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR'
    }).format(this.balance);
});

// Virtual for account age in days
accountSchema.virtual('accountAge').get(function () {
    const now = new Date();
    const diffTime = Math.abs(now - this.openingDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtuals for dailyLimit and monthlyLimit (aliases for frontend compatibility)
accountSchema.virtual('dailyLimit').get(function () {
    return this.dailyTransactionLimit;
});
accountSchema.virtual('monthlyLimit').get(function () {
    return this.monthlyTransactionLimit;
});

// Indexes
accountSchema.index({ userId: 1 });
accountSchema.index({ accountType: 1 });
accountSchema.index({ status: 1 });
accountSchema.index({ branchCode: 1 });

// Pre-save middleware to generate account number and IBAN
accountSchema.pre('save', async function (next) {
    if (this.isNew && !this.accountNumber) {
        // Generate unique account number
        let accountNumber;
        let exists = true;

        while (exists) {
            accountNumber = Math.random().toString().slice(2, 12).padStart(10, '0');
            // Use this.constructor instead of mongoose.model to avoid circular reference
            exists = await this.constructor.findOne({ accountNumber });
        }

        this.accountNumber = accountNumber;

        // Generate IBAN (Pakistan format: PK + 2 check digits + 4 bank code + 16 account number)
        const bankCode = 'HBBL'; // HBL bank code
        const paddedAccountNumber = accountNumber.padStart(16, '0');

        // Generate check digits using simplified IBAN algorithm
        const accountIdentifier = `${bankCode}${paddedAccountNumber}1625`; // 1625 is numeric for 'PK'
        let checksum = '';

        // Convert to numeric string for mod calculation
        for (let char of accountIdentifier) {
            if (char >= 'A' && char <= 'Z') {
                checksum += (char.charCodeAt(0) - 'A'.charCodeAt(0) + 10).toString();
            } else {
                checksum += char;
            }
        }

        // Calculate check digits
        const mod = BigInt(checksum) % 97n;
        const checkDigits = (98n - mod).toString().padStart(2, '0');

        this.iban = `PK${checkDigits}${bankCode}${paddedAccountNumber}`;
    }

    // Update available balance
    this.availableBalance = this.balance;

    next();
});

// Instance method to check if account can be debited
accountSchema.methods.canDebit = function (amount) {
    return this.status === 'active' &&
        this.availableBalance >= amount &&
        (this.balance - amount) >= this.minimumBalance;
};

// Instance method to check daily transaction limit with detailed info
accountSchema.methods.checkDailyLimit = async function (amount) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const Transaction = mongoose.model('Transaction');
    const dailyTransactions = await Transaction.aggregate([
        {
            $match: {
                $or: [
                    { fromAccount: this._id },
                    { toAccount: this._id }
                ],
                createdAt: { $gte: today },
                status: 'completed'
            }
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: '$amount' }
            }
        }
    ]);

    const dailyTotal = dailyTransactions[0]?.totalAmount || 0;
    const remainingLimit = this.dailyTransactionLimit - dailyTotal;
    const canTransact = (dailyTotal + amount) <= this.dailyTransactionLimit;

    return {
        canTransact,
        dailyTotal,
        dailyLimit: this.dailyTransactionLimit,
        remainingLimit,
        requestedAmount: amount,
        exceedsBy: canTransact ? 0 : (dailyTotal + amount) - this.dailyTransactionLimit
    };
};

// Static method to find account by account number (with normalization)
accountSchema.statics.findByAccountNumber = function (accountNumber) {
    // Remove dashes, spaces, and other formatting characters
    const normalizedAccountNumber = accountNumber.replace(/[-\s]/g, '');
    return this.findOne({
        accountNumber: normalizedAccountNumber,
        status: 'active'
    });
};

export default mongoose.model('Account', accountSchema);
