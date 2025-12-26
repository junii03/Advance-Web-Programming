import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const loanTypes = [
    { value: 'personal', label: 'Personal Loan' },
    { value: 'home', label: 'Home Loan' },
    { value: 'car', label: 'Car Loan' },
    { value: 'business', label: 'Business Loan' },
];

const minAmount = 50000;
const maxAmount = 10000000;
const minTenure = 6;
const maxTenure = 240;

export default function ApplyLoan() {
    const [form, setForm] = useState({
        loanType: 'personal',
        amount: '',
        tenure: '',
        purpose: '',
        collateral: '',
    });
    const [emi, setEmi] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleCalculate = async () => {
        setLoading(true);
        setEmi(null);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/loans/calculate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: Number(form.amount),
                    tenure: Number(form.tenure),
                    loanType: form.loanType,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Calculation failed');
            setEmi(data.data);
        } catch (err) {
            setError(err.message || 'Failed to calculate EMI');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/loans`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...form,
                    amount: Number(form.amount),
                    tenure: Number(form.tenure),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Application failed');
            setSuccess('Loan application submitted successfully!');
            setTimeout(() => navigate('/customer/loans'), 1500);
        } catch (err) {
            setError(err.message || 'Failed to apply for loan');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center theme-container px-2 py-8">
            <div className="theme-card-elevated max-w-md w-full p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 theme-heading-1">Apply for a New Loan</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 theme-text-secondary font-medium">Loan Type</label>
                        <select
                            name="loanType"
                            value={form.loanType}
                            onChange={handleChange}
                            className="theme-input w-full rounded px-3 py-2"
                            required
                        >
                            {loanTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1 theme-text-secondary font-medium">Amount (PKR)</label>
                        <input
                            type="number"
                            name="amount"
                            min={minAmount}
                            max={maxAmount}
                            value={form.amount}
                            onChange={handleChange}
                            className="theme-input w-full rounded px-3 py-2"
                            placeholder={`Between ${minAmount.toLocaleString()} and ${maxAmount.toLocaleString()}`}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 theme-text-secondary font-medium">Tenure (months)</label>
                        <input
                            type="number"
                            name="tenure"
                            min={minTenure}
                            max={maxTenure}
                            value={form.tenure}
                            onChange={handleChange}
                            className="theme-input w-full rounded px-3 py-2"
                            placeholder={`Between ${minTenure} and ${maxTenure}`}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 theme-text-secondary font-medium">Purpose</label>
                        <input
                            type="text"
                            name="purpose"
                            value={form.purpose}
                            onChange={handleChange}
                            className="theme-input w-full rounded px-3 py-2"
                            placeholder="Purpose of loan"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 theme-text-secondary font-medium">Collateral (optional)</label>
                        <input
                            type="text"
                            name="collateral"
                            value={form.collateral}
                            onChange={handleChange}
                            className="theme-input w-full rounded px-3 py-2"
                            placeholder="Collateral details (if any)"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="theme-btn-secondary px-4 py-2 rounded"
                            onClick={handleCalculate}
                            disabled={loading || !form.amount || !form.tenure}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Calculate EMI'}
                        </button>
                        {emi && (
                            <span className="theme-success text-sm font-medium">EMI: PKR {emi.monthlyInstallment.toLocaleString()}</span>
                        )}
                    </div>
                    {error && (
                        <div className="theme-error-bg rounded p-2 flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="theme-success-bg rounded p-2 flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4" /> {success}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="theme-btn-primary w-full py-2 rounded font-semibold flex items-center justify-center gap-2"
                        disabled={submitting}
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Application'}
                    </button>
                </form>
                <button
                    className="theme-btn-ghost w-full mt-4 text-sm"
                    onClick={() => navigate('/customer/loans')}
                >
                    Back to Loan History
                </button>
            </div>
        </div>
    );
}
