/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import {
    Home,
    Users,
    CreditCard,
    DollarSign,
    TrendingUp,
    FileText,
    Shield,
    Settings,
    BarChart3,
    Clock,
    BugIcon,
    X
} from 'lucide-react';

const AdminSidebar = ({ isOpen, onClose, onNavigate, currentPath }) => {
    const menuItems = [
        {
            icon: Home,
            label: 'Dashboard',
            path: '/admin/dashboard'
        },
        {
            icon: Users,
            label: 'User Management',
            path: '/admin/users'
        },
        {
            icon: DollarSign,
            label: 'Loan Management',
            path: '/admin/loans'
        },
        {
            icon: CreditCard,
            label: 'Card Management',
            path: '/admin/cards'
        },
        {
            icon: TrendingUp,
            label: 'Transactions',
            path: '/admin/transactions'
        },
        {
            icon: BarChart3,
            label: 'Reports & Analytics',
            path: '/admin/reports'
        },
        {
            icon: FileText,
            label: 'System Logs',
            path: '/admin/logs'
        },
        {
            icon: Shield,
            label: 'Security',
            path: '/admin/security'
        },
        {
            icon: BugIcon,
            label: 'Customer Reports',
            path: '/admin/customer-reports'
        },
        {
            icon: Settings,
            label: 'Settings',
            path: '/admin/settings'
        }
    ];

    // Function to check if menu item is active
    const isActive = (itemPath) => {
        if (!currentPath) return false;
        // Exact match for most paths
        if (currentPath === itemPath) return true;
        // Special handling for loan management - includes loan approvals
        if (itemPath === '/admin/loans' && (currentPath === '/admin/loans' || currentPath.startsWith('/admin/loans'))) return true;
        return false;
    };

    const sidebarVariants = {
        open: {
            x: 0,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30
            }
        },
        closed: {
            x: '-100%',
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30
            }
        }
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
                <div className="flex flex-col flex-grow theme-card-elevated border-r theme-border">
                    {/* Logo */}
                    <div className="flex items-center justify-center h-16 px-4 border-b theme-border">
                        <h2 className="text-xl font-bold theme-accent">HBL Admin</h2>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <button
                                    key={index}
                                    onClick={() => onNavigate(item.path)}
                                    className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${active
                                        ? 'theme-accent-bg text-white'
                                        : 'theme-text hover:theme-card-hover'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 mr-3" />
                                    <span className="flex-1 text-left">{item.label}</span>
                                    {item.badge && (
                                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <motion.div
                variants={sidebarVariants}
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                className="lg:hidden fixed inset-y-0 left-0 z-50 w-64"
                style={{
                    background: `rgba(var(--color-background-rgb), 0.85)`,
                    backdropFilter: 'blur(15px)',
                    borderRight: '1px solid rgba(var(--color-border-rgb), 0.2)',
                    boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)'
                }}
            >
                <div className="flex flex-col h-full">
                    {/* Header with Close Button */}
                    <div
                        className="flex items-center justify-between h-16 px-4"
                        style={{
                            borderBottom: '1px solid rgba(var(--color-border-rgb), 0.2)'
                        }}
                    >
                        <h2 className="text-xl font-bold theme-accent">HBL Admin</h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-gray-100/20 dark:hover:bg-gray-800/20 transition-colors"
                        >
                            <X className="w-5 h-5 theme-text" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <button
                                    key={index}
                                    onClick={() => onNavigate(item.path)}
                                    className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${active
                                        ? 'theme-accent-bg text-white'
                                        : 'theme-text hover:bg-gray-100/20 dark:hover:bg-gray-800/20'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 mr-3" />
                                    <span className="flex-1 text-left">{item.label}</span>
                                    {item.badge && (
                                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </motion.div>
        </>
    );
};

export default AdminSidebar;
