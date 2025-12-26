/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard,
    Search,
    Filter,
    Eye,
    Edit,
    Ban,
    CheckCircle,
    XCircle,
    Download,
    Calendar,
    Users,
    DollarSign,
    ChevronDown,
    MoreVertical,
    AlertCircle
} from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import adminService from '../../services/adminService';

const AdminCardManagement = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        cardType: 'all',
        issueDate: 'all'
    });
    const [selectedCards, setSelectedCards] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [actionLoading, setActionLoading] = useState({});
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchCards();
    }, [pagination.page, filters, debouncedSearchTerm]);

    const fetchCards = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminService.getAllCards({
                page: pagination.page,
                limit: pagination.limit,
                search: debouncedSearchTerm,
                ...filters
            });

            setCards(response.data);
            setPagination(prev => ({
                ...prev,
                total: response.total,
                pages: response.pages
            }));
        } catch (error) {
            console.error('Error fetching cards:', error);
            setError('Failed to load cards. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCardAction = async (cardId, action) => {
        try {
            setActionLoading(prev => ({ ...prev, [cardId]: true }));

            // Find the card to get user ID
            const card = cards.find(c => c._id === cardId);
            if (!card) {
                throw new Error('Card not found');
            }

            const status = action === 'activate' ? 'active' : 'blocked';
            const reason = action === 'activate'
                ? 'Card activated by admin'
                : 'Card blocked by admin';

            await adminService.updateCardStatus(card.userId, cardId, status, reason);

            // Update the card in the local state immediately for better UX
            setCards(prevCards =>
                prevCards.map(c =>
                    c._id === cardId
                        ? { ...c, status, cardStatus: status }
                        : c
                )
            );
        } catch (error) {
            console.error('Error performing card action:', error);
            setError(`Failed to ${action} card. Please try again.`);
        } finally {
            setActionLoading(prev => ({ ...prev, [cardId]: false }));
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            active: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
            blocked: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
            suspended: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
            expired: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
        };
        return colors[status] || colors.active;
    };

    const getCardTypeColor = (type) => {
        const colors = {
            debit: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
            credit: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20',
            prepaid: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20'
        };
        return colors[type] || colors.debit;
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

    return (
        <div className="min-h-screen theme-bg">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onNavigate={handleNavigation}
                currentPath="/admin/cards"
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
                            <h1 className="text-xl sm:text-2xl font-bold theme-heading-1">Card Management</h1>
                            <p className="text-sm theme-text-secondary mt-1">Manage and monitor all bank cards</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            <button className="theme-btn-secondary px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 text-sm">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="theme-card-elevated rounded-lg p-4 sm:p-6">
                        <div className="flex flex-col space-y-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search by card number, user name, or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 theme-input rounded-lg text-sm"
                                />
                            </div>

                            {/* Filter Controls */}
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

                        {/* Advanced Filters */}
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
                                                <option value="all">All Statuses</option>
                                                <option value="active">Active</option>
                                                <option value="blocked">Blocked</option>
                                                <option value="suspended">Suspended</option>
                                                <option value="expired">Expired</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium theme-text-secondary mb-2">Card Type</label>
                                            <select
                                                value={filters.cardType}
                                                onChange={(e) => setFilters({ ...filters, cardType: e.target.value })}
                                                className="w-full theme-input rounded-lg text-sm"
                                            >
                                                <option value="all">All Types</option>
                                                <option value="debit">Debit</option>
                                                <option value="credit">Credit</option>
                                                <option value="prepaid">Prepaid</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium theme-text-secondary mb-2">Issue Date</label>
                                            <select
                                                value={filters.issueDate}
                                                onChange={(e) => setFilters({ ...filters, issueDate: e.target.value })}
                                                className="w-full theme-input rounded-lg text-sm"
                                            >
                                                <option value="all">All Time</option>
                                                <option value="week">This Week</option>
                                                <option value="month">This Month</option>
                                                <option value="year">This Year</option>
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Cards - Mobile First Design */}
                    <div className="theme-card-elevated rounded-lg overflow-hidden">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 theme-accent-border"></div>
                                <span className="text-sm theme-text-secondary">Loading cards...</span>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <AlertCircle className="w-12 h-12 text-red-600" />
                                <div className="text-center">
                                    <h3 className="text-lg font-medium theme-text mb-2">Error loading cards</h3>
                                    <p className="text-sm theme-text-secondary">{error}</p>
                                </div>
                            </div>
                        ) : cards.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <CreditCard className="w-12 h-12 theme-text-muted" />
                                <div className="text-center">
                                    <h3 className="text-lg font-medium theme-text mb-2">No cards found</h3>
                                    <p className="text-sm theme-text-secondary">Try adjusting your search or filters</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Mobile Card View */}
                                <div className="block sm:hidden">
                                    <div className="divide-y theme-border">
                                        {cards.map((card, index) => (
                                            <motion.div
                                                key={card._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="p-4 space-y-3"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <CreditCard className="w-8 h-8 theme-accent" />
                                                        <div>
                                                            <div className="text-sm font-medium theme-text">{card.cardNumber}</div>
                                                            <div className="text-xs theme-text-secondary">
                                                                {card.user.firstName} {card.user.lastName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button className="p-2 theme-text-secondary hover:theme-text">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-xs">
                                                    <div>
                                                        <span className="theme-text-secondary">Status:</span>
                                                        <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(card.status)}`}>
                                                            {card.status}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="theme-text-secondary">Type:</span>
                                                        <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs ${getCardTypeColor(card.cardType)}`}>
                                                            {card.cardType}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="theme-text-secondary">Issued:</span>
                                                        <span className="ml-2 theme-text">{new Date(card.issuedDate).toLocaleDateString()}</span>
                                                    </div>
                                                    <div>
                                                        <span className="theme-text-secondary">Last Used:</span>
                                                        <span className="ml-2 theme-text">{card.lastUsed ? new Date(card.lastUsed).toLocaleDateString() : 'Never'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2 pt-2">
                                                    <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs flex items-center justify-center space-x-1">
                                                        <Eye className="w-3 h-3" />
                                                        <span>View</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleCardAction(card._id, card.status === 'active' ? 'block' : 'activate')}
                                                        className={`flex-1 px-3 py-2 rounded-lg transition-colors text-xs flex items-center justify-center space-x-1 ${card.status === 'active'
                                                            ? 'bg-red-600 text-white hover:bg-red-700'
                                                            : 'bg-green-600 text-white hover:bg-green-700'
                                                            }`}
                                                    >
                                                        {card.status === 'active' ? (
                                                            <>
                                                                <Ban className="w-3 h-3" />
                                                                <span>Block</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle className="w-3 h-3" />
                                                                <span>Activate</span>
                                                            </>
                                                        )}
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
                                                    Card Details
                                                </th>
                                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                                    Cardholder
                                                </th>
                                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider hidden lg:table-cell">
                                                    Issued Date
                                                </th>
                                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider hidden lg:table-cell">
                                                    Last Used
                                                </th>
                                                <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y theme-border">
                                            {cards.map((card, index) => (
                                                <motion.tr
                                                    key={card._id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    <td className="px-4 lg:px-6 py-4">
                                                        <div className="flex items-center">
                                                            <CreditCard className="w-6 sm:w-8 h-6 sm:h-8 theme-accent mr-3" />
                                                            <div>
                                                                <div className="text-sm font-medium theme-text">{card.cardNumber}</div>
                                                                <div className="text-xs theme-text-secondary">
                                                                    Expires: {new Date(card.expiryDate).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4">
                                                        <div className="text-sm font-medium theme-text">
                                                            {card.user.firstName} {card.user.lastName}
                                                        </div>
                                                        <div className="text-xs theme-text-secondary truncate max-w-32">{card.user.email}</div>
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(card.status)}`}>
                                                            {card.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getCardTypeColor(card.cardType)}`}>
                                                            {card.cardType}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4 text-sm theme-text hidden lg:table-cell">
                                                        {new Date(card.issuedDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4 text-sm theme-text hidden lg:table-cell">
                                                        {card.lastUsed ? new Date(card.lastUsed).toLocaleDateString() : 'Never'}
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                                                            <button
                                                                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 theme-text-secondary hover:theme-text transition-colors"
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-3 sm:w-4 h-3 sm:h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleCardAction(card._id, card.status === 'active' ? 'block' : 'activate')}
                                                                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${card.status === 'active'
                                                                    ? 'hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600'
                                                                    : 'hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600'
                                                                    }`}
                                                                title={card.status === 'active' ? 'Block Card' : 'Activate Card'}
                                                            >
                                                                {card.status === 'active' ? <Ban className="w-3 sm:w-4 h-3 sm:h-4" /> : <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4" />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Pagination */}
                    {!loading && cards.length > 0 && pagination.pages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 theme-card-elevated rounded-lg p-4">
                            <div className="text-sm theme-text-secondary">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} cards
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                    disabled={pagination.page === 1}
                                    className="px-3 py-2 rounded-lg theme-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center space-x-1">
                                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                        let pageNum;
                                        if (pagination.pages <= 5) {
                                            pageNum = i + 1;
                                        } else if (pagination.page <= 3) {
                                            pageNum = i + 1;
                                        } else if (pagination.page >= pagination.pages - 2) {
                                            pageNum = pagination.pages - 4 + i;
                                        } else {
                                            pageNum = pagination.page - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                                                className={`w-8 h-8 rounded-lg text-sm ${pagination.page === pageNum
                                                    ? 'theme-accent-bg text-white'
                                                    : 'theme-btn-ghost hover:theme-surface'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.page + 1, pagination.pages) }))}
                                    disabled={pagination.page === pagination.pages}
                                    className="px-3 py-2 rounded-lg theme-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminCardManagement;
