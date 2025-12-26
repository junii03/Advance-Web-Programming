import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    // Personal Information
    firstName: {
        type: String,
        required: [true, 'Please provide first name'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Please provide last name'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide email address'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone number'],
        unique: true,
        match: [/^(\+92|0)?[0-9]{10}$/, 'Please provide a valid Pakistani phone number']
    },
    cnic: {
        type: String,
        required: [true, 'Please provide CNIC number'],
        unique: true,
        match: [/^[0-9]{5}-[0-9]{7}-[0-9]$/, 'Please provide a valid CNIC format (12345-1234567-1)']
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Please provide date of birth']
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: [true, 'Please provide gender']
    },

    // Address Information
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, default: 'Pakistan' }
    },

    // Authentication
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['customer', 'employee', 'manager', 'admin'],
        default: 'customer'
    },

    // Account Status
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },

    // Security
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    lastLogin: Date,

    // Profile
    profilePicture: {
        url: { type: String, default: null },
        publicId: { type: String, default: null },
        uploadedAt: { type: Date, default: null }
    },

    // Documents for KYC and verification
    documents: [{
        type: {
            type: String,
            enum: ['cnic_front', 'cnic_back', 'passport', 'utility_bill', 'bank_statement', 'salary_certificate', 'other'],
            required: true
        },
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        originalName: { type: String, required: true },
        description: { type: String, maxlength: 200 },
        uploadedAt: { type: Date, default: Date.now },
        verified: { type: Boolean, default: false },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verifiedAt: { type: Date }
    }],

    // Banking specific
    customerNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    employeeId: {
        type: String,
        unique: true,
        sparse: true
    },

    // Verification tokens
    emailVerificationToken: String,
    phoneVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Preferences
    preferences: {
        language: { type: String, default: 'en' },
        currency: { type: String, default: 'PKR' },
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            push: { type: Boolean, default: true }
        }
    },

    // Cards
    cards: [{
        cardNumber: { type: String, required: true },
        maskedCardNumber: { type: String, required: true },
        cardType: { type: String, enum: ['debit', 'credit'], required: true },
        cardStatus: { type: String, enum: ['active', 'blocked', 'expired', 'cancelled', 'pending'], default: 'pending' },
        expiryDate: { type: Date, required: true },
        cardName: { type: String, required: true },
        accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
        isContactless: { type: Boolean, default: true },
        cardLimit: { type: Number, default: 0 },
        availableLimit: { type: Number, default: 0 },
        pinSet: { type: Boolean, default: false },
        pinChangedAt: { type: Date },
        statusChangedAt: { type: Date },
        statusReason: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],

    // Notifications
    notifications: [{
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { type: String, enum: ['transaction', 'security', 'promotion', 'system', 'account'], required: true },
        read: { type: Boolean, default: false },
        readAt: { type: Date },
        priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        data: { type: Object, default: {} },
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date }
    }],

    // Reports
    reports: [{
        reportId: { type: String, required: true, unique: true },
        category: {
            type: String,
            enum: ['account_issue', 'transaction_problem', 'card_issue', 'loan_problem', 'technical_issue', 'complaint', 'suggestion', 'other'],
            required: true
        },
        subject: { type: String, required: true, maxlength: 200 },
        description: { type: String, required: true, maxlength: 2000 },
        priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
        status: { type: String, enum: ['submitted', 'in_progress', 'resolved', 'closed'], default: 'submitted' },
        images: [{
            url: { type: String, required: true },
            publicId: { type: String, required: true },
            uploadedAt: { type: Date, default: Date.now }
        }],
        submittedAt: { type: Date, default: Date.now },
        lastUpdated: { type: Date, default: Date.now },
        resolution: {
            resolvedAt: { type: Date },
            resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            resolutionNote: { type: String, maxlength: 1000 }
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
userSchema.virtual('age').get(function () {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Remove duplicate indexes - keep only the compound ones that are needed
userSchema.index({ role: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Pre-save middleware to generate customer number
userSchema.pre('save', async function (next) {
    if (this.isNew && this.role === 'customer' && !this.customerNumber) {
        const count = await mongoose.model('User').countDocuments({ role: 'customer' });
        this.customerNumber = `HBL${String(count + 1).padStart(8, '0')}`;
    }
    next();
});

// Instance method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to generate JWT token
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Instance method to handle login attempts
userSchema.methods.incLoginAttempts = function () {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }

    return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

export default mongoose.model('User', userSchema);
