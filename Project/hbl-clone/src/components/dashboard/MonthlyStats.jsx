import React from 'react';

const MonthlyStats = ({ stats }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="theme-card-elevated rounded-lg p-6">
            <h3 className="text-lg font-semibold theme-heading-1 mb-4">This Month</h3>
            <div className="space-y-4">
                {stats.map((stat) => (
                    <div key={stat._id} className="flex items-center justify-between">
                        <div>
                            <div className="font-medium theme-text">{stat._id.toUpperCase()}</div>
                            <div className="text-sm theme-text-muted">{stat.count} transactions</div>
                        </div>
                        <div className="text-sm font-medium theme-text">
                            {formatCurrency(stat.totalAmount)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MonthlyStats;
