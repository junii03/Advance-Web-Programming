/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSearch,
    FiFilter,
    FiFileText,
    FiClock,
    FiCheckCircle,
    FiAlertCircle,
    FiX,
    FiImage,
    FiEye,
    FiEdit2,
    FiCalendar,
    FiUser,
    FiMessageCircle,
    FiChevronLeft,
    FiChevronRight,
    FiRefreshCw
} from 'react-icons/fi';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';

const AdminReports = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReportDetails, setShowReportDetails] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [toast, setToast] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReports, setTotalReports] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // Status update form
    const [statusUpdate, setStatusUpdate] = useState({
        status: '',
        resolutionNote: '',
        adminNotes: ''
    });

    const categories = [
        { value: 'account_issue', label: 'Account Issue', icon: '👤' },
        { value: 'transaction_problem', label: 'Transaction Problem', icon: '💳' },
        { value: 'card_issue', label: 'Card Issue', icon: '💳' },
        { value: 'loan_problem', label: 'Loan Problem', icon: '🏦' },
        { value: 'technical_issue', label: 'Technical Issue', icon: '⚙️' },
        { value: 'complaint', label: 'Complaint', icon: '😤' },
        { value: 'suggestion', label: 'Suggestion', icon: '💡' },
        { value: 'other', label: 'Other', icon: '📝' }
    ];

    const statusConfig = {
        submitted: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: FiClock, label: 'Submitted' },
        in_progress: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: FiMessageCircle, label: 'In Progress' },
        resolved: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: FiCheckCircle, label: 'Resolved' },
        closed: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', icon: FiX, label: 'Closed' }
    };

    const priorityConfig = {
        low: { color: 'text-green-600 dark:text-green-400', label: 'Low' },
        medium: { color: 'text-yellow-600 dark:text-yellow-400', label: 'Medium' },
        high: { color: 'text-orange-600 dark:text-orange-400', label: 'High' },
        urgent: { color: 'text-red-600 dark:text-red-400', label: 'Urgent' }
    };

    useEffect(() => {
        fetchReports();
    }, [currentPage, filterStatus, filterCategory, filterPriority, searchTerm]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const filters = {
                page: currentPage,
                limit: 15,
                ...(filterStatus && { status: filterStatus }),
                ...(filterCategory && { category: filterCategory }),
                ...(filterPriority && { priority: filterPriority }),
                ...(searchTerm && { search: searchTerm })
            };

            const response = await adminService.getAllCustomerReports(filters);
            setReports(response.data);
            setTotalPages(response.pages);
            setTotalReports(response.total);
        } catch (error) {
            showToast('Failed to fetch reports', 'error');
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const handleViewReport = async (report) => {
        try {
            const response = await adminService.getCustomerReportDetails(report.user._id, report.reportId);
            setSelectedReport(response.data);
            setShowReportDetails(true);
        } catch (error) {
            console.error(error);
            showToast('Failed to fetch report details', 'error');
        }
    };

    const handleUpdateStatus = (report) => {
        setSelectedReport(report);
        setStatusUpdate({
            status: report.status,
            resolutionNote: report.resolution?.resolutionNote || '',
            adminNotes: ''
        });
        setShowStatusModal(true);
    };

    const handleStatusSubmit = async (e) => {
        e.preventDefault();

        if (!statusUpdate.status) {
            showToast('Please select a status', 'error');
            return;
        }

        if (statusUpdate.status === 'resolved' && !statusUpdate.resolutionNote.trim()) {
            showToast('Resolution note is required for resolved status', 'error');
            return;
        }

        try {
            setSubmitting(true);
            await adminService.updateReportStatus(
                selectedReport.user._id,
                selectedReport.reportId,
                statusUpdate
            );

            showToast('Report status updated successfully');
            setShowStatusModal(false);
            fetchReports();
        } catch (error) {
            showToast(error.message || 'Failed to update report status', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCategoryInfo = (category) => {
        return categories.find(cat => cat.value === category) || { label: category, icon: '📝' };
    };

    const clearFilters = () => {
        setFilterStatus('');
        setFilterCategory('');
        setFilterPriority('');
        setSearchTerm('');
        setCurrentPage(1);
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth/login');
    };

    const filteredReportsCount = reports.length;

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
                onNavigate={handleNavigation}
                currentPath="/admin/customer-reports"
            />

            {/* Main Content */}
            <div className="lg:ml-64 min-h-screen">
                {/* Header */}
                <AdminHeader
                    onMenuClick={() => setSidebarOpen(true)}
                    onLogout={handleLogout}
                />

                {/* Page Content */}
                <div className="theme-card-elevated border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            <div>
                                <h1 className="text-2xl font-bold theme-heading-1">Customer Reports</h1>
                                <p className="text-sm theme-text-secondary mt-1">
                                    Manage and track customer support requests
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-sm theme-text-muted">
                                    <span>Total: {totalReports}</span>
                                    <span>•</span>
                                    <span>Page {currentPage} of {totalPages}</span>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={fetchReports}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                <FiRefreshCw className="w-4 h-4" />
                                Refresh
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row gap-4 mb-6">
                        {/* Search */}
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by report ID, subject, customer name, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 theme-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-3 theme-card-elevated rounded-lg hover:theme-card-hover transition-colors whitespace-nowrap"
                        >
                            <FiFilter className="w-4 h-4" />
                            Filters
                            {(filterStatus || filterCategory || filterPriority) && (
                                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                                    {[filterStatus, filterCategory, filterPriority].filter(Boolean).length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Filters Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="theme-card-elevated rounded-lg p-6 mb-6 overflow-hidden"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium theme-text-secondary mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="w-full p-3 theme-input rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Status</option>
                                            <option value="submitted">Submitted</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium theme-text-secondary mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={filterCategory}
                                            onChange={(e) => setFilterCategory(e.target.value)}
                                            className="w-full p-3 theme-input rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map(category => (
                                                <option key={category.value} value={category.value}>
                                                    {category.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium theme-text-secondary mb-2">
                                            Priority
                                        </label>
                                        <select
                                            value={filterPriority}
                                            onChange={(e) => setFilterPriority(e.target.value)}
                                            className="w-full p-3 theme-input rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Priorities</option>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>

                                    <div className="flex items-end">
                                        <button
                                            onClick={clearFilters}
                                            className="w-full px-4 py-3 text-sm theme-text-secondary hover:theme-text transition-colors border theme-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Reports List */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <LoadingSpinner />
                        </div>
                    ) : filteredReportsCount === 0 ? (
                        <div className="text-center py-12">
                            <FiFileText className="w-12 h-12 theme-text-muted mx-auto mb-4" />
                            <h3 className="text-lg font-medium theme-text mb-2">
                                No reports found
                            </h3>
                            <p className="theme-text-secondary mb-6">
                                {searchTerm || filterStatus || filterCategory || filterPriority
                                    ? 'Try adjusting your search or filters'
                                    : 'No customer reports available'
                                }
                            </p>
                            {(searchTerm || filterStatus || filterCategory || filterPriority) && (
                                <button
                                    onClick={clearFilters}
                                    className="theme-btn-primary px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reports.map((report, index) => {
                                const categoryInfo = getCategoryInfo(report.category);
                                const statusInfo = statusConfig[report.status];
                                const StatusIcon = statusInfo.icon;
                                const priorityInfo = priorityConfig[report.priority];

                                return (
                                    <motion.div
                                        key={report.reportId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="theme-card-elevated rounded-lg p-4 sm:p-6 hover:theme-card-hover transition-all"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="text-lg">{categoryInfo.icon}</span>
                                                    <h3 className="text-lg font-semibold theme-text truncate">
                                                        {report.subject}
                                                    </h3>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusInfo.label}
                                                    </span>
                                                </div>

                                                <p className="theme-text-secondary mb-3 line-clamp-2">
                                                    {report.description}
                                                </p>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm theme-text-muted">
                                                    <div className="flex items-center gap-2">
                                                        <FiUser className="w-4 h-4 flex-shrink-0" />
                                                        <span className="truncate">
                                                            {report.user.firstName} {report.user.lastName}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs">ID:</span>
                                                        <span className="font-mono text-xs">{report.reportId}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <FiCalendar className="w-4 h-4 flex-shrink-0" />
                                                        <span>{formatDate(report.submittedAt)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span>Priority:</span>
                                                        <span className={`font-medium ${priorityInfo.color}`}>
                                                            {priorityInfo.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span>Customer:</span>
                                                        <span className="truncate">{report.user.email}</span>
                                                    </div>
                                                    {report.images && report.images.length > 0 && (
                                                        <div className="flex items-center gap-2">
                                                            <FiImage className="w-4 h-4 flex-shrink-0" />
                                                            <span>{report.images.length} attachment(s)</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3 lg:gap-2">
                                                <button
                                                    onClick={() => handleViewReport(report)}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                                                >
                                                    <FiEye className="w-4 h-4" />
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(report)}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                    Update Status
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                            <div className="text-sm theme-text-muted">
                                Showing {((currentPage - 1) * 15) + 1}-{Math.min(currentPage * 15, totalReports)} of {totalReports} reports
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg theme-card-elevated hover:theme-card-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <FiChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const pageNum = i + 1;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'theme-card-elevated hover:theme-card-hover'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg theme-card-elevated hover:theme-card-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                    <FiChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Report Details Modal */}
                <AnimatePresence>
                    {showReportDetails && selectedReport && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 theme-modal-overlay flex items-center justify-center p-4 z-50"
                            onClick={() => setShowReportDetails(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="theme-modal-card rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-2xl">{getCategoryInfo(selectedReport.report.category).icon}</span>
                                                <h2 className="text-xl font-bold theme-heading-1">
                                                    {selectedReport.report.subject}
                                                </h2>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-sm theme-text-muted">
                                                <span>Report ID: {selectedReport.report.reportId}</span>
                                                <span>Customer: {selectedReport.user.firstName} {selectedReport.user.lastName}</span>
                                                <span>Email: {selectedReport.user.email}</span>
                                                <span>Submitted: {formatDate(selectedReport.report.submittedAt)}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowReportDetails(false)}
                                            className="theme-text-muted hover:theme-text transition-colors ml-4"
                                        >
                                            <FiX className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Status and Priority */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <h3 className="text-sm font-medium theme-text-secondary mb-2">Status</h3>
                                                <div className="flex items-center gap-2">
                                                    {React.createElement(statusConfig[selectedReport.report.status].icon, {
                                                        className: "w-4 h-4"
                                                    })}
                                                    <span className={`font-medium ${statusConfig[selectedReport.report.status].color}`}>
                                                        {statusConfig[selectedReport.report.status].label}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium theme-text-secondary mb-2">Priority</h3>
                                                <span className={`font-medium ${priorityConfig[selectedReport.report.priority].color}`}>
                                                    {priorityConfig[selectedReport.report.priority].label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <h3 className="text-sm font-medium theme-text-secondary mb-2">Description</h3>
                                            <p className="theme-text whitespace-pre-wrap">
                                                {selectedReport.report.description}
                                            </p>
                                        </div>

                                        {/* Images */}
                                        {selectedReport.report.images && selectedReport.report.images.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-medium theme-text-secondary mb-2">
                                                    Attachments ({selectedReport.report.images.length})
                                                </h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {selectedReport.report.images.map((image, index) => (
                                                        <div key={index} className="relative group">
                                                            <img
                                                                src={image.url}
                                                                alt={`Attachment ${index + 1}`}
                                                                className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                                                onClick={() => window.open(image.url, '_blank')}
                                                            />
                                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                                <FiEye className="w-6 h-6 text-white" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Resolution */}
                                        {selectedReport.report.resolution && selectedReport.report.resolution.resolutionNote && (
                                            <div>
                                                <h3 className="text-sm font-medium theme-text-secondary mb-2">Resolution</h3>
                                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                                    <p className="text-green-800 dark:text-green-200">
                                                        {selectedReport.report.resolution.resolutionNote}
                                                    </p>
                                                    {selectedReport.report.resolution.resolvedAt && (
                                                        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                                                            Resolved on {formatDate(selectedReport.report.resolution.resolvedAt)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t theme-border">
                                        <button
                                            onClick={() => setShowReportDetails(false)}
                                            className="flex-1 px-4 py-2 theme-btn-ghost rounded-lg transition-colors"
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowReportDetails(false);
                                                handleUpdateStatus(selectedReport.report);
                                            }}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                            Update Status
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Status Update Modal */}
                <AnimatePresence>
                    {showStatusModal && selectedReport && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 theme-modal-overlay flex items-center justify-center p-4 z-50"
                            onClick={() => setShowStatusModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="theme-modal-card rounded-lg w-full max-w-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold theme-heading-1">
                                            Update Report Status
                                        </h2>
                                        <button
                                            onClick={() => setShowStatusModal(false)}
                                            className="theme-text-muted hover:theme-text transition-colors"
                                        >
                                            <FiX className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleStatusSubmit} className="space-y-4">
                                        {/* Status */}
                                        <div>
                                            <label className="block text-sm font-medium theme-text-secondary mb-2">
                                                Status *
                                            </label>
                                            <select
                                                value={statusUpdate.status}
                                                onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                                                className="w-full p-3 theme-input rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select status</option>
                                                <option value="submitted">Submitted</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </div>

                                        {/* Resolution Note */}
                                        {statusUpdate.status === 'resolved' && (
                                            <div>
                                                <label className="block text-sm font-medium theme-text-secondary mb-2">
                                                    Resolution Note *
                                                </label>
                                                <textarea
                                                    value={statusUpdate.resolutionNote}
                                                    onChange={(e) => setStatusUpdate(prev => ({ ...prev, resolutionNote: e.target.value }))}
                                                    placeholder="Explain how the issue was resolved..."
                                                    rows={4}
                                                    className="w-full p-3 theme-input rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                                    required
                                                />
                                            </div>
                                        )}

                                        {/* Admin Notes */}
                                        <div>
                                            <label className="block text-sm font-medium theme-text-secondary mb-2">
                                                Internal Notes (Optional)
                                            </label>
                                            <textarea
                                                value={statusUpdate.adminNotes}
                                                onChange={(e) => setStatusUpdate(prev => ({ ...prev, adminNotes: e.target.value }))}
                                                placeholder="Add internal notes for your team..."
                                                rows={3}
                                                className="w-full p-3 theme-input rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                            />
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowStatusModal(false)}
                                                className="flex-1 px-4 py-2 theme-btn-ghost rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting || !statusUpdate.status}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                                            >
                                                {submitting ? (
                                                    <>
                                                        <LoadingSpinner size="sm" />
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiCheckCircle className="w-4 h-4" />
                                                        Update Status
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Toast */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default AdminReports;
