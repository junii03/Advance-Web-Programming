import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Shield, Clock, CheckCircle } from 'lucide-react';
import dashboardService from '../../services/dashboardService';

const RequestCard = () => {
    const [accounts, setAccounts] = useState([]);
    const [form, setForm] = useState({
        accountId: '',
        cardType: '',
        cardName: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [accountsLoading, setAccountsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setAccountsLoading(true);
            const response = await dashboardService.getAccounts();
            setAccounts(response.data || []);
        } catch (err) {
            setError('Failed to load accounts. Please try again.');
            console.error('Error fetching accounts:', err);
        } finally {
            setAccountsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
        setError(''); // Clear error when user makes changes
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate form
            if (!form.accountId || !form.cardType) {
                throw new Error('Please select an account and card type');
            }

            const response = await dashboardService.requestCard({
                accountId: form.accountId,
                cardType: form.cardType,
                cardName: form.cardName || undefined
            });

            setSuccess(true);
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
                navigate('/customer/dashboard');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to submit card request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getAccountTypeColor = (type) => {
        const colors = {
            savings: 'bg-blue-500',
            current: 'bg-green-500',
            fixed_deposit: 'bg-purple-500',
            islamic_savings: 'bg-teal-500',
            salary: 'bg-orange-500'
        };
        return colors[type] || 'bg-gray-500';
    };

    const cardTypes = [
        {
            value: 'debit',
            name: 'Debit Card',
            description: 'Access your account funds directly',
            features: ['ATM withdrawals', 'Online payments', 'POS transactions', 'No credit limit'],
            icon: <CreditCard className="w-6 h-6" />
        },
        {
            value: 'credit',
            name: 'Credit Card',
            description: 'Flexible credit facility with rewards',
            features: ['Credit facility', 'Reward points', 'Cashback offers', 'International usage'],
            icon: <Shield className="w-6 h-6" />
        }
    ];

    if (success) {
        return (
            <div className="min-h-screen theme-container">
                <div className="max-w-2xl mx-auto p-4 pt-8">
                    <div className="theme-card-elevated rounded-lg p-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold theme-heading-1 mb-4">
                            Card Request Submitted Successfully!
                        </h2>
                        <p className="theme-text-secondary text-lg mb-6">
                            Your {form.cardType} card request has been submitted and is being processed.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-center space-x-2 text-blue-800">
                                <Clock className="w-5 h-5" />
                                <span className="font-medium">Processing Time: 5-7 business days</span>
                            </div>
                        </div>
                        <p className="text-sm theme-text-secondary mb-6">
                            You will receive notifications about your card status. Once approved, your card will be delivered to your registered address.
                        </p>
                        <button
                            onClick={() => navigate('/customer/dashboard')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Back to Dashboard
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
                            <h1 className="text-xl font-bold theme-heading-1">Request New Card</h1>
                            <p className="text-sm theme-text-secondary">Apply for a new debit or credit card</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Account Selection */}
                    <div className="theme-card-elevated rounded-lg p-6">
                        <h2 className="text-lg font-semibold theme-heading-1 mb-4">Select Account</h2>
                        <p className="theme-text-secondary text-sm mb-4">
                            Choose the account you want to link with your new card
                        </p>

                        {accountsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                                    </div>
                                ))}
                            </div>
                        ) : accounts.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="theme-text-secondary">No accounts found. Please create an account first.</p>
                                <button
                                    type="button"
                                    onClick={() => navigate('/customer/accounts/new')}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Create Account
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {accounts.map((account) => (
                                    <label
                                        key={account._id}
                                        className={`block p-4 rounded-lg border-2 cursor-pointer transition-all
                                            ${form.accountId === account._id
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="accountId"
                                            value={account._id}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-3 h-3 rounded-full ${getAccountTypeColor(account.accountType)}`}></div>
                                                <div>
                                                    <div className="font-medium theme-text">{account.accountTitle}</div>
                                                    <div className="text-sm theme-text-secondary">
                                                        {account.accountNumber} • {account.accountType.replace('_', ' ').toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold theme-text">{account.formattedBalance}</div>
                                                <div className="text-sm theme-text-secondary">Available</div>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Card Type Selection */}
                    <div className="theme-card-elevated rounded-lg p-6">
                        <h2 className="text-lg font-semibold theme-heading-1 mb-4">Select Card Type</h2>
                        <p className="theme-text-secondary text-sm mb-6">
                            Choose the type of card that best suits your needs
                        </p>

                        <div className="grid md:grid-cols-2 gap-4">
                            {cardTypes.map((cardType) => (
                                <label
                                    key={cardType.value}
                                    className={`block p-6 rounded-lg border-2 cursor-pointer transition-all
                                        ${form.cardType === cardType.value
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="cardType"
                                        value={cardType.value}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className="flex items-start space-x-3">
                                        <div className="theme-accent mt-1">
                                            {cardType.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold theme-heading-2 mb-2">{cardType.name}</h3>
                                            <p className="theme-text-secondary text-sm mb-3">{cardType.description}</p>
                                            <ul className="space-y-1">
                                                {cardType.features.map((feature, index) => (
                                                    <li key={index} className="flex items-center space-x-2">
                                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                        <span className="text-sm theme-text-secondary">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Card Customization */}
                    <div className="theme-card-elevated rounded-lg p-6">
                        <h2 className="text-lg font-semibold theme-heading-1 mb-4">Card Customization</h2>
                        <p className="theme-text-secondary text-sm mb-4">
                            Customize your card details (optional)
                        </p>

                        <div>
                            <label className="block text-sm font-medium theme-text mb-2">
                                Card Holder Name (Optional)
                            </label>
                            <input
                                type="text"
                                name="cardName"
                                value={form.cardName}
                                onChange={handleChange}
                                placeholder="Enter custom name for the card"
                                className="w-full p-3 border theme-border rounded-lg theme-bg-secondary theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                                maxLength={25}
                            />
                            <p className="text-xs theme-text-secondary mt-1">
                                Leave empty to use your registered name. Maximum 25 characters.
                            </p>
                        </div>
                    </div>

                    {/* Important Information */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Important Information</h3>
                        <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                            <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Processing time is typically 5-7 business days</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Your card will be delivered to your registered address</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>You will receive SMS and email notifications about your card status</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Annual fees and charges apply as per the card terms and conditions</span>
                            </li>
                        </ul>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/customer/dashboard')}
                            className="px-6 py-3 border theme-border rounded-lg theme-text hover:theme-card-hover transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !form.accountId || !form.cardType}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {loading ? 'Submitting Request...' : 'Submit Card Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestCard;
