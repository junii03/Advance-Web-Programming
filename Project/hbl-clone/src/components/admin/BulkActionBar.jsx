/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, AlertTriangle } from 'lucide-react';

const BulkActionBar = ({ selectedCount, onApprove, onReject, onCancel }) => {
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleBulkReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        setLoading(true);
        try {
            await onReject(rejectionReason);
            setShowRejectModal(false);
            setRejectionReason('');
        } catch (error) {
            console.error('Bulk rejection failed:', error);
            alert('Bulk rejection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkApprove = async () => {
        if (!confirm(`Are you sure you want to approve ${selectedCount} loan(s)? This action cannot be undone.`)) {
            return;
        }

        setLoading(true);
        try {
            await onApprove();
        } catch (error) {
            console.error('Bulk approval failed:', error);
            alert('Bulk approval failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                            <Check className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium text-blue-900">
                                {selectedCount} loan{selectedCount > 1 ? 's' : ''} selected
                            </p>
                            <p className="text-sm text-blue-700">
                                Choose an action to apply to all selected loans
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={handleBulkApprove}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium text-sm"
                        >
                            <Check className="w-4 h-4" />
                            {loading ? 'Processing...' : `Approve All (${selectedCount})`}
                        </button>

                        <button
                            onClick={() => setShowRejectModal(true)}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium text-sm"
                        >
                            <X className="w-4 h-4" />
                            Reject All
                        </button>

                        <button
                            onClick={onCancel}
                            className="px-4 py-2 theme-btn-secondary rounded-lg text-sm font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Bulk Rejection Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="theme-card-elevated rounded-lg max-w-md w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold theme-heading-1">
                                    Reject {selectedCount} Loan{selectedCount > 1 ? 's' : ''}
                                </h3>
                                <p className="text-sm theme-text-secondary">
                                    This action cannot be undone
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium theme-text-secondary mb-2">
                                Rejection Reason *
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Please provide a detailed reason for rejecting these loan applications..."
                                className="w-full px-3 py-2 theme-input rounded-lg resize-none"
                                rows={4}
                                required
                            />
                            <p className="text-xs theme-text-muted mt-1">
                                This reason will be applied to all selected loans
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleBulkReject}
                                disabled={loading || !rejectionReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                            >
                                {loading ? 'Processing...' : `Reject ${selectedCount} Loan${selectedCount > 1 ? 's' : ''}`}
                            </button>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                }}
                                disabled={loading}
                                className="px-4 py-2 theme-btn-secondary rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default BulkActionBar;
