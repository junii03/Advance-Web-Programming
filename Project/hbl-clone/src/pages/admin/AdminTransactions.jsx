/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    Search,
    Filter,
    Eye,
    Download,
    ArrowUpDown,
    DollarSign,
    Calendar,
    User,
    ChevronDown,
    MoreVertical,
    ArrowRight
} from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import adminService from '../../services/adminService';

const AdminTransactions = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        type: '',
        dateRange: '',
        flagged: '',
        minAmount: '',
        maxAmount: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchTransactions();
        }, 300); // Debounce API calls

        return () => clearTimeout(timeoutId);
    }, [pagination.page, filters, searchTerm]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError('');

            // Build query parameters
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            };

            // Add search term if present
            if (searchTerm.trim()) {
                params.search = searchTerm.trim();
            }

            // Convert date range to actual dates
            if (filters.dateRange && filters.dateRange !== '') {
                const now = new Date();
                switch (filters.dateRange) {
                    case 'today':
                        params.startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
                        params.endDate = new Date(now.setHours(23, 59, 59, 999)).toISOString();
                        break;
                    case 'week':
                        {
                            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                            params.startDate = weekAgo.toISOString();
                            params.endDate = now.toISOString();
                            break;
                        }
                    case 'month':
                        {
                            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                            params.startDate = monthAgo.toISOString();
                            params.endDate = now.toISOString();
                            break;
                        }
                }
            }

            // Remove empty parameters
            Object.keys(params).forEach(key => {
                if (!params[key] || params[key] === '') {
                    delete params[key];
                }
            });

            console.log('Fetching admin transactions with params:', params);
            const response = await adminService.getAllTransactions(params);

            setTransactions(response.data || []);
            setPagination(prev => ({
                ...prev,
                total: response.total || 0,
                pages: response.pages || 1
            }));

        } catch (error) {
            console.error('Error fetching transactions:', error);
            setError(error.message || 'Failed to fetch transactions');
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            setLoading(true);

            const params = { ...filters };
            if (searchTerm.trim()) {
                params.search = searchTerm.trim();
            }

            // Convert date range for export
            if (filters.dateRange && filters.dateRange !== '') {
                const now = new Date();
                switch (filters.dateRange) {
                    case 'today':
                        params.startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
                        params.endDate = new Date(now.setHours(23, 59, 59, 999)).toISOString();
                        break;
                    case 'week':
                        {
                            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                            params.startDate = weekAgo.toISOString();
                            params.endDate = now.toISOString();
                            break;
                        }
                    case 'month':
                        {
                            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                            params.startDate = monthAgo.toISOString();
                            params.endDate = now.toISOString();
                            break;
                        }
                }
            }

            await adminService.exportTransactions(params);
        } catch (error) {
            console.error('Export failed:', error);
            setError('Export failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFlagTransaction = async (transactionId, flagged, flagReason = '') => {
        try {
            await adminService.flagTransaction(transactionId, flagged, flagReason);
            // Refresh the transactions list
            fetchTransactions();
        } catch (error) {
            console.error('Failed to flag transaction:', error);
            setError('Failed to update transaction flag');
        }
    };

    const handleNavigation = (path) => {
        navigate(path);
        setSidebarOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth/login');
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, page }));
    };

    const getStatusColor = (status) => {
        const colors = {
            completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        };
        return colors[status] || colors.pending;
    };

    const getTypeColor = (type) => {
        const colors = {
            transfer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            deposit: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            withdrawal: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            payment: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
        };
        return colors[type] || colors.transfer;
    };

    const getTypeIcon = (type) => {
        const icons = {
            transfer: <ArrowRight className="w-3 h-3" />,
            deposit: <TrendingUp className="w-3 h-3" />,
            withdrawal: <DollarSign className="w-3 h-3" />,
            payment: <User className="w-3 h-3" />
        };
        return icons[type] || icons.transfer;
    };

    return (
        <div className="min-h-screen theme-bg">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 theme-modal-overlay z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onNavigate={handleNavigation}
                currentPath="/admin/transactions"
            />

            {/* Main Content */}
            <div className="lg:ml-64 min-h-screen theme-bg">
                {/* Header */}
                <AdminHeader
                    onMenuClick={() => setSidebarOpen(true)}
                    onLogout={handleLogout}
                />

                {/* Page Content - Mobile First */}
                <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold theme-heading-1">Transaction Management</h1>
                            <p className="text-sm theme-text-secondary mt-1">Monitor and manage all banking transactions</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            <button className="theme-btn-secondary px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 text-sm" onClick={handleExport}>
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="theme-card-elevated rounded-lg p-4 sm:p-6">
                        <div className="flex flex-col space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 theme-input rounded-lg text-sm"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`px-4 py-2 rounded-lg flex items-center justify-center space-x-2 text-sm ${showFilters ? 'theme-accent-bg text-white' : 'theme-btn-secondary'}`}
                                >
                                    <Filter className="w-4 h-4" />
                                    <span>Filters</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 p-4 theme-card rounded-lg"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium theme-text-secondary mb-2">Status</label>
                                            <select
                                                value={filters.status}
                                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                                className="w-full theme-input rounded-lg text-sm"
                                            >
                                                <option value="">All Statuses</option>
                                                <option value="completed">Completed</option>
                                                <option value="pending">Pending</option>
                                                <option value="failed">Failed</option>
                                                <option value="processing">Processing</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium theme-text-secondary mb-2">Type</label>
                                            <select
                                                value={filters.type}
                                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                                className="w-full theme-input rounded-lg text-sm"
                                            >
                                                <option value="">All Types</option>
                                                <option value="transfer">Transfer</option>
                                                <option value="deposit">Deposit</option>
                                                <option value="withdrawal">Withdrawal</option>
                                                <option value="payment">Payment</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium theme-text-secondary mb-2">Date Range</label>
                                            <select
                                                value={filters.dateRange}
                                                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                                                className="w-full theme-input rounded-lg text-sm"
                                            >
                                                <option value="">All Time</option>
                                                <option value="today">Today</option>
                                                <option value="week">This Week</option>
                                                <option value="month">This Month</option>
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Transactions - Mobile First Design */}
                    <div className="theme-card-elevated rounded-lg overflow-hidden">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 theme-accent-border"></div>
                                <span className="text-sm theme-text-secondary">Loading transactions...</span>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <TrendingUp className="w-12 h-12 theme-text-muted" />
                                <div className="text-center">
                                    <h3 className="text-lg font-medium theme-text mb-2">No transactions found</h3>
                                    <p className="text-sm theme-text-secondary">Try adjusting your search or filters</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Mobile Transaction View */}
                                <div className="block sm:hidden">
                                    <div className="divide-y theme-border">
                                        {transactions.map((transaction, index) => (
                                            <motion.div
                                                key={transaction._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="p-4 space-y-3"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`p-2 rounded-lg ${getTypeColor(transaction.type)}`}>
                                                            {getTypeIcon(transaction.type)}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium theme-text">{transaction.transactionId}</div>
                                                            <div className="text-xs theme-text-secondary">{transaction.description}</div>
                                                        </div>
                                                    </div>
                                                    <button className="p-2 theme-text-secondary hover:theme-text">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="text-lg font-bold theme-text">
                                                        PKR {transaction.amount?.toLocaleString() || '0'}
                                                    </div>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
                                                        {transaction.status}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-xs">
                                                    <div>
                                                        <span className="theme-text-secondary">From:</span>
                                                        <div className="theme-text truncate">
                                                            {transaction.fromAccount?.accountNumber || transaction.fromAccount || 'N/A'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="theme-text-secondary">To:</span>
                                                        <div className="theme-text truncate">
                                                            {transaction.toAccount?.accountNumber || transaction.toAccount || 'N/A'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="theme-text-secondary">Type:</span>
                                                        <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs ${getTypeColor(transaction.type)}`}>
                                                            {transaction.type}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="theme-text-secondary">Date:</span>
                                                        <div className="theme-text">{new Date(transaction.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                <div className="pt-2">
                                                    <button className="w-full px-3 py-2 theme-btn-primary rounded-lg transition-colors text-xs flex items-center justify-center space-x-1">
                                                        <Eye className="w-3 h-3" />
                                                        <span>View Details</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Desktop Table View */}
                                <div className="hidden sm:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                                    Transaction ID
                                                </th>
                                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider hidden lg:table-cell">
                                                    From/To
                                                </th>
                                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y theme-border">
                                            {transactions.map((transaction, index) => (
                                                <motion.tr
                                                    key={transaction._id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    <td className="px-4 lg:px-6 py-4">
                                                        <div className="text-sm font-mono theme-text">{transaction.transactionId}</div>
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getTypeColor(transaction.type)}`}>
                                                            {getTypeIcon(transaction.type)}
                                                            <span className="ml-1">{transaction.type}</span>
                                                        </span>
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4">
                                                        <div className="text-sm font-medium theme-text">
                                                            PKR {transaction.amount?.toLocaleString() || '0'}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4 hidden lg:table-cell">
                                                        <div className="text-sm theme-text">
                                                            <div>{transaction.fromAccount?.accountNumber || transaction.fromAccount || 'N/A'}</div>
                                                            <div className="text-xs theme-text-secondary">→ {transaction.toAccount?.accountNumber || transaction.toAccount || 'N/A'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
                                                            {transaction.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4 text-sm theme-text">
                                                        {new Date(transaction.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4 text-right">
                                                        <button
                                                            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 theme-text-secondary hover:theme-text transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-3 sm:w-4 h-3 sm:h-4" />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* Pagination */}
                        {!loading && transactions.length > 0 && pagination.pages > 1 && (
                            <div className="px-4 sm:px-6 py-4 border-t theme-border">
                                <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                                    <div className="text-sm theme-text-secondary">
                                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className="px-3 py-2 text-sm theme-btn-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <div className="flex space-x-1">
                                            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                                const pageNum = i + 1;
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className={`px-3 py-2 text-sm rounded-lg ${pageNum === pagination.page
                                                            ? 'theme-accent-bg text-white'
                                                            : 'theme-btn-secondary'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page === pagination.pages}
                                            className="px-3 py-2 text-sm theme-btn-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="theme-error-bg text-white p-4 rounded-lg flex items-center space-x-2"
                        >
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium">Error</h3>
                                <p className="text-sm opacity-90">{error}</p>
                            </div>
                            <button
                                onClick={() => setError('')}
                                className="flex-shrink-0 ml-auto"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </motion.div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminTransactions;
