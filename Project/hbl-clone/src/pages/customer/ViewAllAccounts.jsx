import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Eye,
    EyeOff,
    CreditCard,
    TrendingUp,
    Settings,
    DollarSign,
    Calendar,
    Shield
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const AccountCard = ({ account, showBalance, onViewTransactions, onManageAccount }) => {
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

    const getAccountTypeIcon = (type) => {
        switch (type) {
            case 'savings':
                return <TrendingUp className="w-6 h-6" />;
            case 'current':
                return <DollarSign className="w-6 h-6" />;
            case 'fixed_deposit':
                return <Calendar className="w-6 h-6" />;
            case 'islamic_savings':
                return <Shield className="w-6 h-6" />;
            default:
                return <CreditCard className="w-6 h-6" />;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'text-green-600 bg-green-100';
            case 'inactive':
                return 'text-yellow-600 bg-yellow-100';
            case 'frozen':
                return 'text-red-600 bg-red-100';
            case 'closed':
                return 'text-gray-600 bg-gray-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="theme-card rounded-lg p-4 sm:p-6 hover:theme-card-hover transition-all duration-200">
            {/* Account Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${getAccountTypeColor(account.accountType)} flex items-center justify-center text-white`}>
                        {getAccountTypeIcon(account.accountType)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold theme-text text-sm sm:text-base truncate">{account.accountTitle}</h3>
                        <p className="text-xs sm:text-sm theme-text-muted truncate">
                            {account.accountNumber} • {account.accountType.replace('_', ' ').toUpperCase()}
                        </p>
                    </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)} whitespace-nowrap`}>
                    {account.status}
                </span>
            </div>

            {/* Balance Section */}
            <div className="mb-4 p-3 sm:p-4 theme-card-elevated rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm theme-text-muted">Available Balance</p>
                        <p className="text-xl sm:text-2xl font-bold theme-text">
                            {showBalance ? account.formattedBalance : '••••••'}
                        </p>
                    </div>
                    {account.interestRate > 0 && (
                        <div className="text-right ml-2">
                            <p className="text-xs sm:text-sm theme-text-muted">Interest Rate</p>
                            <p className="text-sm sm:text-lg font-semibold text-green-600">
                                {account.interestRate}% p.a.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Account Details */}
            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs sm:text-sm">
                    <span className="theme-text-muted">Daily Limit:</span>
                    <span className="theme-text font-medium">{formatCurrency(account.dailyLimit)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                    <span className="theme-text-muted">Monthly Limit:</span>
                    <span className="theme-text font-medium">{formatCurrency(account.monthlyLimit)}</span>
                </div>
                {account.accountType === 'fixed_deposit' && account.maturityDate && (
                    <div className="flex justify-between text-xs sm:text-sm">
                        <span className="theme-text-muted">Maturity Date:</span>
                        <span className="theme-text font-medium">
                            {new Date(account.maturityDate).toLocaleDateString()}
                        </span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
                <button
                    onClick={() => onViewTransactions(account._id)}
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    View Transactions
                </button>
                <button
                    onClick={() => onManageAccount(account._id)}
                    className="sm:w-auto w-full px-4 py-2 text-sm border theme-secondary-button rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center"
                >
                    <Settings className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const AccountsSummary = ({ accounts, showBalance }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    const activeAccounts = accounts.filter(account => account.status === 'active').length;

    const accountsByType = accounts.reduce((acc, account) => {
        if (!acc[account.accountType]) {
            acc[account.accountType] = { count: 0, balance: 0 };
        }
        acc[account.accountType].count++;
        acc[account.accountType].balance += account.balance;
        return acc;
    }, {});

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Total Balance */}
            <div className="theme-card-elevated rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm theme-text-muted">Total Balance</p>
                        <p className="text-xl sm:text-2xl font-bold theme-text">
                            {showBalance ? formatCurrency(totalBalance) : '••••••'}
                        </p>
                    </div>
                    <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
                </div>
            </div>

            {/* Account Count */}
            <div className="theme-card-elevated rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm theme-text-muted">Active Accounts</p>
                        <p className="text-xl sm:text-2xl font-bold theme-text">
                            {activeAccounts} of {accounts.length}
                        </p>
                    </div>
                    <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
                </div>
            </div>

            {/* Account Types */}
            <div className="theme-card-elevated rounded-lg p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs sm:text-sm theme-text-muted">Account Types</p>
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
                </div>
                <div className="space-y-2">
                    {Object.entries(accountsByType).map(([type, data]) => (
                        <div key={type} className="flex justify-between text-xs sm:text-sm">
                            <span className="capitalize theme-text min-w-0 flex-1">
                                {type.replace('_', ' ')}
                            </span>
                            <span className="theme-text-muted font-medium">{data.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function ViewAllAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBalance, setShowBalance] = useState(true);
    const [filter, setFilter] = useState('all');

    const navigate = useNavigate();

    const fetchAccounts = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/auth/login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/accounts`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch accounts');
            }

            const data = await response.json();
            setAccounts(data.data || []);
        } catch (err) {
            setError(err.message);
            if (err.message.includes('token') || err.message.includes('401')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/auth/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const handleToggleBalance = () => {
        setShowBalance(!showBalance);
    };

    const handleViewTransactions = (accountId) => {
        navigate(`/customer/view-all-transactions?accountId=${accountId}`);
    };

    const handleManageAccount = (accountId) => {
        navigate(`/customer/accounts/${accountId}/manage`);
    };

    const handleCreateAccount = () => {
        navigate('/customer/accounts/new');
    };

    const filteredAccounts = accounts.filter(account => {
        if (filter === 'all') return true;
        return account.status === filter || account.accountType === filter;
    });

    if (loading) {
        return (
            <div className="min-h-screen theme-container">
                <div className="max-w-7xl mx-auto p-4">
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="theme-text-secondary mt-2">Loading accounts...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen theme-container">
                <div className="max-w-7xl mx-auto p-4">
                    <div className="theme-card rounded-lg p-6 text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={fetchAccounts}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen theme-container">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold theme-heading-1">My Accounts</h1>
                            <p className="theme-text-secondary mt-1 sm:mt-2 text-sm sm:text-base">
                                Manage and view all your banking accounts
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button
                                onClick={handleToggleBalance}
                                className="w-full sm:w-auto px-4 py-2 theme-secondary-button rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                {showBalance ? 'Hide' : 'Show'} Balance
                            </button>
                            <button
                                onClick={handleCreateAccount}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Open New Account
                            </button>
                            <button
                                onClick={() => navigate('/customer/dashboard')}
                                className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <AccountsSummary accounts={accounts} showBalance={showBalance} />

                {/* Filters */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        {[
                            { value: 'all', label: 'All Accounts' },
                            { value: 'active', label: 'Active' },
                            { value: 'savings', label: 'Savings' },
                            { value: 'current', label: 'Current' },
                            { value: 'fixed_deposit', label: 'Fixed Deposit' }
                        ].map((filterOption) => (
                            <button
                                key={filterOption.value}
                                onClick={() => setFilter(filterOption.value)}
                                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${filter === filterOption.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {filterOption.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Accounts Grid */}
                {filteredAccounts.length === 0 ? (
                    <div className="theme-card rounded-lg p-6 sm:p-8 text-center">
                        <CreditCard className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold theme-text mb-2">No Accounts Found</h3>
                        <p className="theme-text-secondary mb-4 text-sm sm:text-base">
                            {filter === 'all'
                                ? "You don't have any accounts yet."
                                : `No accounts found matching the filter "${filter}".`}
                        </p>
                        {filter === 'all' && (
                            <button
                                onClick={handleCreateAccount}
                                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Open Your First Account
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredAccounts.map((account) => (
                            <AccountCard
                                key={account._id}
                                account={account}
                                showBalance={showBalance}
                                onViewTransactions={handleViewTransactions}
                                onManageAccount={handleManageAccount}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
