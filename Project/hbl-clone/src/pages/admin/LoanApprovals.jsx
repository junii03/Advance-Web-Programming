/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    Download,
    RefreshCw,
    ChevronDown,
    ChevronLeft,
    Eye,
    Check,
    X,
    AlertTriangle,
    DollarSign,
    Clock,
    Calendar,
    User,
    FileText,
    ArrowUpDown,
    CheckSquare,
    Square,
    MoreHorizontal
} from 'lucide-react';

// Components
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import LoanCard from '../../components/admin/LoanCard';
import LoanDetailsModal from '../../components/admin/LoanDetailsModal';
import BulkActionBar from '../../components/admin/BulkActionBar';
import FilterPanel from '../../components/admin/FilterPanel';
import Pagination from '../../components/admin/Pagination';

// Services
import adminService from '../../services/adminService';

const LOAN_STATUSES = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
    rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
    active: { color: 'bg-blue-100 text-blue-800', label: 'Active' },
    closed: { color: 'bg-gray-100 text-gray-800', label: 'Closed' }
};

const LOAN_TYPES = {
    personal: { icon: '👤', label: 'Personal' },
    home: { icon: '🏠', label: 'Home' },
    car: { icon: '🚗', label: 'Car' },
    business: { icon: '💼', label: 'Business' }
};

const SORT_OPTIONS = [
    { value: 'applicationDate', label: 'Application Date' },
    { value: 'amount', label: 'Amount' },
    { value: 'loanType', label: 'Loan Type' },
    { value: 'status', label: 'Status' }
];

const LoanApprovals = () => {
    // State management
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedLoans, setSelectedLoans] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [bulkActionMode, setBulkActionMode] = useState(false);

    // Modal and detail states
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    // Filter and pagination states
    const [filters, setFilters] = useState({
        status: 'pending',
        loanType: '',
        minAmount: '',
        maxAmount: '',
        startDate: '',
        endDate: '',
        search: ''
    });
    const [sortBy, setSortBy] = useState('applicationDate');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [itemsPerPage] = useState(12);

    const navigate = useNavigate();

    // Fetch loans with filters
    const fetchLoans = useCallback(async () => {
        try {
            setLoading(true);
            const queryParams = {
                page: currentPage,
                limit: itemsPerPage,
                status: filters.status,
                sortBy,
                sortOrder,
                ...(filters.loanType && { loanType: filters.loanType }),
                ...(filters.minAmount && { minAmount: filters.minAmount }),
                ...(filters.maxAmount && { maxAmount: filters.maxAmount }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate }),
                ...(filters.search && { search: filters.search })
            };

            const response = await adminService.getAllLoans(queryParams);
            setLoans(response.data || []);
            setTotalPages(response.pages || 1);
            setTotalCount(response.total || 0);
        } catch (err) {
            setError(err.message || 'Failed to fetch loans');
            console.error('Error fetching loans:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, filters, sortBy, sortOrder]);

    // Effects
    useEffect(() => {
        fetchLoans();
    }, [fetchLoans]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, sortBy, sortOrder]);

    useEffect(() => {
        const allLoansSelected = loans.length > 0 && selectedLoans.length === loans.length;
        setSelectAll(allLoansSelected);
    }, [selectedLoans, loans]);

    // Event handlers
    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const handleSelectLoan = (loanId) => {
        setSelectedLoans(prev => {
            if (prev.includes(loanId)) {
                return prev.filter(id => id !== loanId);
            } else {
                return [...prev, loanId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedLoans([]);
        } else {
            setSelectedLoans(loans.map(loan => loan._id));
        }
    };

    const handleLoanAction = async (loanId, action, reason = '') => {
        try {
            await adminService.approveLoan(loanId, action, reason);
            await fetchLoans();
            setSelectedLoan(null);
            setShowDetailsModal(false);
        } catch (error) {
            console.error('Error processing loan action:', error);
            throw error;
        }
    };

    const handleBulkAction = async (action, reason = '') => {
        try {
            const promises = selectedLoans.map(loanId =>
                adminService.approveLoan(loanId, action, reason)
            );
            await Promise.all(promises);
            await fetchLoans();
            setSelectedLoans([]);
            setBulkActionMode(false);
        } catch (error) {
            console.error('Error processing bulk action:', error);
            throw error;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth/login');
    };

    // Priority calculation
    const calculatePriority = (loan) => {
        if (loan.amount > 1000000) return 'high';
        if (loan.amount > 500000) return 'medium';
        return 'low';
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.3,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 }
        }
    };

    if (error) {
        return (
            <div className="min-h-screen theme-container flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold theme-heading-1 mb-2">Error Loading Loans</h2>
                    <p className="theme-text-secondary mb-4">{error}</p>
                    <button
                        onClick={fetchLoans}
                        className="theme-btn-primary px-6 py-2 rounded-lg"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen theme-container">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onNavigate={(path) => navigate(path)}
                currentPath="/admin/loans"
            />

            {/* Main Content */}
            <div className="lg:ml-64 min-h-screen">
                {/* Header */}
                <AdminHeader
                    onMenuClick={() => setSidebarOpen(true)}
                    onLogout={handleLogout}
                />

                {/* Page Content */}
                <motion.main
                    className="p-4 sm:p-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Page Header */}
                    <motion.div variants={itemVariants} className="mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <button
                                        onClick={() => navigate('/admin/dashboard')}
                                        className="p-1 rounded theme-card hover:theme-card-hover lg:hidden"
                                    >
                                        <ChevronLeft className="w-5 h-5 theme-text" />
                                    </button>
                                    <h1 className="text-2xl sm:text-3xl font-bold theme-heading-1">
                                        Loan Approvals
                                    </h1>
                                </div>
                                <p className="theme-text-secondary">
                                    Review and manage loan applications
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={fetchLoans}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-3 py-2 theme-btn-secondary rounded-lg text-sm"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    <span className="hidden sm:inline">Refresh</span>
                                </button>

                                <button
                                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                                    className="flex items-center gap-2 px-3 py-2 theme-btn-secondary rounded-lg text-sm"
                                >
                                    <Filter className="w-4 h-4" />
                                    <span className="hidden sm:inline">Filter</span>
                                </button>

                                <button
                                    onClick={() => setBulkActionMode(!bulkActionMode)}
                                    className="flex items-center gap-2 px-3 py-2 theme-btn-secondary rounded-lg text-sm"
                                >
                                    <CheckSquare className="w-4 h-4" />
                                    <span className="hidden sm:inline">Select</span>
                                </button>
                            </div>
                        </div>

                        {/* Stats Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                            <div className="theme-card rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold theme-text">
                                            {loans.filter(l => l.status === 'pending').length}
                                        </p>
                                        <p className="text-xs theme-text-secondary">Pending</p>
                                    </div>
                                </div>
                            </div>

                            <div className="theme-card rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Check className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold theme-text">
                                            {loans.filter(l => l.status === 'approved').length}
                                        </p>
                                        <p className="text-xs theme-text-secondary">Approved</p>
                                    </div>
                                </div>
                            </div>

                            <div className="theme-card rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold theme-text">
                                            {formatCurrency(loans.reduce((sum, l) => sum + (l.amount || 0), 0))}
                                        </p>
                                        <p className="text-xs theme-text-secondary">Total Value</p>
                                    </div>
                                </div>
                            </div>

                            <div className="theme-card rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold theme-text">{totalCount}</p>
                                        <p className="text-xs theme-text-secondary">Total</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Search and Sort Bar */}
                    <motion.div variants={itemVariants} className="mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Search by loan ID, applicant name, or purpose..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange({ search: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 theme-input rounded-lg text-sm"
                                />
                            </div>

                            {/* Sort */}
                            <div className="flex items-center gap-2">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="theme-input rounded-lg text-sm pr-8"
                                >
                                    {SORT_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="p-2 theme-btn-secondary rounded-lg"
                                >
                                    <ArrowUpDown className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Filter Panel */}
                    <AnimatePresence>
                        {showFilterPanel && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 overflow-hidden"
                            >
                                <FilterPanel
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                    onClose={() => setShowFilterPanel(false)}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bulk Action Bar */}
                    <AnimatePresence>
                        {bulkActionMode && selectedLoans.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mb-6"
                            >
                                <BulkActionBar
                                    selectedCount={selectedLoans.length}
                                    onApprove={() => handleBulkAction('approve')}
                                    onReject={(reason) => handleBulkAction('reject', reason)}
                                    onCancel={() => {
                                        setSelectedLoans([]);
                                        setBulkActionMode(false);
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Loans Grid */}
                    <motion.div variants={itemVariants}>
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, index) => (
                                    <div key={index} className="theme-card rounded-lg p-6 animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                                        <div className="h-3 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded mb-4"></div>
                                        <div className="h-8 bg-gray-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : loans.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 theme-text-muted mx-auto mb-4" />
                                <h3 className="text-lg font-medium theme-text mb-2">No loans found</h3>
                                <p className="theme-text-secondary">
                                    Try adjusting your filters or search criteria
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {loans.map((loan) => (
                                    <LoanCard
                                        key={loan._id}
                                        loan={loan}
                                        isSelected={selectedLoans.includes(loan._id)}
                                        showCheckbox={bulkActionMode}
                                        priority={calculatePriority(loan)}
                                        onSelect={() => handleSelectLoan(loan._id)}
                                        onView={() => {
                                            setSelectedLoan(loan);
                                            setShowDetailsModal(true);
                                        }}
                                        onAction={handleLoanAction}
                                        formatCurrency={formatCurrency}
                                        loanTypes={LOAN_TYPES}
                                        loanStatuses={LOAN_STATUSES}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <motion.div variants={itemVariants} className="mt-8">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalCount={totalCount}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </motion.div>
                    )}
                </motion.main>
            </div>

            {/* Loan Details Modal */}
            <LoanDetailsModal
                isOpen={showDetailsModal}
                loan={selectedLoan}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedLoan(null);
                }}
                onAction={handleLoanAction}
                formatCurrency={formatCurrency}
                loanTypes={LOAN_TYPES}
                loanStatuses={LOAN_STATUSES}
            />
        </div>
    );
};

export default LoanApprovals;
