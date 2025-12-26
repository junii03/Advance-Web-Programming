/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    CheckCircle,
    XCircle,
    DollarSign,
    CreditCard,
    User,
    Calendar,
    MessageSquare,
    Eye,
    ChevronRight,
    AlertTriangle,
    Check,
    X,
    Filter
} from 'lucide-react';

const PendingApprovals = ({ approvals, onApprovalAction, onViewAll }) => {
    const [selectedItem, setSelectedItem] = useState(null);
    const [actionType, setActionType] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [bulkActionMode, setBulkActionMode] = useState(false);
    const [priorityFilter, setPriorityFilter] = useState('all');

    if (!approvals) return null;

    const { pendingLoans = [], pendingCards = [], counts = {} } = approvals;

    // Add priority scoring for loans and cards
    const addPriorityScore = (items, type) => {
        return items.map(item => {
            let priority = 'low';
            if (type === 'loan') {
                if (item.amount > 1000000) priority = 'high';
                else if (item.amount > 500000) priority = 'medium';
            } else if (type === 'card') {
                if (item.cardType === 'credit') priority = 'medium';
                if (new Date() - new Date(item.createdAt) > 7 * 24 * 60 * 60 * 1000) priority = 'high';
            }
            return { ...item, priority };
        });
    };

    const prioritizedLoans = addPriorityScore(pendingLoans, 'loan');
    const prioritizedCards = addPriorityScore(pendingCards, 'card');

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-orange-600 bg-orange-100';
            default: return 'text-blue-600 bg-blue-100';
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high': return AlertTriangle;
            case 'medium': return Clock;
            default: return CheckCircle;
        }
    };

    const handleApprovalAction = async (type, id, action) => {
        setLoading(true);
        try {
            await onApprovalAction(type, id, action, reason);
            setSelectedItem(null);
            setReason('');
        } catch (error) {
            console.error('Approval action failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedItems.length === 0) return;

        setLoading(true);
        try {
            await Promise.all(
                selectedItems.map(({ type, id }) =>
                    onApprovalAction(type, id, action, reason)
                )
            );
            setSelectedItems([]);
            setBulkActionMode(false);
            setReason('');
        } catch (error) {
            console.error('Bulk action failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const ApprovalModal = ({ item, type, onClose }) => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 theme-modal-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="theme-card-elevated rounded-lg p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold theme-heading-1 mb-4">
                    {type === 'loan' ? 'Loan Application' : 'Card Request'} Review
                </h3>

                <div className="space-y-3 mb-6">
                    {type === 'loan' ? (
                        <>
                            <div className="flex justify-between">
                                <span className="theme-text-secondary">Loan Type:</span>
                                <span className="theme-text font-medium">{item.loanType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="theme-text-secondary">Amount:</span>
                                <span className="theme-text font-medium">PKR {item.amount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="theme-text-secondary">Tenure:</span>
                                <span className="theme-text font-medium">{item.tenure} months</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="theme-text-secondary">Purpose:</span>
                                <span className="theme-text font-medium">{item.purpose}</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between">
                                <span className="theme-text-secondary">Card Type:</span>
                                <span className="theme-text font-medium">{item.cardType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="theme-text-secondary">User:</span>
                                <span className="theme-text font-medium">{item.userName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="theme-text-secondary">Email:</span>
                                <span className="theme-text font-medium">{item.userEmail}</span>
                            </div>
                        </>
                    )}
                    <div className="flex justify-between">
                        <span className="theme-text-secondary">Date:</span>
                        <span className="theme-text font-medium">
                            {new Date(item.createdAt || item.applicationDate).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {actionType === 'reject' && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium theme-text-secondary mb-2">
                            Rejection Reason
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full p-3 theme-input rounded-lg"
                            rows="3"
                            placeholder="Please provide a reason for rejection..."
                            required
                        />
                    </div>
                )}

                <div className="flex space-x-3">
                    <button
                        onClick={() => {
                            setActionType('approve');
                            handleApprovalAction(type, item._id, 'approve');
                        }}
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                    </button>
                    <button
                        onClick={() => {
                            if (actionType === 'reject' && reason.trim()) {
                                handleApprovalAction(type, item._id, 'reject');
                            } else {
                                setActionType('reject');
                            }
                        }}
                        disabled={loading}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                        <XCircle className="w-4 h-4" />
                        <span>{actionType === 'reject' ? 'Confirm Reject' : 'Reject'}</span>
                    </button>
                </div>

                {actionType === '' && (
                    <button
                        onClick={onClose}
                        className="w-full mt-3 theme-btn-secondary px-4 py-2 rounded-lg"
                    >
                        Cancel
                    </button>
                )}
            </motion.div>
        </motion.div>
    );

    return (
        <div className="theme-card-elevated rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 theme-accent" />
                    <h2 className="text-lg font-semibold theme-heading-1">Pending Approvals</h2>
                </div>
                <div className="flex items-center space-x-2">
                    {/* Priority Filter */}
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="text-xs px-2 py-1 rounded theme-card border theme-border"
                    >
                        <option value="all">All Priorities</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                    </select>

                    {/* Bulk Actions Toggle */}
                    <button
                        onClick={() => {
                            setBulkActionMode(!bulkActionMode);
                            setSelectedItems([]);
                        }}
                        className={`text-xs px-3 py-1 rounded transition-colors ${bulkActionMode
                            ? 'bg-blue-100 text-blue-800'
                            : 'theme-card hover:theme-card-hover'
                            }`}
                    >
                        {bulkActionMode ? 'Cancel Bulk' : 'Bulk Actions'}
                    </button>

                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                        {counts.loans + counts.cards} Total
                    </span>
                </div>
            </div>

            {/* Bulk Action Controls */}
            {bulkActionMode && selectedItems.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">
                            {selectedItems.length} items selected
                        </span>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleBulkAction('approve')}
                                disabled={loading}
                                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Approve All'}
                            </button>
                            <button
                                onClick={() => handleBulkAction('reject')}
                                disabled={loading}
                                className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                            >
                                Reject All
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="space-y-4">
                {/* Enhanced Loan Approvals */}
                {prioritizedLoans.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium theme-text flex items-center space-x-2">
                                <DollarSign className="w-4 h-4" />
                                <span>Loan Applications ({counts.loans})</span>
                            </h3>
                            <button
                                onClick={() => onViewAll('loan')}
                                className="text-sm theme-accent hover:underline flex items-center space-x-1"
                            >
                                <span>View All</span>
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {prioritizedLoans
                                .filter(loan => priorityFilter === 'all' || loan.priority === priorityFilter)
                                .slice(0, 3)
                                .map((loan) => {
                                    const PriorityIcon = getPriorityIcon(loan.priority);
                                    return (
                                        <motion.div
                                            key={loan._id}
                                            whileHover={{ scale: 1.01 }}
                                            className="flex items-center justify-between p-3 theme-card rounded-lg hover:theme-card-hover cursor-pointer"
                                            onClick={() => !bulkActionMode && setSelectedItem({ item: loan, type: 'loan' })}
                                        >
                                            <div className="flex items-center space-x-3">
                                                {bulkActionMode && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.some(item => item.id === loan._id)}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            if (e.target.checked) {
                                                                setSelectedItems([...selectedItems, { type: 'loan', id: loan._id }]);
                                                            } else {
                                                                setSelectedItems(selectedItems.filter(item => item.id !== loan._id));
                                                            }
                                                        }}
                                                        className="rounded theme-accent"
                                                    />
                                                )}
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <DollarSign className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <p className="font-medium theme-text">{loan.loanType} Loan</p>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getPriorityColor(loan.priority)}`}>
                                                            <PriorityIcon className="w-3 h-3 mr-1" />
                                                            {loan.priority} priority
                                                        </span>
                                                    </div>
                                                    <p className="text-sm theme-text-secondary">
                                                        PKR {loan.amount?.toLocaleString()} • {loan.tenure} months
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm theme-text-muted">
                                                    {new Date(loan.applicationDate).toLocaleDateString()}
                                                </p>
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                                                    Pending
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                        </div>
                    </div>
                )}

                {/* Enhanced Card Approvals */}
                {prioritizedCards.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium theme-text flex items-center space-x-2">
                                <CreditCard className="w-4 h-4" />
                                <span>Card Requests ({counts.cards})</span>
                            </h3>
                            <button
                                onClick={() => onViewAll('card')}
                                className="text-sm theme-accent hover:underline flex items-center space-x-1"
                            >
                                <span>View All</span>
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {prioritizedCards
                                .filter(card => priorityFilter === 'all' || card.priority === priorityFilter)
                                .slice(0, 3)
                                .map((card) => {
                                    const PriorityIcon = getPriorityIcon(card.priority);
                                    return (
                                        <motion.div
                                            key={card._id}
                                            whileHover={{ scale: 1.01 }}
                                            className="flex items-center justify-between p-3 theme-card rounded-lg hover:theme-card-hover cursor-pointer"
                                            onClick={() => !bulkActionMode && setSelectedItem({ item: card, type: 'card' })}
                                        >
                                            <div className="flex items-center space-x-3">
                                                {bulkActionMode && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.some(item => item.id === card._id)}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            if (e.target.checked) {
                                                                setSelectedItems([...selectedItems, { type: 'card', id: card._id }]);
                                                            } else {
                                                                setSelectedItems(selectedItems.filter(item => item.id !== card._id));
                                                            }
                                                        }}
                                                        className="rounded theme-accent"
                                                    />
                                                )}
                                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <CreditCard className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <p className="font-medium theme-text">{card.cardType} Card</p>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getPriorityColor(card.priority)}`}>
                                                            <PriorityIcon className="w-3 h-3 mr-1" />
                                                            {card.priority}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm theme-text-secondary">
                                                        {card.userName} • {card.userEmail}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm theme-text-muted">
                                                    {new Date(card.createdAt).toLocaleDateString()}
                                                </p>
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                                                    Pending
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {pendingLoans.length === 0 && pendingCards.length === 0 && (
                    <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 theme-text-muted mx-auto mb-3" />
                        <p className="theme-text-secondary">No pending approvals</p>
                        <p className="text-sm theme-text-muted">All applications are up to date</p>
                    </div>
                )}
            </div>

            {/* Approval Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <ApprovalModal
                        item={selectedItem.item}
                        type={selectedItem.type}
                        onClose={() => {
                            setSelectedItem(null);
                            setActionType('');
                            setReason('');
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default PendingApprovals;
