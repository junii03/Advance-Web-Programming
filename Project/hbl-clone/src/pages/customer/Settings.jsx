import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';

const getSystemTheme = () =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

export default function Settings() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || getSystemTheme();
    });
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        async function fetchUser() {
            setLoading(true);
            setError('');
            try {
                const res = await dashboardService.getUserProfile();
                setUser(res.data);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Failed to load user profile.');
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    const handleThemeToggle = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="min-h-screen theme-container flex flex-col">
            {/* Header - similar to Notification */}
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
                            <h1 className="text-xl font-bold theme-heading-1">Settings</h1>
                            <p className="text-sm theme-text-secondary">Manage your profile and preferences</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-6">
                {/* Profile Card */}
                <section className="theme-card-elevated rounded-xl w-full p-5 flex flex-col items-center mb-8 shadow-md">
                    {loading ? (
                        <div className="theme-text-secondary">Loading profile...</div>
                    ) : error ? (
                        <div className="theme-text-error">{error}</div>
                    ) : user ? (
                        <>
                            <img
                                src={user.profilePicture.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.email)}&background=14b8a6&color=fff`}
                                alt="Profile"
                                className="w-20 h-20 rounded-full mb-3 border-4 border-accent object-cover"
                            />
                            <div className="theme-heading-2 text-lg mb-1">{user.fullName}</div>
                            <div className="theme-text-secondary text-sm mb-1">{user.email}</div>
                            <div className="theme-text-muted text-xs">{user.phone || user.customerNumber}</div>
                        </>
                    ) : null}
                </section>

                {/* Theme Settings Card */}
                <section className="theme-card-elevated rounded-xl w-full p-5 flex flex-col gap-4 shadow-md">
                    <div className="flex items-center justify-between">
                        <span className="theme-heading-2 text-base">Theme</span>
                        <button
                            onClick={handleThemeToggle}
                            className="flex items-center gap-2 px-4 py-2 rounded-full theme-btn-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                            aria-pressed={theme === 'dark'}
                        >
                            <Sun className={`w-5 h-5 ${theme === 'light' ? 'theme-accent' : 'theme-text-secondary'}`} />
                            <span className="text-sm font-medium">{theme === 'dark' ? 'Dark' : 'Light'}</span>
                            <Moon className={`w-5 h-5 ${theme === 'dark' ? 'theme-accent' : 'theme-text-secondary'}`} />
                            <span
                                className={`ml-3 w-10 h-5 flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-accent' : ''}`}
                            >
                                <span
                                    className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-5' : ''}`}
                                />
                            </span>
                        </button>
                    </div>
                    <div className="theme-text-muted text-xs mt-1">Your theme preference is saved for future visits.</div>
                </section>
            </div>
        </div>
    );
}
