/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Eye
} from 'lucide-react';

const RecentActivity = ({ transactions, onViewAll }) => {
    const getTransactionIcon = (type) => {
        switch (type) {
            case 'transfer':
                return ArrowUpRight;
            case 'deposit':
                return ArrowDownLeft;
            case 'withdrawal':
                return ArrowUpRight;
            default:
                return TrendingUp;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-100';
            case 'pending':
                return 'text-orange-600 bg-orange-100';
            case 'failed':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return CheckCircle;
            case 'pending':
                return Clock;
            case 'failed':
                return XCircle;
            default:
                return AlertTriangle;
        }
    };

    return (
        <div className="theme-card-elevated rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold theme-heading-1 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 theme-accent" />
                    <span>Recent Activity</span>
                </h2>
                <button
                    onClick={onViewAll}
                    className="text-sm theme-accent hover:underline flex items-center space-x-1"
                >
                    <span>View All</span>
                    <Eye className="w-3 h-3" />
                </button>
            </div>

            <div className="space-y-3">
                {transactions && transactions.length > 0 ? (
                    transactions.slice(0, 5).map((transaction, index) => {
                        const TransactionIcon = getTransactionIcon(transaction.type);
                        const StatusIcon = getStatusIcon(transaction.status);

                        return (
                            <motion.div
                                key={transaction._id || index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-3 theme-card rounded-lg hover:theme-card-hover"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <TransactionIcon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium theme-text capitalize">
                                            {transaction.type} Transaction
                                        </p>
                                        <p className="text-sm theme-text-secondary">
                                            {transaction.description || `${transaction.type} transaction`}
                                        </p>
                                        <p className="text-xs theme-text-muted">
                                            {new Date(transaction.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="font-semibold theme-text">
                                        PKR {transaction.amount?.toLocaleString() || '0'}
                                    </p>
                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
                                        <StatusIcon className="w-3 h-3 mr-1" />
                                        {transaction.status}
                                    </div>
                                    {transaction.flagged && (
                                        <div className="flex items-center mt-1">
                                            <AlertTriangle className="w-3 h-3 text-red-500 mr-1" />
                                            <span className="text-xs text-red-600">Flagged</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="text-center py-8">
                        <TrendingUp className="w-12 h-12 theme-text-muted mx-auto mb-3" />
                        <p className="theme-text-secondary">No recent transactions</p>
                        <p className="text-sm theme-text-muted">Activity will appear here</p>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            {transactions && transactions.length > 0 && (
                <div className="mt-6 pt-4 border-t theme-border">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-lg font-semibold theme-text">
                                {transactions.filter(t => t.status === 'completed').length}
                            </p>
                            <p className="text-xs theme-text-muted">Completed</p>
                        </div>
                        <div>
                            <p className="text-lg font-semibold theme-text">
                                {transactions.filter(t => t.status === 'pending').length}
                            </p>
                            <p className="text-xs theme-text-muted">Pending</p>
                        </div>
                        <div>
                            <p className="text-lg font-semibold theme-text">
                                {transactions.filter(t => t.flagged).length}
                            </p>
                            <p className="text-xs theme-text-muted">Flagged</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecentActivity;
