import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, CreditCard, ChevronDown, Check, AlertCircle, CheckCircle } from 'lucide-react';
import dashboardService from '../../services/dashboardService';

const AddAccount = () => {
    const [branches, setBranches] = useState([]);
    const [form, setForm] = useState({
        accountType: '',
        accountTitle: '',
        branchCode: '',
        branchName: '',
        initialDeposit: '',
        depositTerm: '',
        maturityDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [branchesLoading, setBranchesLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState({
        accountType: false,
        branch: false
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            setBranchesLoading(true);
            const response = await dashboardService.getBranches();
            setBranches(response.data || []);
        } catch (err) {
            setError('Failed to load branches. Please try again.');
            console.error('Error fetching branches:', err);
        } finally {
            setBranchesLoading(false);
        }
    };

    const accountTypes = [
        {
            value: 'savings',
            name: 'Savings Account',
            description: 'Earn interest on your savings with flexible access',
            features: ['7.5% annual interest', 'Minimum balance: PKR 1,000', 'ATM & online banking'],
            icon: '💰',
            minDeposit: 1000
        },
        {
            value: 'current',
            name: 'Current Account',
            description: 'Perfect for business transactions with higher limits',
            features: ['No interest earned', 'Minimum balance: PKR 5,000', 'Higher transaction limits'],
            icon: '🏢',
            minDeposit: 5000
        },
        {
            value: 'fixed_deposit',
            name: 'Fixed Deposit',
            description: 'High returns with fixed tenure investment',
            features: ['12.5% annual returns', 'Minimum amount: PKR 50,000', 'Fixed tenure'],
            icon: '📈',
            minDeposit: 50000,
            requiresTerm: true
        },
        {
            value: 'islamic_savings',
            name: 'Islamic Savings',
            description: 'Shariah-compliant savings with profit sharing',
            features: ['6.5% expected profit', 'Shariah compliant', 'Minimum balance: PKR 1,000'],
            icon: '☪️',
            minDeposit: 1000
        },
        {
            value: 'salary',
            name: 'Salary Account',
            description: 'Designed for salaried professionals',
            features: ['5% annual interest', 'No minimum balance', 'Free debit card'],
            icon: '💼',
            minDeposit: 0
        }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleAccountTypeSelect = (accountType) => {
        setForm(prev => ({
            ...prev,
            accountType: accountType.value,
            initialDeposit: accountType.minDeposit.toString()
        }));
        setIsDropdownOpen(prev => ({ ...prev, accountType: false }));
        setError('');
    };

    const handleBranchSelect = (branch) => {
        setForm(prev => ({
            ...prev,
            branchCode: branch.code,
            branchName: branch.name
        }));
        setIsDropdownOpen(prev => ({ ...prev, branch: false }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate form
            if (!form.accountType || !form.accountTitle || !form.branchCode) {
                throw new Error('Please fill in all required fields');
            }

            const selectedAccountType = accountTypes.find(type => type.value === form.accountType);
            if (selectedAccountType?.requiresTerm && !form.depositTerm) {
                throw new Error('Please specify the deposit term for fixed deposit account');
            }

            if (form.initialDeposit && parseFloat(form.initialDeposit) < selectedAccountType.minDeposit) {
                throw new Error(`Minimum initial deposit is PKR ${selectedAccountType.minDeposit.toLocaleString()}`);
            }

            const payload = {
                accountType: form.accountType,
                accountTitle: form.accountTitle,
                branchCode: form.branchCode,
                branchName: form.branchName,
                ...(form.initialDeposit && { initialDeposit: parseFloat(form.initialDeposit) }),
                ...(form.depositTerm && { depositTerm: parseInt(form.depositTerm) }),
                ...(form.maturityDate && { maturityDate: form.maturityDate })
            };

            const response = await dashboardService.createAccount(payload);
            setSuccess(true);

            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
                navigate('/customer/dashboard');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const selectedAccountType = accountTypes.find(type => type.value === form.accountType);
    const selectedBranch = branches.find(branch => branch.code === form.branchCode);

    if (success) {
        return (
            <div className="min-h-screen theme-container">
                <div className="max-w-2xl mx-auto p-4 pt-8">
                    <div className="theme-card-elevated rounded-lg p-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold theme-heading-1 mb-4">
                            Account Created Successfully!
                        </h2>
                        <p className="theme-text-secondary text-lg mb-6">
                            Your {selectedAccountType?.name} has been created successfully.
                        </p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                            <p className="text-blue-800 dark:text-blue-300 font-medium">
                                Account will be activated within 24 hours. You'll receive confirmation via email and SMS.
                            </p>
                        </div>
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
                            <h1 className="text-xl font-bold theme-heading-1">Open New Account</h1>
                            <p className="text-sm theme-text-secondary">Choose your account type and branch</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 py-6 space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <p className="text-red-800 dark:text-red-300 font-medium">{error}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Account Type Selection */}
                    <div className="theme-card-elevated rounded-lg p-6">
                        <h2 className="text-lg font-semibold theme-heading-1 mb-4 flex items-center space-x-2">
                            <CreditCard className="w-5 h-5 theme-accent" />
                            <span>Select Account Type</span>
                        </h2>
                        <p className="theme-text-secondary text-sm mb-4">
                            Choose the account type that best suits your needs
                        </p>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(prev => ({ ...prev, accountType: !prev.accountType }))}
                                className="w-full p-4 text-left border theme-border rounded-lg theme-bg-secondary theme-text focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                            >
                                {selectedAccountType ? (
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{selectedAccountType.icon}</span>
                                        <div>
                                            <div className="font-medium">{selectedAccountType.name}</div>
                                            <div className="text-sm theme-text-secondary">{selectedAccountType.description}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="theme-text-secondary">Select account type...</span>
                                )}
                                <ChevronDown className={`w-5 h-5 theme-text-secondary transition-transform ${isDropdownOpen.accountType ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen.accountType && (
                                <div className="absolute z-10 w-full mt-2 theme-card-elevated border theme-border rounded-lg shadow-lg max-h-96 overflow-y-auto">
                                    {accountTypes.map((accountType) => (
                                        <button
                                            key={accountType.value}
                                            type="button"
                                            onClick={() => handleAccountTypeSelect(accountType)}
                                            className="w-full p-4 text-left hover:theme-card-hover transition-colors border-b theme-border last:border-b-0 flex items-start space-x-3"
                                        >
                                            <span className="text-2xl mt-1">{accountType.icon}</span>
                                            <div className="flex-1">
                                                <div className="font-medium theme-text mb-1">{accountType.name}</div>
                                                <div className="text-sm theme-text-secondary mb-2">{accountType.description}</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {accountType.features.map((feature, index) => (
                                                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                                                            {feature}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            {form.accountType === accountType.value && (
                                                <Check className="w-5 h-5 text-blue-600 mt-1" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="theme-card-elevated rounded-lg p-6">
                        <h2 className="text-lg font-semibold theme-heading-1 mb-4">Account Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium theme-text mb-2">
                                    Account Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="accountTitle"
                                    value={form.accountTitle}
                                    onChange={handleChange}
                                    placeholder="Enter account title (e.g., John Doe Savings)"
                                    className="w-full p-3 border theme-border rounded-lg theme-bg-secondary theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    maxLength={100}
                                    required
                                />
                                <p className="text-xs theme-text-secondary mt-1">
                                    Maximum 100 characters
                                </p>
                            </div>

                            {selectedAccountType?.requiresTerm && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium theme-text mb-2">
                                            Deposit Term (Months) <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="depositTerm"
                                            value={form.depositTerm}
                                            onChange={handleChange}
                                            className="w-full p-3 border theme-border rounded-lg theme-bg-secondary theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select term...</option>
                                            <option value="3">3 Months</option>
                                            <option value="6">6 Months</option>
                                            <option value="12">12 Months</option>
                                            <option value="24">24 Months</option>
                                            <option value="36">36 Months</option>
                                            <option value="60">60 Months</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium theme-text mb-2">
                                            Maturity Date (Optional)
                                        </label>
                                        <input
                                            type="date"
                                            name="maturityDate"
                                            value={form.maturityDate}
                                            onChange={handleChange}
                                            className="w-full p-3 border theme-border rounded-lg theme-bg-secondary theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium theme-text mb-2">
                                    Initial Deposit (PKR)
                                </label>
                                <input
                                    type="number"
                                    name="initialDeposit"
                                    value={form.initialDeposit}
                                    onChange={handleChange}
                                    placeholder={selectedAccountType ? `Minimum: ${selectedAccountType.minDeposit.toLocaleString()}` : 'Enter amount'}
                                    className="w-full p-3 border theme-border rounded-lg theme-bg-secondary theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min={selectedAccountType?.minDeposit || 0}
                                />
                                {selectedAccountType && (
                                    <p className="text-xs theme-text-secondary mt-1">
                                        Minimum deposit: PKR {selectedAccountType.minDeposit.toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Branch Selection */}
                    <div className="theme-card-elevated rounded-lg p-6">
                        <h2 className="text-lg font-semibold theme-heading-1 mb-4 flex items-center space-x-2">
                            <Building2 className="w-5 h-5 theme-accent" />
                            <span>Select Branch</span>
                        </h2>
                        <p className="theme-text-secondary text-sm mb-4">
                            Choose your preferred branch for account management
                        </p>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(prev => ({ ...prev, branch: !prev.branch }))}
                                className="w-full p-4 text-left border theme-border rounded-lg theme-bg-secondary theme-text focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                                disabled={branchesLoading}
                            >
                                {branchesLoading ? (
                                    <span className="theme-text-secondary">Loading branches...</span>
                                ) : selectedBranch ? (
                                    <div>
                                        <div className="font-medium">{selectedBranch.name}</div>
                                        <div className="text-sm theme-text-secondary">
                                            {selectedBranch.address?.city} • Code: {selectedBranch.code}
                                        </div>
                                    </div>
                                ) : (
                                    <span className="theme-text-secondary">Select branch...</span>
                                )}
                                <ChevronDown className={`w-5 h-5 theme-text-secondary transition-transform ${isDropdownOpen.branch ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen.branch && !branchesLoading && (
                                <div className="absolute z-10 w-full mt-2 theme-card-elevated border theme-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                    {branches.map((branch) => (
                                        <button
                                            key={branch.id}
                                            type="button"
                                            onClick={() => handleBranchSelect(branch)}
                                            className="w-full p-4 text-left hover:theme-card-hover transition-colors border-b theme-border last:border-b-0 flex items-center justify-between"
                                        >
                                            <div>
                                                <div className="font-medium theme-text">{branch.name}</div>
                                                <div className="text-sm theme-text-secondary">
                                                    {branch.address?.street}, {branch.address?.city} • Code: {branch.code}
                                                </div>
                                            </div>
                                            {form.branchCode === branch.code && (
                                                <Check className="w-5 h-5 text-blue-600" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Important Information */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Important Information</h3>
                        <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                            <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Account will be activated within 24 hours after approval</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>You will receive confirmation via email and SMS</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Debit card will be dispatched to your registered address</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Terms and conditions apply as per account type</span>
                            </li>
                        </ul>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/customer/dashboard')}
                            className="px-6 py-3 border theme-border rounded-lg theme-text hover:theme-card-hover transition-colors order-2 sm:order-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !form.accountType || !form.accountTitle || !form.branchCode}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium order-1 sm:order-2"
                        >
                            {loading ? 'Creating Account...' : 'Open Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAccount;
