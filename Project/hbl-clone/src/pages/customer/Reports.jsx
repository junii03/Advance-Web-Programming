import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import {
    FiPlus,
    FiSearch,
    FiFilter,
    FiFileText,
    FiClock,
    FiCheckCircle,
    FiAlertCircle,
    FiX,
    FiUpload,
    FiImage,
    FiEye,
    FiEdit2,
    FiTrash2,
    FiMessageCircle,
    FiCalendar,
    FiUser,
    FiSend
} from 'react-icons/fi';
import dashboardService from '../../services/dashboardService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewReportModal, setShowNewReportModal] = useState(false);
    const [showReportDetails, setShowReportDetails] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [toast, setToast] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const fileInputRef = useRef(null);

    // New report form state
    const [newReport, setNewReport] = useState({
        category: '',
        subject: '',
        description: '',
        priority: 'medium',
        images: []
    });
    const [submitting, setSubmitting] = useState(false);

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
        submitted: { color: 'bg-blue-100 text-blue-800', icon: FiClock, label: 'Submitted' },
        in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: FiMessageCircle, label: 'In Progress' },
        resolved: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, label: 'Resolved' },
        closed: { color: 'bg-gray-100 text-gray-800', icon: FiX, label: 'Closed' }
    };

    const priorityConfig = {
        low: { color: 'text-green-600', label: 'Low' },
        medium: { color: 'text-yellow-600', label: 'Medium' },
        high: { color: 'text-orange-600', label: 'High' },
        urgent: { color: 'text-red-600', label: 'Urgent' }
    };

    useEffect(() => {
        fetchReports();
    }, [currentPage, filterStatus, filterCategory]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await dashboardService.getReports(
                currentPage,
                10,
                filterStatus,
                filterCategory
            );
            setReports(response.data);
            setTotalPages(response.pages);
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

    const handleSubmitReport = async (e) => {
        e.preventDefault();

        if (!newReport.category || !newReport.subject || !newReport.description) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            setSubmitting(true);

            const formData = new FormData();
            formData.append('category', newReport.category);
            formData.append('subject', newReport.subject);
            formData.append('description', newReport.description);
            formData.append('priority', newReport.priority);

            // Add images to form data
            newReport.images.forEach((image, index) => {
                console.log(`Adding image ${index + 1}:`, image.name);
                formData.append('images', image);
            });

            const response = await dashboardService.submitReportWithImages(formData);
            console.log('Report submitted:', response.data);
            showToast('Report submitted successfully!');
            setShowNewReportModal(false);
            setNewReport({
                category: '',
                subject: '',
                description: '',
                priority: 'medium',
                images: []
            });
            fetchReports();
        } catch (error) {
            showToast(error.message || 'Failed to submit report', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (newReport.images.length + files.length > 3) {
            showToast('Maximum 3 images allowed', 'error');
            return;
        }

        const validFiles = files.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                showToast(`${file.name} is too large. Maximum size is 5MB`, 'error');
                return false;
            }
            if (!file.type.startsWith('image/')) {
                showToast(`${file.name} is not an image file`, 'error');
                return false;
            }
            return true;
        });

        setNewReport(prev => ({
            ...prev,
            images: [...prev.images, ...validFiles]
        }));
    };

    const removeImage = (index) => {
        setNewReport(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const filteredReports = reports.filter(report =>
        report.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reportId.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    const navigate = useNavigate();

    return (
        <div className="min-h-screen theme-container">
            {/* Header - matches Loan page style */}
            <div className="theme-card-elevated border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/customer/dashboard')}
                            className="p-2 rounded-lg theme-card hover:theme-card-hover transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 theme-text" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold theme-heading-1">Support Reports</h1>
                            <p className="text-sm theme-text-secondary">Submit and track your support requests</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowNewReportModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-sm text-sm font-medium"
                        >
                            <FiPlus className="w-4 h-4" />
                            New Report
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    {/* Search */}
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 theme-input rounded-lg focus:ring-2 focus:ring-offset-0"
                        />
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 theme-card-elevated rounded-lg hover:theme-card-hover transition-colors"
                    >
                        <FiFilter className="w-4 h-4" />
                        Filters
                    </button>
                </div>

                {/* Filters Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="theme-card-elevated rounded-lg p-4 mb-6 overflow-hidden"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="w-full p-2 theme-input rounded-lg focus:ring-2 focus:ring-offset-0"
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
                                        className="w-full p-2 theme-input rounded-lg focus:ring-2 focus:ring-offset-0"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm:col-span-2 lg:col-span-2 flex items-end">
                                    <button
                                        onClick={() => {
                                            setFilterStatus('');
                                            setFilterCategory('');
                                            setSearchTerm('');
                                        }}
                                        className="px-4 py-2 text-sm theme-text-secondary hover:theme-text transition-colors"
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
                ) : filteredReports.length === 0 ? (
                    <div className="text-center py-12">
                        <FiFileText className="w-12 h-12 theme-text-muted mx-auto mb-4" />
                        <h3 className="text-lg font-medium theme-text mb-2">
                            No reports found
                        </h3>
                        <p className="theme-text-secondary mb-6">
                            {searchTerm || filterStatus || filterCategory
                                ? 'Try adjusting your search or filters'
                                : 'Create your first support report to get started'
                            }
                        </p>
                        {!searchTerm && !filterStatus && !filterCategory && (
                            <button
                                onClick={() => setShowNewReportModal(true)}
                                className="theme-btn-primary px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Create Report
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredReports.map((report) => {
                            const categoryInfo = getCategoryInfo(report.category);
                            const statusInfo = statusConfig[report.status];
                            const StatusIcon = statusInfo.icon;

                            return (
                                <motion.div
                                    key={report.reportId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="theme-card-elevated rounded-lg p-4 sm:p-6 hover:theme-card-hover transition-all cursor-pointer"
                                    onClick={() => {
                                        setSelectedReport(report);
                                        setShowReportDetails(true);
                                    }}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-lg">{categoryInfo.icon}</span>
                                                <h3 className="text-lg font-semibold theme-text truncate">
                                                    {report.subject}
                                                </h3>
                                            </div>

                                            <p className="theme-text-secondary mb-3 line-clamp-2">
                                                {report.description}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-4 text-sm theme-text-muted">
                                                <span className="flex items-center gap-1">
                                                    <FiUser className="w-4 h-4" />
                                                    {report.reportId}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FiCalendar className="w-4 h-4" />
                                                    {formatDate(report.submittedAt)}
                                                </span>
                                                <span className={`font-medium ${priorityConfig[report.priority].color}`}>
                                                    {priorityConfig[report.priority].label} Priority
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusInfo.label}
                                            </span>

                                            {report.images && report.images.length > 0 && (
                                                <span className="flex items-center gap-1 text-xs theme-text-muted">
                                                    <FiImage className="w-3 h-3" />
                                                    {report.images.length}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 rounded-lg theme-card-elevated hover:theme-card-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>

                        <span className="px-4 py-2 text-sm theme-text-muted">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 rounded-lg theme-card-elevated hover:theme-card-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* New Report Modal */}
            <AnimatePresence>
                {showNewReportModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 theme-modal-overlay flex items-center justify-center p-4 z-50"
                        onClick={() => setShowNewReportModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="theme-modal-card rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold theme-heading-1">
                                        Submit New Report
                                    </h2>
                                    <button
                                        onClick={() => setShowNewReportModal(false)}
                                        className="theme-text-muted hover:theme-text transition-colors"
                                    >
                                        <FiX className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmitReport} className="space-y-6">
                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium theme-text-secondary mb-2">
                                            Category *
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {categories.map((category) => (
                                                <button
                                                    key={category.value}
                                                    type="button"
                                                    onClick={() => setNewReport(prev => ({ ...prev, category: category.value }))}
                                                    className={`p-3 rounded-lg border text-center transition-colors ${newReport.category === category.value
                                                        ? 'theme-border theme-accent-bg theme-accent'
                                                        : 'theme-border hover:border-emerald-300 theme-text'
                                                        }`}
                                                >
                                                    <div className="text-xl mb-1">{category.icon}</div>
                                                    <div className="text-xs font-medium">{category.label}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label className="block text-sm font-medium theme-text-secondary mb-2">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            value={newReport.subject}
                                            onChange={(e) => setNewReport(prev => ({ ...prev, subject: e.target.value }))}
                                            placeholder="Brief description of your issue"
                                            maxLength={200}
                                            className="w-full p-3 theme-input rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        />
                                        <div className="text-right text-xs theme-text-muted mt-1">
                                            {newReport.subject.length}/200
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium theme-text-secondary mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            value={newReport.description}
                                            onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Provide detailed information about your issue..."
                                            rows={4}
                                            maxLength={2000}
                                            className="w-full p-3 theme-input rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                                        />
                                        <div className="text-right text-xs theme-text-muted mt-1">
                                            {newReport.description.length}/2000
                                        </div>
                                    </div>

                                    {/* Priority */}
                                    <div>
                                        <label className="block text-sm font-medium theme-text-secondary mb-2">
                                            Priority
                                        </label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {Object.entries(priorityConfig).map(([key, config]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setNewReport(prev => ({ ...prev, priority: key }))}
                                                    className={`p-2 rounded-lg border text-center transition-colors ${newReport.priority === key
                                                        ? 'border-emerald-500 bg-emerald-50 theme-accent'
                                                        : 'theme-border hover:border-emerald-300'
                                                        }`}
                                                >
                                                    <div className={`text-sm font-medium ${config.color}`}>
                                                        {config.label}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Images */}
                                    <div>
                                        <label className="block text-sm font-medium theme-text-secondary mb-2">
                                            Attachments (Optional)
                                        </label>
                                        <div className="space-y-3">
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-2 border-dashed theme-border rounded-lg p-6 text-center cursor-pointer hover:border-emerald-400 transition-colors"
                                            >
                                                <FiUpload className="w-8 h-8 theme-text-muted mx-auto mb-2" />
                                                <p className="text-sm theme-text-secondary">
                                                    Click to upload images (Max 3 files, 5MB each)
                                                </p>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                            </div>

                                            {newReport.images.length > 0 && (
                                                <div className="grid grid-cols-3 gap-3">
                                                    {newReport.images.map((image, index) => (
                                                        <div key={index} className="relative">
                                                            <img
                                                                src={URL.createObjectURL(image)}
                                                                alt={`Upload ${index + 1}`}
                                                                className="w-full h-20 object-cover rounded-lg"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                            >
                                                                <FiX className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowNewReportModal(false)}
                                            className="flex-1 px-4 py-2 theme-btn-ghost rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting || !newReport.category || !newReport.subject || !newReport.description}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                                        >
                                            {submitting ? (
                                                <>
                                                    <LoadingSpinner size="sm" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <FiSend className="w-4 h-4" />
                                                    Submit Report
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
                            className="theme-modal-card rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">{getCategoryInfo(selectedReport.category).icon}</span>
                                            <h2 className="text-xl font-bold theme-heading-1">
                                                {selectedReport.subject}
                                            </h2>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm theme-text-muted">
                                            <span>ID: {selectedReport.reportId}</span>
                                            <span>Submitted: {formatDate(selectedReport.submittedAt)}</span>
                                            <span className={`font-medium ${priorityConfig[selectedReport.priority].color}`}>
                                                {priorityConfig[selectedReport.priority].label} Priority
                                            </span>
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
                                    {/* Status */}
                                    <div>
                                        <h3 className="text-sm font-medium theme-text-secondary mb-2">
                                            Status
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            {React.createElement(statusConfig[selectedReport.status].icon, {
                                                className: "w-4 h-4"
                                            })}
                                            <span className={`font-medium ${statusConfig[selectedReport.status].color}`}>
                                                {statusConfig[selectedReport.status].label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <h3 className="text-sm font-medium theme-text-secondary mb-2">
                                            Description
                                        </h3>
                                        <p className="theme-text whitespace-pre-wrap">
                                            {selectedReport.description}
                                        </p>
                                    </div>

                                    {/* Images */}
                                    {selectedReport.images && selectedReport.images.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium theme-text-secondary mb-2">
                                                Attachments ({selectedReport.images.length})
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {selectedReport.images.map((image, index) => (
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
                                    {selectedReport.resolution && selectedReport.resolution.resolutionNote && (
                                        <div>
                                            <h3 className="text-sm font-medium theme-text-secondary mb-2">
                                                Resolution
                                            </h3>
                                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                                <p className="text-green-800 dark:text-green-200">
                                                    {selectedReport.resolution.resolutionNote}
                                                </p>
                                                {selectedReport.resolution.resolvedAt && (
                                                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                                                        Resolved on {formatDate(selectedReport.resolution.resolvedAt)}
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
                                    {selectedReport.status !== 'closed' && selectedReport.status !== 'resolved' && (
                                        <button
                                            onClick={() => {
                                                // TODO: Implement edit functionality
                                                showToast('Edit functionality coming soon', 'info');
                                            }}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                            Edit Report
                                        </button>
                                    )}
                                </div>
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
    );
};

export default Reports;
