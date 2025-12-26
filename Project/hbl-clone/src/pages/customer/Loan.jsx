import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    active: 'bg-blue-100 text-blue-700',
    closed: 'bg-gray-100 text-gray-700',
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0
    }).format(amount);
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export default function Loan() {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchLoans = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/auth/login');
                return;
            }
            const res = await fetch(`${API_BASE_URL}/loans`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!res.ok) {
                throw new Error('Failed to fetch loans');
            }
            const data = await res.json();
            setLoans(data.data || []);
        } catch (err) {
            setError(err.message || 'Failed to load loans');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans();
        // eslint-disable-next-line
    }, []);

    return (
        <div className="min-h-screen theme-container">
            {/* Header - matches Request Card style */}
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
                            <h1 className="text-xl font-bold theme-heading-1">My Loans</h1>
                            <p className="text-sm theme-text-secondary">View your loan applications and status</p>
                        </div>
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm text-sm font-medium"
                            onClick={() => navigate('/customer/loans/apply')}
                        >
                            <Plus className="w-4 h-4" /> Apply for New Loan
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto w-full p-4 sm:p-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin theme-accent mb-4" />
                        <span className="theme-text-secondary">Loading loans...</span>
                    </div>
                ) : error ? (
                    <div className="theme-card rounded-lg p-6 text-center">
                        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
                        <p className="text-red-600 mb-4">{error}</p>
                        <button onClick={fetchLoans} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
                    </div>
                ) : loans.length === 0 ? (
                    <div className="theme-card rounded-lg p-8 text-center border border-gray-100">
                        <h3 className="text-lg font-semibold theme-text mb-2">No loans found</h3>
                        <p className="theme-text-secondary mb-6 text-sm sm:text-base">
                            You have not applied for any loans yet.
                        </p>
                        <button
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            onClick={() => navigate('/customer/loans/apply')}
                        >
                            Apply for a Loan
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {loans.map((loan) => (
                            <div key={loan._id} className="theme-card-elevated rounded-lg p-6 border border-gray-100 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold theme-text text-lg capitalize">{loan.loanType} Loan</span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[loan.status] || 'bg-gray-100 text-gray-700'}`}>{loan.status}</span>
                                    </div>
                                    <span className="text-xs theme-text-secondary">Applied: {formatDate(loan.applicationDate)}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="theme-text-muted">Amount:</span>
                                            <span className="theme-text font-medium">{formatCurrency(loan.amount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="theme-text-muted">Tenure:</span>
                                            <span className="theme-text font-medium">{loan.tenure} months</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="theme-text-muted">Interest Rate:</span>
                                            <span className="theme-text font-medium">{loan.interestRate}% p.a.</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="theme-text-muted">Monthly Installment:</span>
                                            <span className="theme-text font-medium">{formatCurrency(loan.monthlyInstallment)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="theme-text-muted">Purpose:</span>
                                            <span className="theme-text font-medium">{loan.purpose || '-'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="theme-text-muted">Outstanding Amount:</span>
                                            <span className="theme-text font-medium">{formatCurrency(loan.outstandingAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="theme-text-muted">Status:</span>
                                            <span className="theme-text font-medium capitalize">{loan.status}</span>
                                        </div>
                                        {loan.approvedDate && (
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="theme-text-muted">Approved:</span>
                                                <span className="theme-text font-medium">{formatDate(loan.approvedDate)}</span>
                                            </div>
                                        )}
                                        {loan.disbursedDate && (
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="theme-text-muted">Disbursed:</span>
                                                <span className="theme-text font-medium">{formatDate(loan.disbursedDate)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {loan.collateral && (
                                    <div className="mt-2 text-xs theme-text-secondary">
                                        <span className="font-medium">Collateral:</span> {loan.collateral}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
