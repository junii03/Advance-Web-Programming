import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCw,
    User,
    Building2,
    CreditCard,
    AlertCircle,
    CheckCircle,
    Loader2,
    Eye,
    EyeOff,
    Calculator,
    Info
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';

const TransferMoney = () => {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [, setBeneficiaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [transactionData, setTransactionData] = useState(null);
    const [step, setStep] = useState(1); // 1: Form, 2: Confirmation, 3: Success

    const [form, setForm] = useState({
        transferType: 'own', // 'own' or 'other'
        fromAccountId: '',
        toAccountId: '',
        toAccountNumber: '',
        toAccountTitle: '',
        amount: '',
        description: '',
        channel: 'online'
    });

    const [showBalance, setShowBalance] = useState(true);
    const [selectedFromAccount, setSelectedFromAccount] = useState(null);
    const [selectedToAccount, setSelectedToAccount] = useState(null);
    const [estimatedFee, setEstimatedFee] = useState(0);
    const [accountLookup, setAccountLookup] = useState({
        loading: false,
        verified: false,
        accountInfo: null,
        error: ''
    });

    // Fetch initial data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/auth/login');
                return;
            }

            const [accountsResponse, beneficiariesResponse] = await Promise.all([
                dashboardService.getAccounts(),
                dashboardService.getBeneficiaries().catch(() => ({ data: [] }))
            ]);

            setAccounts(accountsResponse.data || []);
            setBeneficiaries(beneficiariesResponse.data || []);

            // Auto-select first active account
            const activeAccounts = accountsResponse.data?.filter(acc => acc.status === 'active') || [];
            if (activeAccounts.length > 0) {
                setForm(prev => ({ ...prev, fromAccountId: activeAccounts[0]._id }));
                setSelectedFromAccount(activeAccounts[0]);
            }
        } catch (err) {
            setError(err.message);
            if (err.message.includes('token') || err.message.includes('401')) {
                localStorage.removeItem('token');
                navigate('/auth/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Update estimated fee when amount or transfer type changes
    useEffect(() => {
        if (form.transferType === 'other' && form.amount) {
            setEstimatedFee(50); // External transfer fee from backend
        } else {
            setEstimatedFee(0);
        }
    }, [form.transferType, form.amount]);

    // Account lookup when account number changes
    useEffect(() => {
        const lookupAccount = async () => {
            if (form.transferType === 'other' && form.toAccountNumber && form.toAccountNumber.length >= 10) {
                setAccountLookup(prev => ({ ...prev, loading: true, error: '' }));

                try {
                    const response = await dashboardService.lookupAccount(form.toAccountNumber);
                    setAccountLookup({
                        loading: false,
                        verified: true,
                        accountInfo: response.data,
                        error: ''
                    });

                    // Auto-fill account title if it matches
                    if (!form.toAccountTitle) {
                        handleInputChange('toAccountTitle', response.data.accountTitle);
                    }
                } catch (error) {
                    setAccountLookup({
                        loading: false,
                        verified: false,
                        accountInfo: null,
                        error: error.message || 'Account not found'
                    });
                }
            } else {
                setAccountLookup({
                    loading: false,
                    verified: false,
                    accountInfo: null,
                    error: ''
                });
            }
        };

        const timeoutId = setTimeout(lookupAccount, 500); // Debounce API calls
        return () => clearTimeout(timeoutId);
    }, [form.toAccountNumber, form.transferType]);

    const handleInputChange = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setError('');

        // Handle account selection
        if (name === 'fromAccountId') {
            const account = accounts.find(acc => acc._id === value);
            setSelectedFromAccount(account);
        }

        if (name === 'toAccountId' && form.transferType === 'own') {
            const account = accounts.find(acc => acc._id === value);
            setSelectedToAccount(account);
        }

        // Reset to account when transfer type changes
        if (name === 'transferType') {
            setForm(prev => ({
                ...prev,
                toAccountId: '',
                toAccountNumber: '',
                toAccountTitle: ''
            }));
            setSelectedToAccount(null);
        }
    };

    const validateForm = () => {
        if (!form.fromAccountId) {
            setError('Please select a source account');
            return false;
        }

        if (form.transferType === 'own' && !form.toAccountId) {
            setError('Please select a destination account');
            return false;
        }

        if (form.transferType === 'other') {
            if (!form.toAccountNumber) {
                setError('Please enter destination account number');
                return false;
            }
            if (!form.toAccountTitle) {
                setError('Please enter account title');
                return false;
            }
        }

        if (!form.amount || parseFloat(form.amount) <= 0) {
            setError('Please enter a valid amount');
            return false;
        }

        if (!form.description) {
            setError('Please enter a description');
            return false;
        }

        // Check if source and destination accounts are the same
        if (form.transferType === 'own' && form.fromAccountId === form.toAccountId) {
            setError('Source and destination accounts cannot be the same');
            return false;
        }

        // Check available balance
        if (selectedFromAccount) {
            const totalAmount = parseFloat(form.amount) + estimatedFee;
            if (totalAmount > selectedFromAccount.availableBalance) {
                setError('Insufficient balance including fees');
                return false;
            }

            // Check minimum balance constraint
            const remainingBalance = selectedFromAccount.balance - totalAmount;
            if (remainingBalance < selectedFromAccount.minimumBalance) {
                setError(`Transfer would violate minimum balance requirement of ${formatCurrency(selectedFromAccount.minimumBalance)}`);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setStep(2); // Move to confirmation step
    };

    const confirmTransfer = async () => {
        try {
            setSubmitting(true);
            setError('');

            const transactionPayload = {
                type: 'transfer',
                fromAccountId: form.fromAccountId,
                amount: parseFloat(form.amount),
                description: form.description,
                channel: form.channel
            };

            if (form.transferType === 'own') {
                transactionPayload.toAccountId = form.toAccountId;
            } else {
                // For external transfers, send thirdParty information
                transactionPayload.thirdParty = {
                    accountNumber: form.toAccountNumber,
                    accountTitle: form.toAccountTitle
                };
            }

            const response = await dashboardService.createTransaction(transactionPayload);
            setTransactionData(response.data);
            setSuccess(true);
            setStep(3);

        } catch (err) {
            console.error('Transaction error:', err);

            // Handle daily limit exceeded error specially
            if (err.response?.data?.code === 'DAILY_LIMIT_EXCEEDED') {
                const limitData = err.response.data.data;

                // Handle fixed deposit accounts differently
                if (limitData.accountType === 'fixed_deposit') {
                    setError(
                        'Fixed deposit accounts do not allow transactions. Please select a different account (Savings or Current) for transfers.'
                    );
                } else {
                    const formatCurrency = (amount) => new Intl.NumberFormat('en-PK', {
                        style: 'currency',
                        currency: 'PKR',
                        minimumFractionDigits: 0
                    }).format(amount);

                    setError(
                        `Daily transaction limit exceeded! You have used ${formatCurrency(limitData.dailyTotal)} of your ${formatCurrency(limitData.dailyLimit)} daily limit. ` +
                        `Remaining limit: ${formatCurrency(limitData.remainingLimit)}. ` +
                        `This transaction would exceed your limit by ${formatCurrency(limitData.exceedsBy)}. ` +
                        `Please try a smaller amount or wait until tomorrow.`
                    );
                }
            } else {
                // Handle other errors
                setError(err.response?.data?.error || err.message || 'Transaction failed. Please try again.');
            }

            setStep(1); // Go back to form
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleBackToForm = () => {
        setStep(1);
        setError('');
    };

    const handleNewTransfer = () => {
        setForm({
            transferType: 'own',
            fromAccountId: selectedFromAccount?._id || '',
            toAccountId: '',
            toAccountNumber: '',
            toAccountTitle: '',
            amount: '',
            description: '',
            channel: 'online'
        });
        setStep(1);
        setSuccess(false);
        setTransactionData(null);
        setError('');
    };

    const viewReceipt = async () => {
        if (transactionData) {
            try {
                await dashboardService.getTransactionReceipt(transactionData._id);
                // Navigate to receipt view or show receipt modal
                navigate(`/customer/transactions/${transactionData._id}/receipt`);
            } catch (error) {
                setError('Failed to load receipt');
                console.error('Receipt error:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen theme-container">
                <div className="max-w-4xl mx-auto p-4 pt-8">
                    <div className="theme-card rounded-lg p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="theme-text-secondary mt-4">Loading transfer page...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Success Step (Step 3)
    if (step === 3 && success) {
        return (
            <div className="min-h-screen theme-container">
                <div className="max-w-4xl mx-auto p-4 pt-8">
                    <div className="theme-card-elevated rounded-lg p-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold theme-heading-1 mb-4">
                            Transfer Successful!
                        </h2>
                        <p className="theme-text-secondary text-lg mb-6">
                            Your transfer of {formatCurrency(parseFloat(form.amount))} has been completed successfully.
                        </p>

                        {transactionData && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-center space-x-2 text-blue-800 mb-2">
                                    <Info className="w-5 h-5" />
                                    <span className="font-medium">Transaction Details</span>
                                </div>
                                <p className="text-blue-700">Transaction ID: {transactionData.transactionId}</p>
                                <p className="text-blue-700">Status: {transactionData.status}</p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={viewReceipt}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                View Receipt
                            </button>
                            <button
                                onClick={handleNewTransfer}
                                className="px-6 py-3 border theme-border rounded-lg theme-text hover:theme-card-hover transition-colors font-medium"
                            >
                                Make Another Transfer
                            </button>
                            <button
                                onClick={() => navigate('/customer/dashboard')}
                                className="px-6 py-3 border theme-border rounded-lg theme-text hover:theme-card-hover transition-colors font-medium"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Confirmation Step (Step 2)
    if (step === 2) {
        return (
            <div className="min-h-screen theme-container">
                <div className="max-w-4xl mx-auto p-4 pt-8">
                    <div className="theme-card-elevated rounded-lg p-8">
                        <h2 className="text-2xl font-bold theme-heading-1 mb-6 text-center">
                            Confirm Transfer
                        </h2>

                        <div className="space-y-6">
                            {/* Transfer Summary */}
                            <div className="theme-surface-elevated rounded-lg p-6 border theme-border">
                                <h3 className="font-semibold theme-heading-2 mb-4 flex items-center gap-2">
                                    <Info className="w-5 h-5 theme-accent" />
                                    Transfer Summary
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* From Account */}
                                    <div>
                                        <p className="theme-text-secondary font-medium mb-2">From Account</p>
                                        <div className="theme-card-elevated rounded-lg p-3 border theme-border">
                                            <p className="font-medium theme-text">{selectedFromAccount?.accountTitle}</p>
                                            <p className="text-sm theme-text-muted">{selectedFromAccount?.accountNumber}</p>
                                            <p className="text-sm theme-text-muted">Available: {selectedFromAccount?.formattedBalance}</p>
                                        </div>
                                    </div>

                                    {/* To Account */}
                                    <div>
                                        <p className="theme-text-secondary font-medium mb-2">To Account</p>
                                        <div className="theme-card-elevated rounded-lg p-3 border theme-border">
                                            {form.transferType === 'own' ? (
                                                <>
                                                    <p className="font-medium theme-text">{selectedToAccount?.accountTitle}</p>
                                                    <p className="text-sm theme-text-muted">{selectedToAccount?.accountNumber}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="font-medium theme-text">{form.toAccountTitle}</p>
                                                    <p className="text-sm theme-text-muted">{form.toAccountNumber}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Amount Details */}
                                <div className="mt-6 border-t theme-border pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="theme-text-secondary">Transfer Amount:</span>
                                        <span className="font-bold text-lg theme-text">{formatCurrency(parseFloat(form.amount))}</span>
                                    </div>
                                    {estimatedFee > 0 && (
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="theme-text-secondary">Transfer Fee:</span>
                                            <span className="font-medium theme-text">{formatCurrency(estimatedFee)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-lg font-bold border-t theme-border pt-2">
                                        <span className="theme-heading-2">Total Amount:</span>
                                        <span className="theme-heading-2">{formatCurrency(parseFloat(form.amount) + estimatedFee)}</span>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="theme-text-secondary font-medium">Description:</p>
                                    <p className="theme-text mt-1">{form.description}</p>
                                </div>
                            </div>

                            {error && (
                                <div className="theme-card-elevated p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                                    <div className="flex items-center space-x-2">
                                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={handleBackToForm}
                                    disabled={submitting}
                                    className="theme-btn-secondary px-8 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Back to Edit
                                </button>
                                <button
                                    onClick={confirmTransfer}
                                    disabled={submitting}
                                    className="theme-btn-primary px-8 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Confirm Transfer
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main Form (Step 1)
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
                            <h1 className="text-xl font-bold theme-heading-1">Transfer Money</h1>
                            <p className="text-sm theme-text-secondary">Send money to your accounts or others</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <p className="text-red-800 font-medium">{error}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Transfer Type Selection */}
                    <div className="theme-card-elevated rounded-lg p-6">
                        <h2 className="text-lg font-semibold theme-heading-1 mb-4">Transfer Type</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${form.transferType === 'own'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                }`}>
                                <input
                                    type="radio"
                                    name="transferType"
                                    value="own"
                                    checked={form.transferType === 'own'}
                                    onChange={(e) => handleInputChange('transferType', e.target.value)}
                                    className="sr-only"
                                />
                                <div className="flex items-center space-x-3">
                                    <RefreshCw className="w-6 h-6 text-blue-600" />
                                    <div>
                                        <div className="font-medium theme-text">Between My Accounts</div>
                                        <div className="text-sm theme-text-secondary">Transfer between your own accounts</div>
                                        <div className="text-xs text-green-600 mt-1">No fees</div>
                                    </div>
                                </div>
                            </label>

                            <label className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${form.transferType === 'other'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                }`}>
                                <input
                                    type="radio"
                                    name="transferType"
                                    value="other"
                                    checked={form.transferType === 'other'}
                                    onChange={(e) => handleInputChange('transferType', e.target.value)}
                                    className="sr-only"
                                />
                                <div className="flex items-center space-x-3">
                                    <ArrowUpRight className="w-6 h-6 text-orange-600" />
                                    <div>
                                        <div className="font-medium theme-text">To Other Account</div>
                                        <div className="text-sm theme-text-secondary">Transfer to another person's account</div>
                                        <div className="text-xs text-orange-600 mt-1">PKR 50 fee applies</div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* From Account Selection */}
                    <div className="theme-card-elevated rounded-lg p-6">
                        <h2 className="text-lg font-semibold theme-heading-1 mb-4 flex items-center gap-2">
                            <ArrowUpRight className="w-5 h-5 text-red-500" />
                            From Account
                        </h2>
                        <div className="space-y-3">
                            {accounts.filter(acc => acc.status === 'active').map((account) => (
                                <label
                                    key={account._id}
                                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${form.fromAccountId === account._id
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="fromAccountId"
                                        value={account._id}
                                        checked={form.fromAccountId === account._id}
                                        onChange={(e) => handleInputChange('fromAccountId', e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <CreditCard className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <div className="font-medium theme-text">{account.accountTitle}</div>
                                                <div className="text-sm theme-text-secondary">
                                                    {account.accountNumber} • {account.accountType.replace('_', ' ').toUpperCase()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold theme-text">
                                                {showBalance ? account.formattedBalance : '••••••'}
                                            </div>
                                            <div className="text-xs theme-text-secondary">Available Balance</div>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowBalance(!showBalance)}
                            className="mt-4 flex items-center gap-2 text-sm theme-accent hover:underline"
                        >
                            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {showBalance ? 'Hide' : 'Show'} Balance
                        </button>
                    </div>

                    {/* To Account Selection */}
                    <div className="theme-card-elevated rounded-lg p-6">
                        <h2 className="text-lg font-semibold theme-heading-1 mb-4 flex items-center gap-2">
                            <ArrowDownLeft className="w-5 h-5 text-green-500" />
                            To Account
                        </h2>

                        {form.transferType === 'own' ? (
                            <div className="space-y-3">
                                {accounts
                                    .filter(acc => acc.status === 'active' && acc._id !== form.fromAccountId)
                                    .map((account) => (
                                        <label
                                            key={account._id}
                                            className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${form.toAccountId === account._id
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="toAccountId"
                                                value={account._id}
                                                checked={form.toAccountId === account._id}
                                                onChange={(e) => handleInputChange('toAccountId', e.target.value)}
                                                className="sr-only"
                                            />
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <CreditCard className="w-5 h-5 text-green-600" />
                                                    <div>
                                                        <div className="font-medium theme-text">{account.accountTitle}</div>
                                                        <div className="text-sm theme-text-secondary">
                                                            {account.accountNumber} • {account.accountType.replace('_', ' ').toUpperCase()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold theme-text">
                                                        {showBalance ? account.formattedBalance : '••••••'}
                                                    </div>
                                                    <div className="text-xs theme-text-secondary">Current Balance</div>
                                                </div>
                                            </div>
                                        </label>
                                    ))}

                                {accounts.filter(acc => acc.status === 'active' && acc._id !== form.fromAccountId).length === 0 && (
                                    <div className="text-center py-8">
                                        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="theme-text-secondary">No other accounts available for transfer</p>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/customer/accounts/new')}
                                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                        >
                                            Open New Account
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium theme-text mb-2">
                                        Account Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={form.toAccountNumber}
                                            onChange={(e) => handleInputChange('toAccountNumber', e.target.value)}
                                            placeholder="Enter account number"
                                            className="w-full p-3 border theme-border rounded-lg theme-bg-secondary theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                        {accountLookup.loading && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                            </div>
                                        )}
                                        {accountLookup.verified && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            </div>
                                        )}
                                        {accountLookup.error && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Account verification status */}
                                    {accountLookup.verified && accountLookup.accountInfo && (
                                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <span className="text-sm font-medium text-green-800">Account Verified</span>
                                            </div>
                                            <div className="mt-1 text-sm text-green-700">
                                                <p>{accountLookup.accountInfo.accountTitle}</p>
                                                <p className="text-xs text-green-600">{accountLookup.accountInfo.accountType.replace('_', ' ').toUpperCase()} Account</p>
                                            </div>
                                        </div>
                                    )}

                                    {accountLookup.error && (
                                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <AlertCircle className="w-4 h-4 text-red-600" />
                                                <span className="text-sm font-medium text-red-800">Verification Failed</span>
                                            </div>
                                            <p className="mt-1 text-sm text-red-700">{accountLookup.error}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Amount and Description */}
                    <div className="theme-card-elevated rounded-lg p-6">
                        <h2 className="text-lg font-semibold theme-heading-1 mb-4 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-purple-500" />
                            Transfer Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium theme-text mb-2">
                                    Amount (PKR) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={form.amount}
                                    onChange={(e) => handleInputChange('amount', e.target.value)}
                                    placeholder="0.00"
                                    min="1"
                                    step="0.01"
                                    className="w-full p-3 border theme-border rounded-lg theme-bg-secondary theme-text focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium"
                                    required
                                />
                                {form.amount && (
                                    <div className="mt-2 space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="theme-text-secondary">Transfer Amount:</span>
                                            <span className="theme-text">{formatCurrency(parseFloat(form.amount) || 0)}</span>
                                        </div>
                                        {estimatedFee > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="theme-text-secondary">Transfer Fee:</span>
                                                <span className="theme-text">{formatCurrency(estimatedFee)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm font-medium border-t pt-1">
                                            <span className="theme-text">Total Amount:</span>
                                            <span className="theme-text">{formatCurrency((parseFloat(form.amount) || 0) + estimatedFee)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium theme-text mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Enter transfer description..."
                                    maxLength={200}
                                    rows={4}
                                    className="w-full p-3 border theme-border rounded-lg theme-bg-secondary theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <div className="mt-1 text-xs theme-text-secondary">
                                    {form.description.length}/200 characters
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Balance Check Warning */}
                    {selectedFromAccount && form.amount && (
                        <div className="theme-card-elevated rounded-lg p-4 bg-yellow-50 border border-yellow-200">
                            <div className="flex items-start space-x-3">
                                <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-yellow-800 mb-1">Balance Information</p>
                                    <div className="text-yellow-700 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Current Balance:</span>
                                            <span>{selectedFromAccount.formattedBalance}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>After Transfer:</span>
                                            <span>{formatCurrency(selectedFromAccount.balance - (parseFloat(form.amount) || 0) - estimatedFee)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Minimum Required:</span>
                                            <span>{formatCurrency(selectedFromAccount.minimumBalance)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/customer/dashboard')}
                            className="px-8 py-3 border theme-border rounded-lg theme-text hover:theme-card-hover transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !form.fromAccountId || !form.amount || !form.description ||
                                (form.transferType === 'own' && !form.toAccountId) ||
                                (form.transferType === 'other' && (!form.toAccountNumber || !form.toAccountTitle))}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            Review Transfer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransferMoney;
