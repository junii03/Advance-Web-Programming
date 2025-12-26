import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Shield, Clock, CheckCircle, XCircle, Plus, Eye, EyeOff, Settings } from 'lucide-react';
import dashboardService from '../../services/dashboardService';

const ViewAllCards = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCardDetails, setShowCardDetails] = useState(false);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    const fetchCards = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/auth/login');
                return;
            }

            const response = await dashboardService.getCards();
            setCards(response.data || []);
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
        fetchCards();
    }, [fetchCards]);

    const getCardTypeIcon = (type) => {
        switch (type) {
            case 'credit':
                return <Shield className="w-6 h-6 text-purple-600" />;
            case 'debit':
                return <CreditCard className="w-6 h-6 text-blue-600" />;
            default:
                return <CreditCard className="w-6 h-6 text-gray-600" />;
        }
    };

    const getCardStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'text-green-600';
            case 'blocked':
                return 'text-red-600';
            case 'pending':
                return 'text-yellow-600';
            case 'expired':
                return 'text-gray-600';
            default:
                return 'text-gray-600';
        }
    };

    const getCardStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'blocked':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-600" />;
            case 'expired':
                return <XCircle className="w-5 h-5 text-gray-600" />;
            default:
                return <Clock className="w-5 h-5 text-gray-600" />;
        }
    };

    const getCardGradient = (type) => {
        switch (type) {
            case 'credit':
                return 'bg-gradient-to-br from-purple-600 to-purple-800';
            case 'debit':
                return 'bg-gradient-to-br from-blue-600 to-blue-800';
            default:
                return 'bg-gradient-to-br from-gray-600 to-gray-800';
        }
    };

    const formatExpiryDate = (date) => {
        const expiryDate = new Date(date);
        return expiryDate.toLocaleDateString('en-US', {
            month: '2-digit',
            year: '2-digit'
        });
    };

    const handleToggleCardDetails = () => {
        setShowCardDetails(!showCardDetails);
    };

    const handleCardAction = (cardId, action) => {
        // Navigate to card management page or handle card actions
        console.log(`Card ${cardId} action: ${action}`);
    };

    const filteredCards = cards.filter(card => {
        if (filter === 'all') return true;
        return card.cardStatus === filter || card.cardType === filter;
    });

    const cardSummary = {
        total: cards.length,
        active: cards.filter(card => card.cardStatus === 'active').length,
        pending: cards.filter(card => card.cardStatus === 'pending').length,
        blocked: cards.filter(card => card.cardStatus === 'blocked').length,
        credit: cards.filter(card => card.cardType === 'credit').length,
        debit: cards.filter(card => card.cardType === 'debit').length
    };

    if (loading) {
        return (
            <div className="min-h-screen theme-container">
                <div className="max-w-7xl mx-auto p-4">
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="theme-text-secondary mt-2">Loading cards...</p>
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
                            onClick={fetchCards}
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
            {/* Header */}
            <div className="theme-card-elevated border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/customer/dashboard')}
                            className="p-2 rounded-lg theme-card hover:theme-card-hover transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 theme-text" />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold theme-heading-1">My Cards</h1>
                            <p className="text-sm theme-text-secondary">Manage your debit and credit cards</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                    <div className="theme-card-elevated rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold theme-accent">{cardSummary.total}</div>
                        <div className="text-sm theme-text-muted">Total Cards</div>
                    </div>
                    <div className="theme-card-elevated rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{cardSummary.active}</div>
                        <div className="text-sm theme-text-muted">Active</div>
                    </div>
                    <div className="theme-card-elevated rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">{cardSummary.pending}</div>
                        <div className="text-sm theme-text-muted">Pending</div>
                    </div>
                    <div className="theme-card-elevated rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{cardSummary.blocked}</div>
                        <div className="text-sm theme-text-muted">Blocked</div>
                    </div>
                    <div className="theme-card-elevated rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{cardSummary.credit}</div>
                        <div className="text-sm theme-text-muted">Credit Cards</div>
                    </div>
                    <div className="theme-card-elevated rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{cardSummary.debit}</div>
                        <div className="text-sm theme-text-muted">Debit Cards</div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: 'all', label: 'All Cards' },
                            { value: 'active', label: 'Active' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'blocked', label: 'Blocked' },
                            { value: 'credit', label: 'Credit Cards' },
                            { value: 'debit', label: 'Debit Cards' }
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

                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={handleToggleCardDetails}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 theme-btn-secondary rounded-lg text-sm font-medium"
                        >
                            {showCardDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {showCardDetails ? 'Hide' : 'Show'} Details
                        </button>
                        <button
                            onClick={() => navigate('/customer/cards/request')}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Request New Card
                        </button>
                    </div>
                </div>

                {/* Cards Grid */}
                {filteredCards.length === 0 ? (
                    <div className="theme-card rounded-lg p-6 sm:p-8 text-center">
                        <CreditCard className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold theme-text mb-2">No Cards Found</h3>
                        <p className="theme-text-secondary mb-4 text-sm sm:text-base">
                            {filter === 'all'
                                ? "You don't have any cards yet."
                                : `No ${filter} cards found.`}
                        </p>
                        <button
                            onClick={() => navigate('/customer/cards/request')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                            Request Your First Card
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredCards.map((card) => (
                            <div key={card._id} className="theme-card-elevated rounded-lg overflow-hidden">
                                {/* Card Visual */}
                                <div className={`${getCardGradient(card.cardType)} p-6 text-white relative overflow-hidden`}>
                                    {/* Background Pattern */}
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute top-2 right-2 w-16 h-16 rounded-full border border-white/20"></div>
                                        <div className="absolute bottom-2 left-2 w-12 h-12 rounded-full border border-white/20"></div>
                                    </div>

                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-2">
                                                {getCardTypeIcon(card.cardType)}
                                                <span className="text-sm font-medium uppercase tracking-wider">
                                                    {card.cardType} Card
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                {getCardStatusIcon(card.cardStatus)}
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="text-xl font-mono tracking-wider">
                                                {showCardDetails ? card.cardNumber : card.maskedCardNumber}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-xs opacity-75">CARDHOLDER NAME</div>
                                                <div className="text-sm font-medium">
                                                    {card.cardName}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs opacity-75">EXPIRES</div>
                                                <div className="text-sm font-medium">
                                                    {formatExpiryDate(card.expiryDate)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Details */}
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="theme-text-muted text-sm">Status:</span>
                                        <div className="flex items-center space-x-2">
                                            {getCardStatusIcon(card.cardStatus)}
                                            <span className={`font-medium text-sm ${getCardStatusColor(card.cardStatus)}`}>
                                                {card.cardStatus.charAt(0).toUpperCase() + card.cardStatus.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="theme-text-muted text-sm">Account:</span>
                                        <span className="theme-text font-medium text-sm">
                                            {card.account ? `*${card.account.accountNumber.slice(-4)}` : 'N/A'}
                                        </span>
                                    </div>

                                    {card.cardType === 'credit' && (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <span className="theme-text-muted text-sm">Credit Limit:</span>
                                                <span className="theme-text font-medium text-sm">
                                                    PKR {card.cardLimit?.toLocaleString() || '0'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="theme-text-muted text-sm">Available:</span>
                                                <span className="text-green-600 font-medium text-sm">
                                                    PKR {card.availableLimit?.toLocaleString() || '0'}
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    {card.isContactless && (
                                        <div className="flex items-center text-xs theme-text-muted">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                            Contactless payments enabled
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => handleCardAction(card._id, 'manage')}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium theme-btn-secondary rounded-lg"
                                        >
                                            <Settings className="w-3 h-3" />
                                            Manage
                                        </button>
                                        {card.cardStatus === 'active' && (
                                            <button
                                                onClick={() => handleCardAction(card._id, 'block')}
                                                className="flex-1 px-3 py-2 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
                                            >
                                                Block Card
                                            </button>
                                        )}
                                        {card.cardStatus === 'blocked' && (
                                            <button
                                                onClick={() => handleCardAction(card._id, 'unblock')}
                                                className="flex-1 px-3 py-2 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700"
                                            >
                                                Unblock
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewAllCards;
