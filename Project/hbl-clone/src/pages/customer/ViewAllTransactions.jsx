import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Filter,
    Download,
    Search,
    Calendar,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    X,
    SlidersHorizontal
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const TransactionIcon = ({ type, direction }) => {
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

const TransactionFilters = ({ filters, onFiltersChange, accounts, onExport, loading }) => {
    const [showFilters, setShowFilters] = useState(false);

    const handleInputChange = (key, value) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const hasActiveFilters = !!(filters.type || filters.status || filters.accountId || filters.startDate || filters.endDate || filters.minAmount || filters.maxAmount);

    return (
        <div className="theme-card rounded-xl p-4 sm:p-6 mb-6 shadow-sm">
            {/* Mobile-first header */}
            <div className="space-y-4">
                {/* Search Bar - Full width on mobile */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={filters.search || ''}
                        onChange={(e) => handleInputChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base theme-text placeholder:text-gray-400"
                    />
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${showFilters
                            ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 theme-text'
                            }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Filters</span>
                        {hasActiveFilters && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                {Object.values(filters).filter(v => v && v !== 1 && v !== 20).length}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={onExport}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm text-sm font-medium"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Advanced Filters - Collapsible */}
            {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-6">
                        {/* Filter Header */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold theme-text flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                Filter Options
                            </h3>
                            {hasActiveFilters && (
                                <button
                                    onClick={() => {
                                        onFiltersChange({
                                            page: 1,
                                            limit: 20,
                                            search: filters.search,
                                            type: '',
                                            status: '',
                                            accountId: '',
                                            startDate: '',
                                            endDate: '',
                                            minAmount: '',
                                            maxAmount: ''
                                        });
                                    }}
                                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" />
                                    Clear Filters
                                </button>
                            )}
                        </div>

                        {/* Filters Grid - Mobile First */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Transaction Type */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium theme-text">
                                    Transaction Type
                                </label>
                                <select
                                    value={filters.type || ''}
                                    onChange={(e) => handleInputChange('type', e.target.value)}
                                    className="w-full px-3 py-3 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm  theme-text"
                                >
                                    <option value="" className="theme-text">All Types</option>
                                    <option value="transfer" className="theme-text">Transfer</option>
                                    <option value="payment" className="theme-text">Payment</option>
                                    <option value="deposit" className="theme-text">Deposit</option>
                                    <option value="withdrawal" className="theme-text">Withdrawal</option>
                                    <option value="fee" className="theme-text">Fee</option>
                                    <option value="interest" className="theme-text">Interest</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium theme-text">
                                    Status
                                </label>
                                <select
                                    value={filters.status || ''}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    className="w-full px-3 py-3 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm  theme-text"
                                >
                                    <option value="" className="theme-text">All Status</option>
                                    <option value="completed" className="theme-text">Completed</option>
                                    <option value="pending" className="theme-text">Pending</option>
                                    <option value="processing" className="theme-text">Processing</option>
                                    <option value="failed" className="theme-text">Failed</option>
                                    <option value="cancelled" className="theme-text">Cancelled</option>
                                </select>
                            </div>

                            {/* Account */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium theme-text">
                                    Account
                                </label>
                                <select
                                    value={filters.accountId || ''}
                                    onChange={(e) => handleInputChange('accountId', e.target.value)}
                                    className="w-full px-3 py-3 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm  theme-text"
                                >
                                    <option value="" className="theme-text">All Accounts</option>
                                    {accounts?.map((account) => (
                                        <option key={account._id} value={account._id} className="theme-text">
                                            {account.accountTitle} - {account.accountNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Range */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium theme-text">
                                    Date Range
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="date"
                                        value={filters.startDate || ''}
                                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                                        className="px-3 py-3 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm theme-text"
                                    />
                                    <input
                                        type="date"
                                        value={filters.endDate || ''}
                                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                                        className="px-3 py-3 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm theme-text"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Amount Range - Full width row */}
                        <div className="pt-4 border-t border-gray-100">
                            <label className="block text-sm font-medium theme-text mb-3">
                                Amount Range (PKR)
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="number"
                                        placeholder="Minimum amount"
                                        min="0"
                                        step="0.01"
                                        value={filters.minAmount || ''}
                                        onChange={(e) => handleInputChange('minAmount', e.target.value)}
                                        className="w-full px-3 py-3 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm theme-text placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        placeholder="Maximum amount"
                                        min="0"
                                        step="0.01"
                                        value={filters.maxAmount || ''}
                                        onChange={(e) => handleInputChange('maxAmount', e.target.value)}
                                        className="w-full px-3 py-3 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm theme-text placeholder:text-gray-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TransactionRow = ({ transaction }) => {
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
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-100';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'processing':
                return 'text-blue-600 bg-blue-100';
            case 'failed':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const isCredit = transaction.direction === 'credit' || transaction.direction === 'external_credit' || transaction.direction === 'transfer_self';

    return (
        <div className="theme-card rounded-xl p-4 hover:shadow-md transition-all duration-200 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center space-x-3 flex-1">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                            <TransactionIcon type={transaction.type} direction={transaction.direction} />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <p className="text-sm font-semibold theme-text truncate">
                                {transaction.description}
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(transaction.status)}`}>
                                {transaction.status}
                            </span>
                        </div>
                        <p className="text-xs theme-text-muted mt-1">
                            {formatDate(transaction.createdAt)} • {transaction.transactionId}
                        </p>
                        {transaction.fromAccountDetails && transaction.toAccountDetails && (
                            <p className="text-xs theme-text-muted mt-1 truncate">
                                From: {transaction.fromAccountDetails[0]?.accountTitle} → To: {transaction.toAccountDetails[0]?.accountTitle}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-between sm:justify-end items-center sm:flex-col sm:text-right">
                    <div className={`font-bold text-lg ${transaction.direction === 'transfer_self'
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
                    <div className="text-xs theme-text-muted capitalize sm:mt-1">
                        {transaction.type}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = [];
    const showPages = 3; // Reduced for mobile
    const startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    const endPage = Math.min(totalPages, startPage + showPages - 1);

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="theme-card rounded-xl p-4 border border-gray-100">
            {/* Mobile Pagination */}
            <div className="flex items-center justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 theme-text hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                </button>

                <span className="text-sm theme-text-muted">
                    {currentPage} of {totalPages}
                </span>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 theme-text hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>

            {/* Desktop Pagination */}
            <div className="hidden sm:flex items-center justify-between">
                <div>
                    <p className="text-sm theme-text-muted">
                        Page <span className="font-medium theme-text">{currentPage}</span> of{' '}
                        <span className="font-medium theme-text">{totalPages}</span>
                    </p>
                </div>
                <div>
                    <nav className="flex items-center space-x-1">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 theme-text hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {pages.map((page) => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${page === currentPage
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'border border-gray-200 theme-text hover:bg-gray-50'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 theme-text hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default function ViewAllTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0,
        count: 0
    });

    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        search: '',
        type: '',
        status: '',
        accountId: '',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: ''
    });

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize filters from URL params
    useEffect(() => {
        const urlFilters = {};
        for (const [key, value] of searchParams.entries()) {
            if (value) {
                urlFilters[key] = value;
            }
        }

        if (Object.keys(urlFilters).length > 0) {
            setFilters(prev => ({ ...prev, ...urlFilters, page: 1 }));
        }
    }, [searchParams]);

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/auth/login');
                return;
            }

            // Build query parameters - only include non-empty values
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value.toString().trim()) {
                    queryParams.append(key, value.toString().trim());
                }
            });

            console.log('Fetching transactions with params:', queryParams.toString());

            const response = await fetch(`${API_BASE_URL}/users/transactions?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch transactions');
            }

            const data = await response.json();
            console.log('Transactions response:', data);

            setTransactions(data.data || []);
            setPagination({
                currentPage: data.page || 1,
                totalPages: data.pages || 1,
                total: data.total || 0,
                count: data.count || 0
            });

        } catch (err) {
            console.error('Fetch transactions error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters, navigate]);

    const fetchAccounts = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/accounts`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAccounts(data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch accounts:', err);
        }
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    useEffect(() => {
        // Add a small delay to avoid too many API calls during typing
        const timeoutId = setTimeout(() => {
            fetchTransactions();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [filters]);

    const handleFiltersChange = (newFilters) => {
        console.log('Filters changed:', newFilters);

        // Reset to page 1 when filters change
        const updatedFilters = { ...newFilters, page: 1 };
        setFilters(updatedFilters);

        // Update URL params - only include non-empty values
        const params = new URLSearchParams();
        Object.entries(updatedFilters).forEach(([key, value]) => {
            if (value && value.toString().trim() && key !== 'page' && key !== 'limit') {
                params.set(key, value.toString().trim());
            }
        });
        setSearchParams(params);
    };

    const handlePageChange = (page) => {
        console.log('Page changed to:', page);
        setFilters(prev => ({ ...prev, page }));
    };

    const handleExport = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams();

            // Add current filters to export (exclude pagination)
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value.toString().trim() && key !== 'page' && key !== 'limit') {
                    queryParams.append(key, value.toString().trim());
                }
            });
            queryParams.append('format', 'csv');

            const response = await fetch(`${API_BASE_URL}/users/export-transactions?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                console.error('Export failed');
            }
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        const clearedFilters = {
            page: 1,
            limit: 20,
            search: '',
            type: '',
            status: '',
            accountId: '',
            startDate: '',
            endDate: '',
            minAmount: '',
            maxAmount: ''
        };
        setFilters(clearedFilters);
        setSearchParams(new URLSearchParams());
    };

    if (error) {
        return (
            <div className="min-h-screen theme-container">
                <div className="max-w-7xl mx-auto p-4">
                    <div className="theme-card rounded-lg p-6 text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
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
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header - Mobile First */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-bold theme-heading-1">
                                All Transactions
                            </h1>
                            <p className="theme-text-secondary text-sm sm:text-base">
                                View and manage your transaction history
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 theme-text transition-colors"
                            >
                                Clear Filters
                            </button>
                            <button
                                onClick={() => navigate('/customer/dashboard')}
                                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <TransactionFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    accounts={accounts}
                    onExport={handleExport}
                    loading={loading}
                />

                {/* Results Summary */}
                <div className="mb-6">
                    <div className="theme-card rounded-xl p-4 border border-gray-100">
                        <p className="theme-text-secondary text-sm sm:text-base">
                            Showing <span className="font-semibold theme-text">{pagination.count}</span> of{' '}
                            <span className="font-semibold theme-text">{pagination.total}</span> transactions
                            {(filters.search || filters.type || filters.status || filters.accountId || filters.startDate || filters.endDate || filters.minAmount || filters.maxAmount) &&
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Filtered
                                </span>
                            }
                        </p>
                    </div>
                </div>

                {/* Transactions List */}
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="theme-text-secondary mt-4 text-sm">Loading transactions...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="theme-card rounded-xl p-8 sm:p-12 text-center border border-gray-100">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold theme-text mb-2">
                                No transactions found
                            </h3>
                            <p className="theme-text-secondary mb-6 text-sm sm:text-base">
                                {(filters.search || filters.type || filters.status || filters.accountId || filters.startDate || filters.endDate || filters.minAmount || filters.maxAmount)
                                    ? "No transactions match your current filters. Try adjusting your search criteria."
                                    : "You don't have any transactions yet."
                                }
                            </p>
                            {(filters.search || filters.type || filters.status || filters.accountId || filters.startDate || filters.endDate || filters.minAmount || filters.maxAmount) && (
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm text-sm font-medium"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        transactions.map((transaction) => (
                            <TransactionRow key={transaction._id} transaction={transaction} />
                        ))
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
}
