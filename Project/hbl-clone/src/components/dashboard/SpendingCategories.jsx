import React from 'react';

const SpendingCategories = ({ categories }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <div className="theme-card-elevated rounded-lg p-6">
            <h3 className="text-lg font-semibold theme-heading-1 mb-4">Top Spending</h3>
            <div className="space-y-3">
                {categories.map((category, index) => (
                    <div key={category._id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-red-500' :
                                    index === 1 ? 'bg-orange-500' :
                                        'bg-gray-500'
                                }`}></div>
                            <div className="text-sm theme-text">{category._id || 'Other'}</div>
                        </div>
                        <div className="text-sm font-medium theme-text">
                            {formatCurrency(category.totalAmount)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SpendingCategories;
