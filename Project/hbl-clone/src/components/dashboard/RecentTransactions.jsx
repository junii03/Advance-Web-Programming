import React from 'react';
import { ArrowUpRight, ArrowDownLeft, CreditCard, Banknote, DollarSign, RefreshCw } from 'lucide-react';

const RecentTransactions = ({ transactions, onViewAll }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getTransactionIcon = (type, direction) => {
        switch (type) {
            case 'deposit':
                return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
            case 'withdrawal':
                return <ArrowUpRight className="w-5 h-5 text-red-500" />;
            case 'transfer':
                switch (direction) {
                    case 'credit':
                        return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
                    case 'debit':
                        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
                    case 'external_credit':
                        return <ArrowDownLeft className="w-5 h-5 text-blue-600" />;
                    case 'external_debit':
                        return <ArrowUpRight className="w-5 h-5 text-orange-600" />;
                    case 'transfer_self':
                        return <RefreshCw className="w-5 h-5 text-blue-500" />;
                    default:
                        return <RefreshCw className="w-5 h-5 text-purple-500" />;
                }
            case 'payment':
                return <ArrowUpRight className="w-5 h-5 text-orange-500" />;
            default:
                return direction === 'credit' || direction === 'external_credit'
                    ? <ArrowDownLeft className="w-5 h-5 text-green-500" />
                    : <ArrowUpRight className="w-5 h-5 text-red-500" />;
        }
    };

    return (
        <div className="theme-card-elevated rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold theme-heading-1">Recent Transactions</h3>
                <button
                    onClick={onViewAll}
                    className="text-sm theme-accent hover:underline"
                >
                    View All
                </button>
            </div>

            <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => {
                    const isCredit = transaction.direction === 'credit' || transaction.direction === 'external_credit' || transaction.direction === 'transfer_self';
                    return (
                        <div key={transaction._id} className="flex items-center justify-between py-3 border-b theme-border last:border-b-0">
                            <div className="flex items-center space-x-3">
                                {getTransactionIcon(transaction.type, transaction.direction)}
                                <div>
                                    <div className="font-medium theme-text">{transaction.description}</div>
                                    <div className="text-sm theme-text-muted">{formatDate(transaction.createdAt)}</div>
                                </div>
                            </div>
                            <div className={`font-semibold ${transaction.direction === 'transfer_self'
                                ? 'text-blue-600'
                                : transaction.direction === 'external_credit'
                                    ? 'text-blue-600'
                                    : transaction.direction === 'external_debit'
                                        ? 'text-orange-600'
                                        : isCredit
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                }`}>
                                {transaction.direction === 'transfer_self'
                                    ? '↔'
                                    : isCredit
                                        ? '+'
                                        : '-'
                                }{formatCurrency(transaction.amount)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecentTransactions;
