/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Database,
    Activity,
    Download,
    AlertCircle,
    Search,
    Filter,
    Calendar,
    Clock,
    User,
    Monitor,
    Server,
    ChevronDown
} from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';

const AdminSystemLogs = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [logLevel, setLogLevel] = useState('all');
    const [logCategory, setLogCategory] = useState('all');

    const handleNavigation = (path) => {
        navigate(path);
        setSidebarOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth/login');
    };

    const logCategories = [
        {
            icon: User,
            title: 'Authentication Logs',
            description: 'User login, logout, and authentication events',
            count: '1,247',
            color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
        },
        {
            icon: Database,
            title: 'Database Logs',
            description: 'Database queries, connections, and transactions',
            count: '3,891',
            color: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
        },
        {
            icon: Activity,
            title: 'Application Logs',
            description: 'Application errors, warnings, and info messages',
            count: '567',
            color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
        },
        {
            icon: Server,
            title: 'System Logs',
            description: 'Server performance, memory, and system events',
            count: '892',
            color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
        },
        {
            icon: AlertCircle,
            title: 'Error Logs',
            description: 'Critical errors and system failures',
            count: '23',
            color: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
        },
        {
            icon: Monitor,
            title: 'Security Logs',
            description: 'Security events and threat detection',
            count: '156',
            color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
        }
    ];

    const mockLogs = [
        {
            id: 1,
            timestamp: '2024-06-18 14:30:25',
            level: 'INFO',
            category: 'Authentication',
            message: 'User admin@hbl.com successfully logged in from IP 192.168.1.100',
            source: 'auth-service'
        },
        {
            id: 2,
            timestamp: '2024-06-18 14:25:12',
            level: 'WARNING',
            category: 'Database',
            message: 'Slow query detected: SELECT * FROM transactions WHERE created_at > NOW() - INTERVAL 1 DAY',
            source: 'db-monitor'
        },
        {
            id: 3,
            timestamp: '2024-06-18 14:20:08',
            level: 'ERROR',
            category: 'Application',
            message: 'Failed to process payment transaction TXN001234567: Insufficient funds',
            source: 'payment-service'
        }
    ];

    const getLevelColor = (level) => {
        const colors = {
            INFO: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
            WARNING: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
            ERROR: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
            DEBUG: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
        };
        return colors[level] || colors.INFO;
    };

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
                currentPath="/admin/logs"
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div>
                            <div className="flex items-center mb-2">
                                <FileText className="w-6 h-6 sm:w-8 sm:h-8 theme-accent mr-3" />
                                <h1 className="text-xl sm:text-2xl font-bold theme-heading-1">System Logs</h1>
                            </div>
                            <p className="text-sm theme-text-secondary">Monitor system activities, errors, and performance logs</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            <button className="theme-btn-secondary px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 text-sm">
                                <Download className="w-4 h-4" />
                                <span>Export Logs</span>
                            </button>
                        </div>
                    </div>

                    {/* Log Categories Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {logCategories.map((category, index) => {
                            const IconComponent = category.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="theme-card-elevated rounded-lg p-4 sm:p-6 hover:theme-card-hover transition-all cursor-pointer"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${category.color} flex items-center justify-center flex-shrink-0`}>
                                            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm sm:text-base font-semibold theme-text mb-1">{category.title}</h3>
                                            <p className="text-xs sm:text-sm theme-text-secondary mb-2 line-clamp-2">
                                                {category.description}
                                            </p>
                                            <div className="text-lg sm:text-xl font-bold theme-text">{category.count}</div>
                                            <div className="text-xs theme-text-secondary">entries today</div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Search and Filters */}
                    <div className="theme-card-elevated rounded-lg p-4 sm:p-6">
                        <div className="flex flex-col space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search logs by message, source, or category..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 theme-input rounded-lg text-sm"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-4 py-2 rounded-lg flex items-center justify-center space-x-2 text-sm ${showFilters ? 'theme-accent-bg text-white' : 'theme-btn-secondary'}`}
                            >
                                <Filter className="w-4 h-4" />
                                <span>Advanced Filters</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 p-4 theme-card rounded-lg"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium theme-text-secondary mb-2">Log Level</label>
                                            <select
                                                value={logLevel}
                                                onChange={(e) => setLogLevel(e.target.value)}
                                                className="w-full theme-input rounded-lg text-sm"
                                            >
                                                <option value="all">All Levels</option>
                                                <option value="ERROR">Error</option>
                                                <option value="WARNING">Warning</option>
                                                <option value="INFO">Info</option>
                                                <option value="DEBUG">Debug</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium theme-text-secondary mb-2">Category</label>
                                            <select
                                                value={logCategory}
                                                onChange={(e) => setLogCategory(e.target.value)}
                                                className="w-full theme-input rounded-lg text-sm"
                                            >
                                                <option value="all">All Categories</option>
                                                <option value="Authentication">Authentication</option>
                                                <option value="Database">Database</option>
                                                <option value="Application">Application</option>
                                                <option value="System">System</option>
                                                <option value="Security">Security</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium theme-text-secondary mb-2">Date Range</label>
                                            <select className="w-full theme-input rounded-lg text-sm">
                                                <option value="today">Today</option>
                                                <option value="week">Last 7 days</option>
                                                <option value="month">Last 30 days</option>
                                                <option value="custom">Custom Range</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium theme-text-secondary mb-2">Source</label>
                                            <select className="w-full theme-input rounded-lg text-sm">
                                                <option value="all">All Sources</option>
                                                <option value="auth-service">Auth Service</option>
                                                <option value="payment-service">Payment Service</option>
                                                <option value="db-monitor">Database Monitor</option>
                                                <option value="api-gateway">API Gateway</option>
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Log Entries */}
                    <div className="theme-card-elevated rounded-lg overflow-hidden">
                        <div className="p-4 sm:p-6 border-b theme-border">
                            <h2 className="text-lg font-semibold theme-text">Recent Log Entries</h2>
                            <p className="text-sm theme-text-secondary mt-1">Latest system activities and events</p>
                        </div>

                        {/* Mobile Log View */}
                        <div className="block sm:hidden">
                            <div className="divide-y theme-border">
                                {mockLogs.map((log, index) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-4 space-y-3"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                                                    {log.level}
                                                </span>
                                                <span className="text-xs theme-text-secondary">{log.category}</span>
                                            </div>
                                            <div className="flex items-center space-x-1 text-xs theme-text-muted">
                                                <Clock className="w-3 h-3" />
                                                <span>{log.timestamp}</span>
                                            </div>
                                        </div>
                                        <div className="text-sm theme-text line-clamp-3">{log.message}</div>
                                        <div className="text-xs theme-text-secondary">Source: {log.source}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                            Timestamp
                                        </th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                            Level
                                        </th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                            Message
                                        </th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                            Source
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y theme-border">
                                    {mockLogs.map((log, index) => (
                                        <motion.tr
                                            key={log.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <td className="px-4 lg:px-6 py-4 text-sm theme-text font-mono">
                                                {log.timestamp}
                                            </td>
                                            <td className="px-4 lg:px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                                                    {log.level}
                                                </span>
                                            </td>
                                            <td className="px-4 lg:px-6 py-4 text-sm theme-text">
                                                {log.category}
                                            </td>
                                            <td className="px-4 lg:px-6 py-4 text-sm theme-text max-w-md truncate">
                                                {log.message}
                                            </td>
                                            <td className="px-4 lg:px-6 py-4 text-sm theme-text-secondary">
                                                {log.source}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Coming Soon Notice */}
                        <div className="p-6 sm:p-8 text-center border-t theme-border">
                            <div className="max-w-md mx-auto">
                                <Database className="w-12 h-12 theme-text-muted mx-auto mb-4" />
                                <h3 className="text-lg font-semibold theme-text mb-2">Real-time Log Monitoring</h3>
                                <p className="text-sm theme-text-secondary mb-4">
                                    Advanced log aggregation, real-time monitoring, and detailed analytics are being developed.
                                </p>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                    Coming Soon
                                </span>
                            </div>
                        </div>
                    </div>
                </main >
            </div >
        </div >
    );
};

export default AdminSystemLogs;
