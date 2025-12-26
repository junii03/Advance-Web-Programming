import React from 'react';

const AccountsList = ({ accounts, showBalance, onViewAll }) => {
    const getAccountTypeColor = (type) => {
        const colors = {
            savings: 'bg-blue-500',
            current: 'bg-green-500',
            fixed_deposit: 'bg-purple-500',
            islamic_savings: 'bg-teal-500',
            salary: 'bg-orange-500'
        };
        return colors[type] || 'bg-gray-500';
    };

    return (
        <div className="theme-card-elevated rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold theme-heading-1">My Accounts</h3>
                <button
                    onClick={onViewAll}
                    className="text-sm theme-accent hover:underline"
                >
                    View All
                </button>
            </div>

            <div className="space-y-4">
                {accounts.map((account) => (
                    <div key={account.id} className="theme-card rounded-lg p-4 hover:theme-card-hover">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${getAccountTypeColor(account.accountType)}`}></div>
                                <div>
                                    <div className="font-medium theme-text">{account.accountTitle}</div>
                                    <div className="text-sm theme-text-muted">
                                        {account.accountNumber} • {account.accountType.replace('_', ' ').toUpperCase()}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold theme-text">
                                    {showBalance ? account.formattedBalance : '••••••'}
                                </div>
                                <div className="text-sm theme-text-muted">Available</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AccountsList;
