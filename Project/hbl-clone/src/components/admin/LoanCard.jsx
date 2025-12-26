/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Eye,
    Check,
    X,
    AlertTriangle,
    Clock,
    Calendar,
    User,
    MoreHorizontal,
    ChevronRight
} from 'lucide-react';

const LoanCard = ({
    loan,
    isSelected,
    showCheckbox,
    priority,
    onSelect,
    onView,
    onAction,
    formatCurrency,
    loanTypes,
    loanStatuses
}) => {
    const [actionLoading, setActionLoading] = useState(false);
    const [showActions, setShowActions] = useState(false);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-orange-600 bg-orange-100';
            default: return 'text-green-600 bg-green-100';
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high': return AlertTriangle;
            case 'medium': return Clock;
            default: return Check;
        }
    };

    const handleQuickAction = async (action) => {
        setActionLoading(true);
        try {
            await onAction(loan._id, action);
        } catch (error) {
            console.error('Quick action failed:', error);
        } finally {
            setActionLoading(false);
            setShowActions(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const calculateMonthsAgo = (date) => {
        const now = new Date();
        const applicationDate = new Date(date);
        const diffTime = Math.abs(now - applicationDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    };

    const PriorityIcon = getPriorityIcon(priority);
    const loanType = loanTypes[loan.loanType] || { icon: '📄', label: loan.loanType };
    const status = loanStatuses[loan.status] || { color: 'bg-gray-100 text-gray-800', label: loan.status };

    return (
        <motion.div
            layout
            whileHover={{ scale: showCheckbox ? 1 : 1.02 }}
            className={`
                relative theme-card-elevated rounded-lg p-4 sm:p-6 border transition-all duration-200 cursor-pointer
                ${isSelected ? 'ring-2 ring-blue-500 border-blue-200' : 'border-gray-200 hover:border-gray-300'}
                ${showCheckbox ? 'hover:shadow-md' : 'hover:shadow-lg'}
            `}
            onClick={() => showCheckbox ? onSelect() : onView()}
        >
            {/* Selection Checkbox */}
            {showCheckbox && (
                <div className="absolute top-4 left-4 z-10">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={onSelect}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                </div>
            )}

            {/* Priority Badge */}
            <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                    <PriorityIcon className="w-3 h-3 mr-1" />
                    {priority}
                </span>
            </div>

            {/* Loan Header */}
            <div className={`flex items-start gap-3 ${showCheckbox ? 'mt-6' : 'mt-8'}`}>
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
                        {loanType.icon}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold theme-text truncate">
                            {loanType.label} Loan
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                        </span>
                    </div>
                    <div className="text-sm theme-text-secondary">
                        ID: {loan._id?.slice(-8) || 'N/A'}
                    </div>
                </div>
            </div>

            {/* Loan Details */}
            <div className="mt-4 space-y-3">
                {/* Amount and Tenure */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs theme-text-muted mb-1">Amount</p>
                        <p className="font-semibold theme-text text-lg">
                            {formatCurrency(loan.amount)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs theme-text-muted mb-1">Tenure</p>
                        <p className="font-semibold theme-text">
                            {loan.tenure} months
                        </p>
                    </div>
                </div>

                {/* EMI and Interest */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs theme-text-muted mb-1">Monthly EMI</p>
                        <p className="font-medium theme-text">
                            {formatCurrency(loan.monthlyInstallment)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs theme-text-muted mb-1">Interest Rate</p>
                        <p className="font-medium theme-text">
                            {loan.interestRate}% p.a.
                        </p>
                    </div>
                </div>

                {/* Purpose */}
                {loan.purpose && (
                    <div>
                        <p className="text-xs theme-text-muted mb-1">Purpose</p>
                        <p className="text-sm theme-text line-clamp-2">
                            {loan.purpose}
                        </p>
                    </div>
                )}

                {/* Application Date */}
                <div className="flex items-center justify-between text-xs theme-text-muted">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Applied {calculateMonthsAgo(loan.applicationDate)}</span>
                    </div>
                    <span>{formatDate(loan.applicationDate)}</span>
                </div>

                {/* Rejection Reason (if applicable) */}
                {loan.status === 'rejected' && loan.rejectionReason && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason</p>
                        <p className="text-xs text-red-700">{loan.rejectionReason}</p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            {!showCheckbox && (
                <div className="mt-6 flex items-center justify-between">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onView();
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm theme-btn-secondary rounded-lg hover:theme-btn-secondary-hover transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                        View Details
                    </button>

                    {loan.status === 'pending' && (
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowActions(!showActions);
                                }}
                                className="p-2 theme-btn-ghost rounded-lg hover:theme-btn-ghost-hover transition-colors"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {/* Quick Actions Menu */}
                            {showActions && (
                                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuickAction('approve');
                                        }}
                                        disabled={actionLoading}
                                        className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        Quick Approve
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onView();
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Reject with Reason
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Click indicator for non-checkbox mode */}
            {!showCheckbox && (
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 theme-text-muted" />
                </div>
            )}
        </motion.div>
    );
};

export default LoanCard;
