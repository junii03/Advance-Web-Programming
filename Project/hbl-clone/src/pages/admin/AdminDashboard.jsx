/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import adminService from '../../services/adminService';

// Import components
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatsOverview from '../../components/admin/StatsOverview';
import PendingApprovals from '../../components/admin/PendingApprovals';
import QuickActions from '../../components/admin/QuickActions';
import RecentActivity from '../../components/admin/RecentActivity';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [approvals, setApprovals] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsResponse, approvalsResponse, transactionsResponse] = await Promise.all([
                adminService.getDashboardStats(),
                adminService.getPendingApprovals(),
                adminService.getAllTransactions({ limit: 10, page: 1 })
            ]);

            setStats(statsResponse.data);
            setApprovals(approvalsResponse.data);
            setRecentTransactions(transactionsResponse.data || []);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprovalAction = async (type, id, action, reason = '') => {
        try {
            if (type === 'loan') {
                await adminService.approveLoan(id, action, reason);
            } else if (type === 'card') {
                // For card approvals, we need to find the user ID and update card status
                const card = approvals.pendingCards.find(c => c._id === id);
                if (card) {
                    const status = action === 'approve' ? 'active' : 'blocked';
                    await adminService.updateCardStatus(card.userId, id, status, reason);
                }
            }

            // Refresh approvals after action
            const approvalsResponse = await adminService.getPendingApprovals();
            setApprovals(approvalsResponse.data);
        } catch (error) {
            console.error('Error handling approval action:', error);
            throw error;
        }
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth/login');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.3,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen theme-container flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="theme-text">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen theme-container flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-600 text-2xl">⚠</span>
                    </div>
                    <h2 className="text-xl font-semibold theme-heading-1 mb-2">Error Loading Dashboard</h2>
                    <p className="theme-text-secondary mb-4">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="theme-btn-primary px-4 py-2 rounded-lg"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen theme-container">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onNavigate={handleNavigation}
                currentPath="/admin/dashboard"
            />

            {/* Main Content */}
            <div className="lg:ml-64 min-h-screen">
                {/* Header */}
                <AdminHeader
                    onMenuClick={() => setSidebarOpen(true)}
                    onLogout={handleLogout}
                />

                {/* Dashboard Content */}
                <motion.main
                    className="p-4 sm:p-6 lg:p-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Page Title */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold theme-heading-1">Admin Dashboard</h1>
                        <p className="theme-text-secondary mt-1">Monitor and manage your banking system</p>
                    </motion.div>

                    {/* Stats Overview */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <StatsOverview stats={stats} />
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <QuickActions onNavigate={handleNavigation} />
                    </motion.div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Left Column - Pending Approvals */}
                        <motion.div variants={itemVariants} className="xl:col-span-2">
                            <PendingApprovals
                                approvals={approvals}
                                onApprovalAction={handleApprovalAction}
                                onViewAll={(type) => handleNavigation(`/admin/${type}s`)}
                            />
                        </motion.div>

                        {/* Right Column - Recent Activity */}
                        <motion.div variants={itemVariants}>
                            <RecentActivity
                                transactions={recentTransactions}
                                onViewAll={() => handleNavigation('/admin/transactions')}
                            />
                        </motion.div>
                    </div>

                    {/* Additional Insights Row */}
                    <motion.div variants={itemVariants} className="mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* System Health */}
                            <div className="theme-card-elevated rounded-lg p-6">
                                <h3 className="text-lg font-semibold theme-heading-1 mb-4">System Health</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="theme-text-secondary">Server Status</span>
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                            Online
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="theme-text-secondary">Database</span>
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                            Connected
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="theme-text-secondary">Last Backup</span>
                                        <span className="theme-text text-sm">2 hours ago</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="theme-card-elevated rounded-lg p-6">
                                <h3 className="text-lg font-semibold theme-heading-1 mb-4">Today's Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="theme-text-secondary">New Users</span>
                                        <span className="theme-text font-medium">{stats?.users?.newThisMonth || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="theme-text-secondary">Transactions</span>
                                        <span className="theme-text font-medium">{stats?.transactions?.today || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="theme-text-secondary">Revenue</span>
                                        <span className="theme-text font-medium">
                                            PKR {stats?.transactions?.volume?.totalAmount?.toLocaleString() || '0'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Alerts */}
                            <div className="theme-card-elevated rounded-lg p-6">
                                <h3 className="text-lg font-semibold theme-heading-1 mb-4">Alerts</h3>
                                <div className="space-y-3">
                                    {stats?.flaggedTransactions?.length > 0 ? (
                                        <>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                <span className="theme-text-secondary text-sm">
                                                    {stats.flaggedTransactions.length} flagged transactions
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                <span className="theme-text-secondary text-sm">
                                                    {approvals?.counts?.loans + approvals?.counts?.cards || 0} pending approvals
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-4">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <span className="text-green-600 text-sm">✓</span>
                                            </div>
                                            <p className="theme-text-secondary text-sm">All systems normal</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.main>
            </div>
        </div>
    );
};

export default AdminDashboard;
