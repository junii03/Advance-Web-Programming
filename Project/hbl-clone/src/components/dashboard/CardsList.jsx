import React from 'react';
import { CreditCard, Eye, EyeOff, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';

const CardsList = ({ cards, showCardDetails, onToggleCardDetails, onViewAll }) => {
    const getCardTypeIcon = (type) => {
        switch (type) {
            case 'credit':
                return <Shield className="w-5 h-5 text-purple-600" />;
            case 'debit':
                return <CreditCard className="w-5 h-5 text-blue-600" />;
            default:
                return <CreditCard className="w-5 h-5 text-gray-600" />;
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
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'blocked':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'expired':
                return <XCircle className="w-4 h-4 text-gray-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    const formatExpiryDate = (date) => {
        const expiryDate = new Date(date);
        return expiryDate.toLocaleDateString('en-US', {
            month: '2-digit',
            year: '2-digit'
        });
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

    if (!cards || cards.length === 0) {
        return null;
    }

    return (
        <div className="theme-card-elevated rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold theme-heading-1">My Cards</h3>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onToggleCardDetails}
                        className="p-2 rounded-lg theme-card hover:theme-card-hover text-sm"
                        title={showCardDetails ? "Hide card details" : "Show card details"}
                    >
                        {showCardDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {onViewAll && (
                        <button
                            onClick={onViewAll}
                            className="text-sm theme-accent hover:underline"
                        >
                            View All
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {cards.slice(0, 3).map((card) => (
                    <div key={card._id} className="space-y-3">
                        {/* Card Visual */}
                        <div className={`${getCardGradient(card.cardType)} rounded-lg p-4 text-white relative overflow-hidden`}>
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-2 right-2 w-16 h-16 rounded-full border border-white/20"></div>
                                <div className="absolute bottom-2 left-2 w-12 h-12 rounded-full border border-white/20"></div>
                            </div>

                            <div className="relative">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        {getCardTypeIcon(card.cardType)}
                                        <span className="text-sm font-medium uppercase tracking-wider">
                                            {card.cardType} Card
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        {getCardStatusIcon(card.cardStatus)}
                                        <span className="text-xs uppercase tracking-wider">
                                            {card.cardStatus}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="text-lg font-mono tracking-wider">
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
                        <div className="theme-card rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="theme-text-muted">Account:</span>
                                <span className="theme-text font-medium">
                                    {card.account ? `*${card.account.accountNumber.slice(-4)}` : 'N/A'}
                                </span>
                            </div>

                            {card.cardType === 'credit' && (
                                <>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="theme-text-muted">Credit Limit:</span>
                                        <span className="theme-text font-medium">
                                            PKR {card.cardLimit?.toLocaleString() || '0'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="theme-text-muted">Available Limit:</span>
                                        <span className="theme-text font-medium text-green-600">
                                            PKR {card.availableLimit?.toLocaleString() || '0'}
                                        </span>
                                    </div>
                                </>
                            )}

                            <div className="flex items-center justify-between text-sm">
                                <span className="theme-text-muted">Status:</span>
                                <span className={`font-medium ${getCardStatusColor(card.cardStatus)}`}>
                                    {card.cardStatus.charAt(0).toUpperCase() + card.cardStatus.slice(1)}
                                </span>
                            </div>

                            {card.isContactless && (
                                <div className="flex items-center text-xs theme-text-muted">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    Contactless payments enabled
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CardsList;
