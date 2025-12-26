/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Cog, Database, Mail, Bell, Globe, Users, Shield, Palette, Monitor, Sun, Moon } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useTheme } from '../../hooks/useTheme';

const AdminSettings = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { theme, toggleTheme, isDark } = useTheme();

    const handleNavigation = (path) => {
        navigate(path);
        setSidebarOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth/login');
    };

    const handleThemeChange = () => {
        toggleTheme();
    };

    const settingCategories = [
        {
            icon: Cog,
            title: 'General Settings',
            description: 'Basic system configuration and preferences',
            status: 'coming-soon'
        },
        {
            icon: Users,
            title: 'User Management',
            description: 'User roles, permissions, and access control',
            status: 'coming-soon'
        },
        {
            icon: Database,
            title: 'Database Settings',
            description: 'Database configuration and backup settings',
            status: 'coming-soon'
        },
        {
            icon: Mail,
            title: 'Email Configuration',
            description: 'SMTP settings and email templates',
            status: 'coming-soon'
        },
        {
            icon: Bell,
            title: 'Notifications',
            description: 'System alerts and notification preferences',
            status: 'coming-soon'
        },
        {
            icon: Shield,
            title: 'Security Settings',
            description: 'Authentication, encryption, and security policies',
            status: 'coming-soon'
        },
        {
            icon: Palette,
            title: 'Theme & Branding',
            description: 'Customize appearance and branding elements',
            status: 'coming-soon'
        },
        {
            icon: Monitor,
            title: 'System Monitoring',
            description: 'Performance monitoring and logging settings',
            status: 'coming-soon'
        }
    ];

    return (
        <div className="min-h-screen theme-bg">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onNavigate={handleNavigation}
                currentPath="/admin/settings"
            />

            {/* Main Content */}
            <div className="lg:ml-64 min-h-screen theme-bg">
                {/* Header */}
                <AdminHeader
                    onMenuClick={() => setSidebarOpen(true)}
                    onLogout={handleLogout}
                />

                {/* Page Content - Mobile First */}
                <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
                    {/* Header */}
                    <div className="text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start mb-4">
                            <Settings className="w-8 h-8 theme-accent mr-3" />
                            <h1 className="text-xl sm:text-2xl font-bold theme-heading-1">System Settings</h1>
                        </div>
                        <p className="text-sm theme-text-secondary max-w-2xl">
                            Configure and customize your banking system settings and preferences.
                        </p>
                    </div>

                    {/* Settings Categories Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {settingCategories.map((category, index) => {
                            const IconComponent = category.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="theme-card-elevated rounded-lg p-4 sm:p-6 hover:theme-card-hover transition-all cursor-pointer"
                                >
                                    <div className="text-center">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                            <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                        </div>
                                        <h3 className="text-sm sm:text-base font-semibold theme-text mb-2">{category.title}</h3>
                                        <p className="text-xs sm:text-sm theme-text-secondary mb-3 line-clamp-2">
                                            {category.description}
                                        </p>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                                            Coming Soon
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Quick Settings Overview */}
                    <div className="theme-card-elevated rounded-lg p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold theme-heading-1 mb-4 sm:mb-6">Current Configuration</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-4 theme-card rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm theme-text-secondary">System Status</span>
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                                <div className="text-lg font-semibold theme-text">Online</div>
                            </div>

                            {/* Interactive Theme Toggle */}
                            <div className="p-4 theme-card rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm theme-text-secondary">Theme Mode</span>
                                    <Palette className="w-4 h-4 theme-text-muted" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-lg font-semibold theme-text capitalize">
                                        {theme}
                                    </div>
                                    <button
                                        onClick={handleThemeChange}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full theme-btn-secondary hover:theme-btn-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
                                        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                                    >
                                        <Sun className={`w-4 h-4 transition-all duration-300 ${!isDark ? 'theme-accent scale-110' : 'theme-text-muted scale-90'}`} />
                                        <div className="relative">
                                            <div className={`w-8 h-4 rounded-full transition-all duration-300 ${isDark ? 'theme-accent-bg' : 'bg-gray-300'}`}>
                                                <div className={`w-3 h-3 bg-white rounded-full shadow transform transition-transform duration-300 absolute top-0.5 ${isDark ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                            </div>
                                        </div>
                                        <Moon className={`w-4 h-4 transition-all duration-300 ${isDark ? 'theme-accent scale-110' : 'theme-text-muted scale-90'}`} />
                                    </button>
                                </div>
                                <div className="text-xs theme-text-muted mt-2">
                                    {isDark ? 'Dark mode active' : 'Light mode active'}
                                </div>
                            </div>

                            <div className="p-4 theme-card rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm theme-text-secondary">Active Users</span>
                                    <Users className="w-4 h-4 theme-text-muted" />
                                </div>
                                <div className="text-lg font-semibold theme-text">1,247</div>
                            </div>
                            <div className="p-4 theme-card rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm theme-text-secondary">Email Service</span>
                                    <Mail className="w-4 h-4 theme-text-muted" />
                                </div>
                                <div className="text-lg font-semibold theme-text">Active</div>
                            </div>
                            <div className="p-4 theme-card rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm theme-text-secondary">Notifications</span>
                                    <Bell className="w-4 h-4 theme-text-muted" />
                                </div>
                                <div className="text-lg font-semibold theme-text">Enabled</div>
                            </div>
                            <div className="p-4 theme-card rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm theme-text-secondary">Database</span>
                                    <Database className="w-4 h-4 theme-text-muted" />
                                </div>
                                <div className="text-lg font-semibold theme-text">Connected</div>
                            </div>
                        </div>
                    </div>

                    {/* Coming Soon Notice */}
                    <div className="text-center py-8 sm:py-12">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                                <Cog className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold theme-text mb-2">Advanced Configuration</h3>
                            <p className="text-sm theme-text-secondary mb-6">
                                Comprehensive system settings and configuration options are being developed.
                                These features will provide full control over your banking system.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                                    <Monitor className="w-3 h-3 mr-1" />
                                    Real-time Monitoring
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                    <Globe className="w-3 h-3 mr-1" />
                                    Cloud Integration
                                </span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminSettings;
