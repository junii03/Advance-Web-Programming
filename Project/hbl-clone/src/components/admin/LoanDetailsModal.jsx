/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Check,
    AlertTriangle,
    Calendar,
    DollarSign,
    Percent,
    Clock,
    FileText,
    User,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    Building,
    Target,
    Shield,
    TrendingUp,
    History
} from 'lucide-react';

const LoanDetailsModal = ({
    isOpen,
    loan,
    onClose,
    onAction,
    formatCurrency,
    loanTypes,
    loanStatuses
}) => {
    const [actionType, setActionType] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !loan) return null;

    const handleAction = async (action) => {
        if (action === 'reject' && !rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        setLoading(true);
        try {
            await onAction(loan._id, action, rejectionReason);
            setActionType('');
            setRejectionReason('');
        } catch (error) {
            console.error('Action failed:', error);
            alert('Action failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateTotalAmount = () => {
        return loan.monthlyInstallment * loan.tenure;
    };

    const calculateTotalInterest = () => {
        return calculateTotalAmount() - loan.amount;
    };

    const loanType = loanTypes[loan.loanType] || { icon: '📄', label: loan.loanType };
    const status = loanStatuses[loan.status] || { color: 'bg-gray-100 text-gray-800', label: loan.status };

    const riskLevel = loan.amount > 1000000 ? 'high' : loan.amount > 500000 ? 'medium' : 'low';
    const riskColor = {
        high: 'text-red-600 bg-red-100',
        medium: 'text-orange-600 bg-orange-100',
        low: 'text-green-600 bg-green-100'
    }[riskLevel];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="theme-card-elevated rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 theme-card-elevated border-b px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                {loanType.icon}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold theme-heading-1">
                                    {loanType.label} Loan Application
                                </h2>
                                <p className="text-sm theme-text-secondary">
                                    ID: {loan._id}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Details */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Status and Priority */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                                        {status.label}
                                    </span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${riskColor}`}>
                                        <Shield className="w-4 h-4 mr-1" />
                                        {riskLevel.toUpperCase()} RISK
                                    </span>
                                    <span className="text-sm theme-text-secondary">
                                        Applied {formatDate(loan.applicationDate)}
                                    </span>
                                </div>

                                {/* Loan Summary */}
                                <div className="theme-card rounded-lg p-6">
                                    <h3 className="text-lg font-semibold theme-heading-1 mb-4 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5" />
                                        Loan Summary
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm theme-text-muted mb-1">Principal Amount</p>
                                                    <p className="text-2xl font-bold theme-text">
                                                        {formatCurrency(loan.amount)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm theme-text-muted mb-1">Interest Rate</p>
                                                    <p className="text-lg font-semibold theme-text">
                                                        {loan.interestRate}% per annum
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm theme-text-muted mb-1">Loan Tenure</p>
                                                    <p className="text-lg font-semibold theme-text">
                                                        {loan.tenure} months
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm theme-text-muted mb-1">Monthly EMI</p>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {formatCurrency(loan.monthlyInstallment)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm theme-text-muted mb-1">Total Amount</p>
                                                    <p className="text-lg font-semibold theme-text">
                                                        {formatCurrency(calculateTotalAmount())}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm theme-text-muted mb-1">Total Interest</p>
                                                    <p className="text-lg font-semibold text-orange-600">
                                                        {formatCurrency(calculateTotalInterest())}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Loan Purpose */}
                                <div className="theme-card rounded-lg p-6">
                                    <h3 className="text-lg font-semibold theme-heading-1 mb-4 flex items-center gap-2">
                                        <Target className="w-5 h-5" />
                                        Loan Purpose
                                    </h3>
                                    <p className="theme-text">{loan.purpose || 'Not specified'}</p>
                                </div>

                                {/* Collateral */}
                                {loan.collateral && (
                                    <div className="theme-card rounded-lg p-6">
                                        <h3 className="text-lg font-semibold theme-heading-1 mb-4 flex items-center gap-2">
                                            <Building className="w-5 h-5" />
                                            Collateral Details
                                        </h3>
                                        <p className="theme-text">{loan.collateral}</p>
                                    </div>
                                )}

                                {/* Rejection Reason */}
                                {loan.status === 'rejected' && loan.rejectionReason && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5" />
                                            Rejection Reason
                                        </h3>
                                        <p className="text-red-700">{loan.rejectionReason}</p>
                                        {loan.rejectedDate && (
                                            <p className="text-sm text-red-600 mt-2">
                                                Rejected on {formatDate(loan.rejectedDate)}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Quick Actions */}
                                {loan.status === 'pending' && (
                                    <div className="theme-card rounded-lg p-6">
                                        <h3 className="text-lg font-semibold theme-heading-1 mb-4">Quick Actions</h3>

                                        {!actionType ? (
                                            <div className="space-y-3">
                                                <button
                                                    onClick={() => setActionType('approve')}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                                >
                                                    <Check className="w-5 h-5" />
                                                    Approve Loan
                                                </button>
                                                <button
                                                    onClick={() => setActionType('reject')}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                                >
                                                    <X className="w-5 h-5" />
                                                    Reject Loan
                                                </button>
                                            </div>
                                        ) : actionType === 'approve' ? (
                                            <div className="space-y-4">
                                                <p className="text-sm theme-text-secondary">
                                                    Are you sure you want to approve this loan? The amount will be disbursed to the applicant's account.
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAction('approve')}
                                                        disabled={loading}
                                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                                                    >
                                                        {loading ? 'Processing...' : 'Confirm Approval'}
                                                    </button>
                                                    <button
                                                        onClick={() => setActionType('')}
                                                        className="px-4 py-2 theme-btn-secondary rounded-lg"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                                                        Rejection Reason *
                                                    </label>
                                                    <textarea
                                                        value={rejectionReason}
                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                        placeholder="Please provide a detailed reason for rejection..."
                                                        className="w-full px-3 py-2 theme-input rounded-lg resize-none"
                                                        rows={4}
                                                        required
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAction('reject')}
                                                        disabled={loading || !rejectionReason.trim()}
                                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                                                    >
                                                        {loading ? 'Processing...' : 'Confirm Rejection'}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setActionType('');
                                                            setRejectionReason('');
                                                        }}
                                                        className="px-4 py-2 theme-btn-secondary rounded-lg"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Loan Timeline */}
                                <div className="theme-card rounded-lg p-6">
                                    <h3 className="text-lg font-semibold theme-heading-1 mb-4 flex items-center gap-2">
                                        <History className="w-5 h-5" />
                                        Timeline
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                            <div>
                                                <p className="font-medium theme-text">Application Submitted</p>
                                                <p className="text-sm theme-text-secondary">
                                                    {formatDate(loan.applicationDate)}
                                                </p>
                                            </div>
                                        </div>

                                        {loan.approvedDate && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                                <div>
                                                    <p className="font-medium theme-text">Loan Approved</p>
                                                    <p className="text-sm theme-text-secondary">
                                                        {formatDate(loan.approvedDate)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {loan.disbursedDate && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                                <div>
                                                    <p className="font-medium theme-text">Amount Disbursed</p>
                                                    <p className="text-sm theme-text-secondary">
                                                        {formatDate(loan.disbursedDate)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {loan.rejectedDate && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                                                <div>
                                                    <p className="font-medium theme-text">Loan Rejected</p>
                                                    <p className="text-sm theme-text-secondary">
                                                        {formatDate(loan.rejectedDate)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Risk Assessment */}
                                <div className="theme-card rounded-lg p-6">
                                    <h3 className="text-lg font-semibold theme-heading-1 mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" />
                                        Risk Assessment
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm theme-text-secondary">Amount Risk</span>
                                            <span className={`text-sm font-medium px-2 py-1 rounded ${riskColor}`}>
                                                {riskLevel.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm theme-text-secondary">Loan Type</span>
                                            <span className="text-sm font-medium theme-text">
                                                {loanType.label}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm theme-text-secondary">Debt-to-Income Ratio</span>
                                            <span className="text-sm font-medium theme-text">
                                                {((loan.monthlyInstallment / 50000) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LoanDetailsModal;
