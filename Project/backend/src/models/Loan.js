import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
    outstandingAmount: { type: Number, default: 0 },
    rejectionReason: { type: String },
    rejectedDate: { type: Date }
}, { timestamps: true });

export default mongoose.models.Loan || mongoose.model('Loan', loanSchema);
