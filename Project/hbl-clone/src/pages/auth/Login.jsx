// Login.jsx - HBL Clone
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import FormInput from '../../components/auth/FormInput';
import SubmitButton from '../../components/auth/SubmitButton';
import ErrorMessage from '../../components/auth/ErrorMessage';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/auth/login';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Navigate based on user role
            switch (data.user.role) {
                case 'admin':
                case 'manager':
                    navigate('/admin/dashboard');
                    break;
                case 'customer':
                default:
                    navigate('/customer/dashboard');
                    break;
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Welcome Back">
            <form onSubmit={handleSubmit} className="space-y-4">
                <ErrorMessage message={error} />

                <FormInput
                    label="Email Address"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                />

                <FormInput
                    label="Password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                />

                <SubmitButton loading={loading ? 'Logging in...' : false}>
                    Login
                </SubmitButton>

                <div className="text-center pt-4">
                    <p className="text-sm theme-text-secondary">
                        Don't have an account?{' '}
                        <Link
                            to="/auth/register"
                            className="theme-accent hover:underline font-medium"
                        >
                            Register here
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
