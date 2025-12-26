/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Key, UserCheck, AlertTriangle, Settings, Activity, Database, Globe } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';

const AdminSecurity = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleNavigation = (path) => {
        navigate(path);
        setSidebarOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth/login');
    };

    const securityFeatures = [
        {
            icon: Lock,
            title: 'Access Control',
            description: 'Manage user permissions and role-based access',
            status: 'coming-soon'
        },
        {
            icon: Key,
            title: 'API Security',
            description: 'Monitor API keys and authentication tokens',
            status: 'coming-soon'
        },
        {
            icon: UserCheck,
            title: 'User Authentication',
            description: 'Two-factor authentication and login security',
            status: 'coming-soon'
        },
        {
            icon: AlertTriangle,
            title: 'Security Alerts',
            description: 'Real-time security threat notifications',
            status: 'coming-soon'
        },
        {
            icon: Activity,
            title: 'Activity Monitoring',
            description: 'Track user activities and suspicious behavior',
            status: 'coming-soon'
        },
        {
            icon: Database,
            title: 'Data Protection',
            description: 'Encryption and data security policies',
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
                currentPath="/admin/security"
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
                            <Shield className="w-8 h-8 theme-accent mr-3" />
                            <h1 className="text-xl sm:text-2xl font-bold theme-heading-1">Security Management</h1>
                        </div>
                        <p className="text-sm theme-text-secondary max-w-2xl">
                            Comprehensive security features to protect your banking system and customer data.
                        </p>
                    </div>

                    {/* Security Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {securityFeatures.map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="theme-card-elevated rounded-lg p-4 sm:p-6 hover:theme-card-hover transition-all"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm sm:text-base font-semibold theme-text mb-2">{feature.title}</h3>
                                            <p className="text-xs sm:text-sm theme-text-secondary mb-3 line-clamp-2">
                                                {feature.description}
                                            </p>
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                                                Coming Soon
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Security Status Overview */}
                    <div className="theme-card-elevated rounded-lg p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold theme-heading-1 mb-4 sm:mb-6">Security Status Overview</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center p-4 theme-card rounded-lg">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="text-lg sm:text-xl font-bold theme-text">Secure</div>
                                <div className="text-xs sm:text-sm theme-text-secondary">System Status</div>
                            </div>
                            <div className="text-center p-4 theme-card rounded-lg">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                    <Key className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="text-lg sm:text-xl font-bold theme-text">256</div>
                                <div className="text-xs sm:text-sm theme-text-secondary">Active Sessions</div>
                            </div>
                            <div className="text-center p-4 theme-card rounded-lg">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div className="text-lg sm:text-xl font-bold theme-text">0</div>
                                <div className="text-xs sm:text-sm theme-text-secondary">Security Alerts</div>
                            </div>
                            <div className="text-center p-4 theme-card rounded-lg">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="text-lg sm:text-xl font-bold theme-text">99.9%</div>
                                <div className="text-xs sm:text-sm theme-text-secondary">Uptime</div>
                            </div>
                        </div>
                    </div>

                    {/* Coming Soon Notice */}
                    <div className="text-center py-8 sm:py-12">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <Settings className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold theme-text mb-2">Advanced Security Features</h3>
                            <p className="text-sm theme-text-secondary mb-6">
                                We're working on implementing comprehensive security management tools.
                                These features will be available in the next update.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                    <Globe className="w-3 h-3 mr-1" />
                                    Enterprise Ready
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Bank Grade Security
                                </span>
                            </div>
                        </div>
                    </div>
                </main>
            </div >
        </div >
    );
};

export default AdminSecurity;
