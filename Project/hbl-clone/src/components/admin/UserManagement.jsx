/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    Eye,
    Edit,
    Ban,
    CheckCircle,
    XCircle,
    Download,
    Upload,
    Settings,
    AlertTriangle,
    Calendar,
    CreditCard,
    DollarSign
} from 'lucide-react';
import adminService from '../../services/adminService';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        role: 'customer', // Changed from 'all' to 'customer' to only show customer users by default
        verificationStatus: 'all',
        joinedDate: 'all'
    });
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserDetails, setShowUserDetails] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, filters, searchTerm]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            console.log('Fetching users with params:', {
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm,
                ...filters
            });

            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm,
                ...filters
            };

            const response = await adminService.getAllUsers(params);
            console.log('API response:', response);

            setUsers(response.data || []);
            setPagination(prev => ({
                ...prev,
                total: response.total || 0,
                pages: response.pages || 0
            }));
        } catch (error) {
            console.error('Error fetching users:', error);
            // Show user-friendly error message
            setUsers([]);
            setPagination(prev => ({
                ...prev,
                total: 0,
                pages: 0
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleUserAction = async (userId, action) => {
        try {
            switch (action) {
                case 'activate':
                    await adminService.updateUserStatus(userId, true);
                    break;
                case 'deactivate':
                    await adminService.updateUserStatus(userId, false);
                    break;
                case 'verify':
                    await adminService.updateUserVerification(userId, {
                        emailVerified: true,
                        phoneVerified: true
                    });
                    break;
                default:
                    break;
            }
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error('Error performing user action:', error);
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedUsers.length === 0) return;

        try {
            await Promise.all(
                selectedUsers.map(userId => handleUserAction(userId, action))
            );
            setSelectedUsers([]);
        } catch (error) {
            console.error('Error performing bulk action:', error);
        }
    };

    const getStatusColor = (status) => {
        return status ? 'theme-success bg-green-50 dark:bg-green-900/20' : 'theme-error bg-red-50 dark:bg-red-900/20';
    };

    const getRoleColor = (role) => {
        const colors = {
            admin: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20',
            manager: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
            customer: 'theme-text-secondary theme-surface'
        };
        return colors[role] || colors.customer;
    };

    const fetchUserDetails = async (userId) => {
        try {
            const response = await adminService.getUserDetails(userId);
            return response.data;
        } catch (error) {
            console.error('Error fetching user details:', error);
            return null;
        }
    };

    const UserDetailsModal = ({ user, onClose }) => {
        const [userDetails, setUserDetails] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const fetchDetails = async () => {
                setLoading(true);
                const details = await fetchUserDetails(user._id);
                if (details) {
                    // Calculate totals from actual account data
                    const totalBalance = details.accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;
                    const totalAccounts = details.accounts?.length || 0;

                    // Get last transaction date from recent transactions
                    const lastTransaction = details.recentTransactions?.[0]?.createdAt || null;

                    setUserDetails({
                        ...details,
                        calculatedTotalBalance: totalBalance,
                        calculatedAccountCount: totalAccounts,
                        calculatedLastTransaction: lastTransaction
                    });
                }
                setLoading(false);
            };

            fetchDetails();
        }, [user._id]);

        if (loading) {
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 theme-modal-overlay z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <div className="theme-modal-card rounded-lg p-6 max-w-md w-full">
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current theme-accent"></div>
                            <span className="ml-2 theme-text-secondary">Loading user details...</span>
                        </div>
                    </div>
                </motion.div>
            );
        }

        const userData = userDetails?.user || user;
        const accounts = userDetails?.accounts || [];
        const recentTransactions = userDetails?.recentTransactions || [];

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 theme-modal-overlay z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="theme-modal-card rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto theme-scrollbar"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold theme-heading-1">User Details</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg theme-btn-ghost theme-hover-lift"
                        >
                            <XCircle className="w-5 h-5 theme-icon" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="font-semibold theme-heading-2">Basic Information</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm theme-text-secondary">Full Name</label>
                                    <p className="font-medium theme-text">{userData.fullName || `${userData.firstName} ${userData.lastName}`}</p>
                                </div>
                                <div>
                                    <label className="text-sm theme-text-secondary">Email</label>
                                    <p className="font-medium theme-text">{userData.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm theme-text-secondary">Phone</label>
                                    <p className="font-medium theme-text">{userData.phone || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-sm theme-text-secondary">Customer Number</label>
                                    <p className="font-medium theme-text">{userData.customerNumber}</p>
                                </div>
                                <div>
                                    <label className="text-sm theme-text-secondary">Role</label>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getRoleColor(userData.role)}`}>
                                        {userData.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Account Status */}
                        <div className="space-y-4">
                            <h3 className="font-semibold theme-heading-2">Account Status</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm theme-text-secondary">Account Status</span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(userData.isActive)}`}>
                                        {userData.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm theme-text-secondary">Email Verified</span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(userData.isEmailVerified)}`}>
                                        {userData.isEmailVerified ? 'Verified' : 'Unverified'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm theme-text-secondary">Phone Verified</span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(userData.isPhoneVerified)}`}>
                                        {userData.isPhoneVerified ? 'Verified' : 'Unverified'}
                                    </span>
                                </div>
                                <div>
                                    <label className="text-sm theme-text-secondary">Joined Date</label>
                                    <p className="font-medium theme-text">
                                        {new Date(userData.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm theme-text-secondary">Last Login</label>
                                    <p className="font-medium theme-text">
                                        {userData.lastLogin ? new Date(userData.lastLogin).toLocaleDateString() : 'Never'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div className="mt-6">
                        <h3 className="font-semibold theme-heading-2 mb-4">Banking Accounts</h3>
                        {accounts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {accounts.map((account, index) => (
                                    <div key={account._id || index} className="theme-card-elevated rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium theme-text">{account.accountTitle}</h4>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(account.status === 'active')}`}>
                                                {account.status}
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p className="theme-text-secondary">Account Number: {account.accountNumber}</p>
                                            <p className="theme-text-secondary">Type: {account.accountType}</p>
                                            <p className="font-semibold theme-text">Balance: PKR {account.balance?.toLocaleString() || 0}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="theme-text-secondary text-center py-4">No banking accounts found</p>
                        )}
                    </div>

                    {/* Financial Summary */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 theme-card-elevated rounded-lg theme-hover-lift">
                            <CreditCard className="w-8 h-8 theme-accent mx-auto mb-2" />
                            <p className="text-sm theme-text-secondary">Total Accounts</p>
                            <p className="text-lg font-bold theme-text">{userDetails?.calculatedAccountCount || 0}</p>
                        </div>
                        <div className="text-center p-4 theme-card-elevated rounded-lg theme-hover-lift">
                            <DollarSign className="w-8 h-8 theme-accent mx-auto mb-2" />
                            <p className="text-sm theme-text-secondary">Total Balance</p>
                            <p className="text-lg font-bold theme-text">PKR {(userDetails?.calculatedTotalBalance || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-center p-4 theme-card-elevated rounded-lg theme-hover-lift">
                            <Calendar className="w-8 h-8 theme-accent mx-auto mb-2" />
                            <p className="text-sm theme-text-secondary">Last Transaction</p>
                            <p className="text-lg font-bold theme-text">
                                {userDetails?.calculatedLastTransaction ? new Date(userDetails.calculatedLastTransaction).toLocaleDateString() : 'None'}
                            </p>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="mt-6">
                        <h3 className="font-semibold theme-heading-2 mb-4">Recent Transactions</h3>
                        {recentTransactions.length > 0 ? (
                            <div className="space-y-2">
                                {recentTransactions.slice(0, 5).map((transaction, index) => (
                                    <div key={transaction._id || index} className="flex items-center justify-between p-3 theme-surface rounded-lg">
                                        <div>
                                            <p className="font-medium theme-text">{transaction.description}</p>
                                            <p className="text-sm theme-text-secondary">
                                                {new Date(transaction.createdAt).toLocaleDateString()} • {transaction.transactionId}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold theme-text">PKR {transaction.amount?.toLocaleString() || 0}</p>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status === 'completed')}`}>
                                                {transaction.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="theme-text-secondary text-center py-4">No recent transactions found</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex space-x-3">
                        <button
                            onClick={() => handleUserAction(userData._id, userData.isActive ? 'deactivate' : 'activate')}
                            className={`flex-1 px-4 py-2 rounded-lg transition-all theme-hover-lift ${userData.isActive
                                ? 'theme-error-bg hover:opacity-90'
                                : 'theme-success-bg hover:opacity-90'
                                }`}
                        >
                            {userData.isActive ? 'Deactivate' : 'Activate'} Account
                        </button>
                        <button
                            onClick={() => handleUserAction(userData._id, 'verify')}
                            className="flex-1 theme-btn-primary px-4 py-2 rounded-lg theme-hover-lift"
                        >
                            Verify Account
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    return (
        <div className="p-6 space-y-6 theme-container">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold theme-heading-1">User Management</h1>
                    <p className="theme-text-secondary">Manage and monitor user accounts</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="theme-btn-secondary px-4 py-2 rounded-lg flex items-center space-x-2 theme-hover-lift">
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                    <button className="theme-btn-primary px-4 py-2 rounded-lg flex items-center space-x-2 theme-hover-lift">
                        <Upload className="w-4 h-4" />
                        <span>Import</span>
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="theme-card-elevated rounded-lg p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search users by name, email, or customer number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 theme-input rounded-lg theme-focus-ring"
                        />
                    </div>

                    {/* Filter Controls */}
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all theme-hover-lift ${showFilters ? 'theme-accent-bg text-white' : 'theme-btn-secondary'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                        </button>

                        {/* Bulk Actions */}
                        {selectedUsers.length > 0 && (
                            <div className="flex items-center space-x-2">
                                <span className="text-sm theme-text-secondary">
                                    {selectedUsers.length} selected
                                </span>
                                <button
                                    onClick={() => handleBulkAction('activate')}
                                    className="px-3 py-1 theme-success-bg text-white rounded text-sm hover:opacity-90 transition-opacity"
                                >
                                    Activate
                                </button>
                                <button
                                    onClick={() => handleBulkAction('deactivate')}
                                    className="px-3 py-1 theme-error-bg text-white rounded text-sm hover:opacity-90 transition-opacity"
                                >
                                    Deactivate
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 theme-surface rounded-lg"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium theme-text-secondary mb-1">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="w-full theme-input rounded theme-focus-ring"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium theme-text-secondary mb-1">Role</label>
                                <select
                                    value={filters.role}
                                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                                    className="w-full theme-input rounded theme-focus-ring"
                                >
                                    <option value="">All Roles</option>
                                    <option value="customer">Customer</option>
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium theme-text-secondary mb-1">Verification</label>
                                <select
                                    value={filters.verificationStatus}
                                    onChange={(e) => setFilters({ ...filters, verificationStatus: e.target.value })}
                                    className="w-full theme-input rounded theme-focus-ring"
                                >
                                    <option value="all">All Verification</option>
                                    <option value="verified">Verified</option>
                                    <option value="unverified">Unverified</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium theme-text-secondary mb-1">Joined</label>
                                <select
                                    value={filters.joinedDate}
                                    onChange={(e) => setFilters({ ...filters, joinedDate: e.target.value })}
                                    className="w-full theme-input rounded theme-focus-ring"
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Users Table */}
            <div className="theme-card-elevated rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="theme-surface">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.length === users.length && users.length > 0}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedUsers(users.map(user => user._id));
                                            } else {
                                                setSelectedUsers([]);
                                            }
                                        }}
                                        className="rounded theme-focus-ring"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                    Last Login
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium theme-text-secondary uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y theme-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current theme-accent"></div>
                                            <span className="ml-2 theme-text-secondary">Loading users...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center">
                                        <Users className="w-12 h-12 theme-text-muted mx-auto mb-4" />
                                        <p className="theme-text-secondary">No users found</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <motion.tr
                                        key={user._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:theme-surface transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedUsers([...selectedUsers, user._id]);
                                                    } else {
                                                        setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                                                    }
                                                }}
                                                className="rounded theme-focus-ring"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 theme-accent-bg bg-opacity-10 rounded-full flex items-center justify-center">
                                                    {user.profilePicture.url ? (
                                                        <img
                                                            src={user.profilePicture.url}
                                                            alt={`${user.firstName} ${user.lastName}`}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="theme-accent-background font-medium">
                                                            {user.firstName?.[0]}{user.lastName?.[0]}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium theme-text">
                                                        {user.fullName || `${user.firstName} ${user.lastName}`}
                                                    </div>
                                                    <div className="text-sm theme-text-secondary">{user.email}</div>
                                                    <div className="text-xs theme-text-muted">{user.customerNumber}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col space-y-1">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full justify-center text-xs ${getStatusColor(user.isActive)}`}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                {!user.isEmailVerified && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs theme-warning bg-orange-50 dark:bg-orange-900/20">
                                                        Unverified
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getRoleColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm theme-text">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm theme-text">
                                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowUserDetails(true);
                                                    }}
                                                    className="p-2 rounded-lg theme-btn-ghost theme-icon hover:theme-text transition-colors theme-hover-lift"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleUserAction(user._id, user.isActive ? 'deactivate' : 'activate')}
                                                    className={`p-2 rounded-lg transition-colors theme-hover-lift ${user.isActive
                                                        ? 'hover:bg-red-50 dark:hover:bg-red-900/20 theme-error'
                                                        : 'hover:bg-green-50 dark:hover:bg-green-900/20 theme-success'
                                                        }`}
                                                    title={user.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="px-6 py-4 border-t theme-border flex items-center justify-between">
                        <div className="text-sm theme-text-secondary">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="px-3 py-1 rounded theme-btn-secondary disabled:opacity-50 transition-opacity theme-hover-lift"
                            >
                                Previous
                            </button>
                            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                const page = i + 1;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                                        className={`px-3 py-1 rounded transition-all theme-hover-lift ${pagination.page === page
                                            ? 'theme-accent-bg text-white'
                                            : 'theme-btn-secondary'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.pages}
                                className="px-3 py-1 rounded theme-btn-secondary disabled:opacity-50 transition-opacity theme-hover-lift"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            <AnimatePresence>
                {showUserDetails && selectedUser && (
                    <UserDetailsModal
                        user={selectedUser}
                        onClose={() => {
                            setShowUserDetails(false);
                            setSelectedUser(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserManagement;
