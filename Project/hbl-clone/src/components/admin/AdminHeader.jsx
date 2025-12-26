/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Menu, Bell, Settings, LogOut, User, X, Check, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import adminService from '../../services/adminService';
import LogoutModal from '../common/LogoutModal';
import { useLogout } from '../../hooks/useLogout';


const AdminHeader = ({ onMenuClick, onLogout }) => {
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [toasts, setToasts] = useState([]);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { showLogoutModal, isLoggingOut, openLogoutModal, closeLogoutModal, confirmLogout } = useLogout('admin');

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            // Mock admin notifications - replace with actual API call
            const mockNotifications = [
                {
                    id: '1',
                    title: 'High-value loan application',
                    message: 'New loan application for PKR 2,500,000 requires immediate attention',
                    type: 'urgent',
                    timestamp: new Date(Date.now() - 5 * 60 * 1000),
                    read: false
                },
                {
                    id: '2',
                    title: 'Suspicious transaction flagged',
                    message: 'Transaction #TXN789012 has been flagged for review',
                    type: 'security',
                    timestamp: new Date(Date.now() - 15 * 60 * 1000),
                    read: false
                },
                {
                    id: '3',
                    title: 'System backup completed',
                    message: 'Daily database backup completed successfully',
                    type: 'info',
                    timestamp: new Date(Date.now() - 60 * 60 * 1000),
                    read: true
                }
            ];

            setNotifications(mockNotifications);
            setUnreadCount(mockNotifications.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = (notificationId) => {
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const showToast = (message, type = 'info', duration = 5000) => {
        const id = Date.now().toString();
        const toast = { id, message, type, duration };
        setToasts(prev => [...prev, toast]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'urgent': return AlertTriangle;
            case 'security': return AlertTriangle;
            default: return Info;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'urgent': return 'text-red-600 bg-red-50';
            case 'security': return 'text-orange-600 bg-orange-50';
            default: return 'text-blue-600 bg-blue-50';
        }
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const diff = now - new Date(timestamp);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return `${minutes}m ago`;
    };

    return (
        <>
            <header className="theme-card-elevated border-b theme-border p-4 lg:p-6 relative">
                <div className="flex items-center justify-between">
                    {/* Left Side - Menu & Title */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onMenuClick}
                            className="p-2 rounded-lg theme-card hover:theme-card-hover lg:hidden"
                        >
                            <Menu className="w-5 h-5 theme-text" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold theme-heading-1">Admin Dashboard</h1>
                            <p className="text-sm theme-text-secondary">Welcome back, {user.firstName || 'Admin'}</p>
                        </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex items-center space-x-3">
                        {/* Enhanced Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 rounded-lg theme-card hover:theme-card-hover"
                            >
                                <Bell className="w-5 h-5 theme-text" />
                                {unreadCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center font-bold"
                                    >
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </motion.span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-80 theme-card-elevated rounded-lg shadow-lg border theme-border z-50"
                                    >
                                        {/* Header */}
                                        <div className="p-4 border-b theme-border">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold theme-heading-1">Notifications</h3>
                                                <div className="flex items-center space-x-2">
                                                    {unreadCount > 0 && (
                                                        <button
                                                            onClick={markAllAsRead}
                                                            className="text-xs theme-accent hover:underline"
                                                        >
                                                            Mark all read
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setShowNotifications(false)}
                                                        className="p-1 rounded hover:bg-gray-100"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notifications List */}
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map((notification) => {
                                                    const Icon = getNotificationIcon(notification.type);
                                                    return (
                                                        <motion.div
                                                            key={notification.id}
                                                            whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                                                            className={`p-4 border-b theme-border cursor-pointer ${!notification.read ? 'bg-blue-50' : ''
                                                                }`}
                                                            onClick={() => markAsRead(notification.id)}
                                                        >
                                                            <div className="flex items-start space-x-3">
                                                                <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                                                                    <Icon className="w-4 h-4" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium theme-text text-sm">
                                                                        {notification.title}
                                                                    </p>
                                                                    <p className="theme-text-secondary text-sm mt-1">
                                                                        {notification.message}
                                                                    </p>
                                                                    <p className="text-xs theme-text-muted mt-2">
                                                                        {formatTimeAgo(notification.timestamp)}
                                                                    </p>
                                                                </div>
                                                                {!notification.read && (
                                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })
                                            ) : (
                                                <div className="p-6 text-center">
                                                    <Bell className="w-8 h-8 theme-text-muted mx-auto mb-2" />
                                                    <p className="theme-text-secondary">No notifications</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="p-3 border-t theme-border">
                                            <button className="w-full text-sm theme-accent hover:underline">
                                                View all notifications
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>


                        {/* Logout */}
                        <button className="p-2 rounded-lg theme-card hover:theme-card-hover" onClick={openLogoutModal}>
                            <LogOut className="w-5 h-5 theme-text" />
                        </button>
                        <LogoutModal
                            isOpen={showLogoutModal}
                            onClose={closeLogoutModal}
                            onConfirm={confirmLogout}
                            loading={isLoggingOut}
                            userType="admin"
                        />
                    </div>
                </div>
            </header>

            {/* Toast Notifications */}
            <div className="fixed top-4 right-4 z-[100] space-y-2">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 300, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 300, scale: 0.9 }}
                            className={`max-w-sm p-4 rounded-lg shadow-lg border ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                                toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                                    toast.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                                        'bg-blue-50 border-blue-200 text-blue-800'
                                }`}
                        >
                            <div className="flex items-center space-x-2">
                                {toast.type === 'success' && <Check className="w-5 h-5" />}
                                {toast.type === 'error' && <X className="w-5 h-5" />}
                                {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                                {toast.type === 'info' && <Info className="w-5 h-5" />}
                                <p className="text-sm font-medium">{toast.message}</p>
                                <button
                                    onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                                    className="ml-auto"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Click outside to close notifications */}
            {showNotifications && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                />
            )}
        </>
    );
};

export default AdminHeader;
