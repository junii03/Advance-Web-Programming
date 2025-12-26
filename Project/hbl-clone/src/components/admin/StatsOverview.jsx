/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Users,
    DollarSign,
    CreditCard,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    AlertTriangle
} from 'lucide-react';

const StatsOverview = ({ stats }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('today');
    const [comparisonData, setComparisonData] = useState(null);

    if (!stats) return null;

    // Enhanced stats with trends and comparisons
    const enhancedStats = [
        {
            title: 'Total Users',
            value: stats.users?.total || 0,
            change: '+12.5%',
            changeType: 'increase',
            icon: Users,
            color: 'blue',
            details: `${stats.users?.active || 0} active`,
            trend: [65, 70, 75, 80, 85, 90, 95]
        },
        {
            title: 'Active Accounts',
            value: stats.accounts?.active || 0,
            change: '+8.2%',
            changeType: 'increase',
            icon: CreditCard,
            color: 'green',
            details: `${stats.accounts?.total || 0} total`,
            trend: [45, 50, 55, 60, 58, 62, 65]
        },
        {
            title: 'Transaction Volume',
            value: `PKR ${(stats.transactions?.volume?.totalAmount || 0).toLocaleString()}`,
            change: '+15.3%',
            changeType: 'increase',
            icon: DollarSign,
            color: 'purple',
            details: `${stats.transactions?.total || 0} transactions`,
            trend: [100, 120, 110, 130, 145, 160, 155]
        },
        {
            title: 'Flagged Transactions',
            value: stats.flaggedTransactions?.length || 0,
            change: '-5.1%',
            changeType: 'decrease',
            icon: AlertTriangle,
            color: 'red',
            details: 'Requires attention',
            trend: [15, 12, 18, 10, 8, 6, 5],
            isAlert: true
        }
    ];

    const getColorClasses = (color, variant = 'primary') => {
        const colors = {
            blue: {
                primary: 'text-blue-600 bg-blue-100',
                bg: 'bg-blue-50',
                accent: 'text-blue-600'
            },
            green: {
                primary: 'text-green-600 bg-green-100',
                bg: 'bg-green-50',
                accent: 'text-green-600'
            },
            purple: {
                primary: 'text-purple-600 bg-purple-100',
                bg: 'bg-purple-50',
                accent: 'text-purple-600'
            },
            red: {
                primary: 'text-red-600 bg-red-100',
                bg: 'bg-red-50',
                accent: 'text-red-600'
            }
        };
        return colors[color]?.[variant] || colors.blue[variant];
    };

    const MiniChart = ({ data, color }) => {
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;

        return (
            <div className="flex items-end space-x-1 h-8">
                {data.map((value, index) => {
                    const height = ((value - min) / range) * 100;
                    return (
                        <div
                            key={index}
                            className={`w-1 ${getColorClasses(color, 'primary')} rounded-sm opacity-70`}
                            style={{ height: `${Math.max(height, 10)}%` }}
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold theme-heading-1">System Overview</h2>
                <div className="flex items-center space-x-2">
                    {['today', 'week', 'month', 'year'].map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${selectedPeriod === period
                                ? 'theme-accent-bg text-white'
                                : 'theme-card hover:theme-card-hover theme-text'
                                }`}
                        >
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {enhancedStats.map((stat, index) => {
                    const Icon = stat.icon;
                    const isIncrease = stat.changeType === 'increase';
                    const TrendIcon = isIncrease ? TrendingUp : TrendingDown;

                    return (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className={`theme-card-elevated rounded-lg p-6 relative overflow-hidden ${stat.isAlert ? 'ring-2 ring-red-200' : ''
                                }`}
                        >
                            {/* Background Pattern */}
                            <div className={`absolute top-0 right-0 w-32 h-32 ${getColorClasses(stat.color, 'bg')} rounded-full opacity-20 transform translate-x-16 -translate-y-16`} />

                            {/* Icon */}
                            <div className={`inline-flex items-center justify-center w-12 h-12 ${getColorClasses(stat.color, 'primary')} rounded-lg mb-4`}>
                                <Icon className="w-6 h-6" />
                            </div>

                            {/* Main Content */}
                            <div className="relative z-10">
                                <p className="text-sm theme-text-secondary mb-1">{stat.title}</p>
                                <p className="text-2xl font-bold theme-heading-1 mb-2">{stat.value}</p>

                                {/* Change Indicator */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1">
                                        <TrendIcon className={`w-4 h-4 ${isIncrease ? 'text-green-600' : 'text-red-600'
                                            }`} />
                                        <span className={`text-sm font-medium ${isIncrease ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {stat.change}
                                        </span>
                                    </div>
                                    <span className="text-xs theme-text-muted">{stat.details}</span>
                                </div>

                                {/* Mini Chart */}
                                <div className="mt-4">
                                    <MiniChart data={stat.trend} color={stat.color} />
                                </div>

                                {/* Alert Badge */}
                                {stat.isAlert && (
                                    <div className="absolute top-4 right-4">
                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Quick Insights */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="theme-card-elevated rounded-lg p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold theme-heading-1">Quick Insights</h3>
                    <button className="text-sm theme-accent hover:underline flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Peak Hours */}
                    <div className="text-center p-4 theme-card rounded-lg">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-lg mx-auto mb-2">
                            <Activity className="w-5 h-5" />
                        </div>
                        <p className="text-sm theme-text-secondary">Peak Hours</p>
                        <p className="font-semibold theme-text">2:00 PM - 4:00 PM</p>
                        <p className="text-xs theme-text-muted mt-1">40% of daily traffic</p>
                    </div>

                    {/* Top Transaction Type */}
                    <div className="text-center p-4 theme-card rounded-lg">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-lg mx-auto mb-2">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                        <p className="text-sm theme-text-secondary">Top Transaction</p>
                        <p className="font-semibold theme-text">Fund Transfers</p>
                        <p className="text-xs theme-text-muted mt-1">65% of all transactions</p>
                    </div>

                    {/* Average Processing Time */}
                    <div className="text-center p-4 theme-card rounded-lg">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-600 rounded-lg mx-auto mb-2">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <p className="text-sm theme-text-secondary">Avg. Processing</p>
                        <p className="font-semibold theme-text">1.2 seconds</p>
                        <p className="text-xs theme-text-muted mt-1">15% faster than last month</p>
                    </div>
                </div>
            </motion.div>

            {/* Performance Metrics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                {/* System Health */}
                <div className="theme-card-elevated rounded-lg p-6">
                    <h3 className="font-semibold theme-heading-1 mb-4">System Health</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'API Response Time', value: '120ms', status: 'good', percentage: 95 },
                            { label: 'Database Performance', value: '98.5%', status: 'excellent', percentage: 98.5 },
                            { label: 'Error Rate', value: '0.02%', status: 'good', percentage: 99.98 },
                            { label: 'Uptime', value: '99.9%', status: 'excellent', percentage: 99.9 }
                        ].map((metric) => (
                            <div key={metric.label} className="flex items-center justify-between">
                                <span className="text-sm theme-text-secondary">{metric.label}</span>
                                <div className="flex items-center space-x-3">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${metric.status === 'excellent' ? 'bg-green-500' : 'bg-blue-500'
                                                }`}
                                            style={{ width: `${metric.percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium theme-text w-16 text-right">
                                        {metric.value}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Summary */}
                <div className="theme-card-elevated rounded-lg p-6">
                    <h3 className="font-semibold theme-heading-1 mb-4">Activity Summary</h3>
                    <div className="space-y-3">
                        {[
                            { time: '2 min ago', action: 'New user registration', count: 3, type: 'user' },
                            { time: '5 min ago', action: 'High-value transactions', count: 2, type: 'transaction' },
                            { time: '8 min ago', action: 'Card requests approved', count: 5, type: 'card' },
                            { time: '12 min ago', action: 'Loan applications', count: 1, type: 'loan' }
                        ].map((activity, index) => (
                            <div key={index} className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-sm theme-text">{activity.action}</p>
                                    <p className="text-xs theme-text-muted">{activity.time}</p>
                                </div>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                    {activity.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StatsOverview;
