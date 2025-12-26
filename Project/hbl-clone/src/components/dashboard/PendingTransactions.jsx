import React from 'react';
import { Clock } from 'lucide-react';

const PendingTransactions = ({ transactions }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (!transactions || transactions.length === 0) {
        return null;
    }

    return (
        <div className="theme-card-elevated rounded-lg p-6">
            <h3 className="text-lg font-semibold theme-heading-1 mb-4">Pending Transactions</h3>
            <div className="space-y-3">
                {transactions.map((transaction) => (
                    <div key={transaction._id} className="flex items-center justify-between">
                        <div>
                            <div className="font-medium theme-text">{transaction.description}</div>
                            <div className="text-sm theme-text-muted flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {transaction.status}
                            </div>
                        </div>
                        <div className="text-sm font-medium theme-text">
                            {formatCurrency(transaction.amount)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PendingTransactions;
