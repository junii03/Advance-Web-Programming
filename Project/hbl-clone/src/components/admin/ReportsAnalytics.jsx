/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    Download,
    Calendar,
    Filter,
    FileText,
    PieChart,
    Activity,
    DollarSign,
    Users,
    CreditCard,
    AlertCircle
} from 'lucide-react';
import adminService from '../../services/adminService';

const ReportsAnalytics = () => {
    const [reportType, setReportType] = useState('transactions');
    const [dateRange, setDateRange] = useState('month');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState('');
    const [customDate, setCustomDate] = useState({
        startDate: '',
        endDate: ''
    });

    const reportTypes = [
        { id: 'transactions', name: 'Transaction Reports', icon: BarChart3, color: 'blue' },
        { id: 'users', name: 'User Analytics', icon: Users, color: 'green' },
        { id: 'accounts', name: 'Account Reports', icon: CreditCard, color: 'purple' }
    ];

    const dateRanges = [
        { id: 'today', name: 'Today' },
        { id: 'week', name: 'This Week' },
        { id: 'month', name: 'This Month' },
        { id: 'quarter', name: 'This Quarter' },
        { id: 'year', name: 'This Year' },
        { id: 'custom', name: 'Custom Range' }
    ];

    useEffect(() => {
        generateReport();
    }, [reportType, dateRange]);

    const generateReport = async () => {
        try {
            setLoading(true);
            setError('');

            const startDate = customDate.startDate || getDateRangeStart(dateRange);
            const endDate = customDate.endDate || new Date().toISOString().split('T')[0];

            const processedData = await adminService.generateReport(reportType, startDate, endDate);
            setReportData(processedData);
        } catch (error) {
            console.error('Error generating report:', error);
            setError(error.message || 'Failed to generate report');
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    const getDateRangeStart = (range) => {
        const now = new Date();
        switch (range) {
            case 'today':
                return now.toISOString().split('T')[0];
            case 'week':
                {
                    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                    return weekStart.toISOString().split('T')[0];
                }
            case 'month':
                return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            case 'quarter':
                {
                    const quarter = Math.floor(now.getMonth() / 3);
                    return new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
                }
            case 'year':
                return new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
            default:
                return new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];
        }
    };

    const exportReport = async (format) => {
        try {
            setLoading(true);
            const blob = await adminService.exportReport(reportType, dateRange, format);

            // Handle file download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${reportType}_report_${dateRange}.${format}`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting report:', error);
            setError('Failed to export report');
        } finally {
            setLoading(false);
        }
    };

    const TransactionChart = ({ data }) => {
        if (!data || !data.dailyTransactions || data.dailyTransactions.length === 0) {
            return (
                <div className="space-y-4">
                    <h3 className="font-semibold theme-heading-1">
                        {reportType === 'transactions' ? 'Transaction Volume Trends' :
                            reportType === 'users' ? 'User Registration Trends' :
                                'Account Balance Trends'}
                    </h3>
                    <div className="h-64 flex items-center justify-center theme-surface rounded-lg">
                        <div className="text-center">
                            <BarChart3 className="w-12 h-12 theme-text-muted mx-auto mb-4" />
                            <p className="theme-text-secondary">No chart data available for this period</p>
                        </div>
                    </div>
                </div>
            );
        }

        const chartData = data.dailyTransactions;

        // Enhanced calculations with better handling of edge cases
        const values = chartData.map(d => d.amount || 0);
        const counts = chartData.map(d => d.count || 0);

        const maxValue = Math.max(...values, 1); // Ensure minimum of 1 to avoid division by zero
        const minValue = Math.min(...values);
        const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;

        // Calculate median for better data insights
        const sortedValues = [...values].sort((a, b) => a - b);
        const medianValue = sortedValues.length % 2 === 0
            ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
            : sortedValues[Math.floor(sortedValues.length / 2)];

        // Better scaling with padding
        const chartPadding = maxValue * 0.1; // 10% padding at top
        const scaledMaxValue = maxValue + chartPadding;

        // Improved grid lines calculation
        const getGridValues = () => {
            const steps = 5;
            const stepSize = scaledMaxValue / steps;
            return Array.from({ length: steps + 1 }, (_, i) => stepSize * i);
        };

        const gridValues = getGridValues();

        // Theme-aware color scheme using CSS variables
        const getBarColor = (value, index) => {
            const intensity = maxValue > 0 ? (value / maxValue) : 0;
            const baseOpacity = 0.3;
            const maxOpacity = 0.85;
            const opacity = baseOpacity + (intensity * (maxOpacity - baseOpacity));

            // Use CSS custom properties for theme consistency
            const rootStyles = getComputedStyle(document.documentElement);
            const accentColor = rootStyles.getPropertyValue('--color-accent').trim();

            switch (reportType) {
                case 'transactions':
                    return `rgba(20, 184, 166, ${opacity})`; // Teal theme accent
                case 'users':
                    return `rgba(16, 185, 129, ${opacity})`; // Emerald
                case 'accounts':
                    return `rgba(139, 92, 246, ${opacity})`; // Violet
                default:
                    return `rgba(20, 184, 166, ${opacity})`;
            }
        };

        const getBarHoverColor = (value, index) => {
            switch (reportType) {
                case 'transactions':
                    return 'rgba(15, 118, 110, 0.95)'; // Darker teal
                case 'users':
                    return 'rgba(5, 150, 105, 0.95)'; // Darker emerald
                case 'accounts':
                    return 'rgba(124, 58, 237, 0.95)'; // Darker violet
                default:
                    return 'rgba(15, 118, 110, 0.95)';
            }
        };

        // Format large numbers
        const formatValue = (value) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
            return Math.round(value).toString();
        };

        // Calculate trend
        const getTrend = () => {
            if (chartData.length < 2) return { direction: 'neutral', percentage: 0 };

            const firstValue = chartData[0]?.amount || 0;
            const lastValue = chartData[chartData.length - 1]?.amount || 0;

            if (firstValue === 0) return { direction: 'neutral', percentage: 0 };

            const percentage = ((lastValue - firstValue) / firstValue) * 100;
            const direction = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral';

            return { direction, percentage: Math.abs(percentage) };
        };

        const trend = getTrend();

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold theme-heading-1 text-lg">
                            {reportType === 'transactions' ? 'Transaction Volume Trends' :
                                reportType === 'users' ? 'User Registration Trends' :
                                    'Account Balance Trends'}
                        </h3>
                        <p className="text-sm theme-text-secondary mt-1">
                            {chartData.length} day period analysis
                        </p>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full theme-accent-bg"></div>
                            <span className="theme-text-secondary">
                                Avg: {reportType === 'transactions' ?
                                    `PKR ${formatValue(avgValue)}` :
                                    formatValue(avgValue)}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="theme-text-secondary">
                                Median: {reportType === 'transactions' ?
                                    `PKR ${formatValue(medianValue)}` :
                                    formatValue(medianValue)}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${trend.direction === 'up' ? 'theme-success bg-green-100 dark:bg-green-900/20' :
                                    trend.direction === 'down' ? 'theme-error bg-red-100 dark:bg-red-900/20' :
                                        'theme-text-secondary theme-surface'
                                }`}>
                                <TrendingUp className={`w-3 h-3 ${trend.direction === 'down' ? 'rotate-180' : ''
                                    }`} />
                                <span>{trend.percentage.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Chart Container */}
                <div className="relative h-96 theme-card-elevated rounded-xl p-6 border theme-border">
                    {/* Y-axis labels with better formatting */}
                    <div className="absolute left-0 top-6 bottom-16 flex flex-col justify-between text-xs theme-text-muted">
                        {gridValues.reverse().map((value, index) => (
                            <span key={index} className="text-right pr-2">
                                {formatValue(value)}
                            </span>
                        ))}
                    </div>

                    {/* Enhanced Grid lines */}
                    <div className="absolute left-16 right-6 top-6 bottom-16">
                        {gridValues.map((value, index) => (
                            <div
                                key={index}
                                className="absolute w-full border-t theme-border opacity-30"
                                style={{ top: `${(index / (gridValues.length - 1)) * 100}%` }}
                            />
                        ))}
                    </div>

                    {/* Chart bars with FIXED height calculations */}
                    <div className="absolute left-16 right-6 top-6 bottom-16 flex items-end justify-between">
                        {chartData.map((item, index) => {
                            const value = item.amount || 0;
                            // FIXED: Calculate height as pixels based on container height
                            const containerHeight = 320; // 96 * 4 = 384px minus padding
                            const heightPixels = scaledMaxValue > 0 ? Math.max((value / scaledMaxValue) * containerHeight, 2) : 2;
                            const barColor = getBarColor(value, index);
                            const hoverColor = getBarHoverColor(value, index);

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: heightPixels, opacity: 1 }}
                                    transition={{
                                        duration: 0.8,
                                        delay: index * 0.05,
                                        ease: "easeOut"
                                    }}
                                    className="group relative flex flex-col items-center flex-1 mx-0.5"
                                >
                                    {/* Enhanced Tooltip */}
                                    <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none">
                                        <div className="theme-modal-card px-4 py-3 rounded-xl text-xs whitespace-nowrap shadow-xl border theme-border">
                                            <div className="font-semibold theme-heading-2 mb-1">
                                                {new Date(item.date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between space-x-3">
                                                    <span className="theme-text-secondary">
                                                        {reportType === 'transactions' ? 'Volume:' :
                                                            reportType === 'users' ? 'Registrations:' :
                                                                'Balance:'}
                                                    </span>
                                                    <span className="font-semibold theme-text">
                                                        {reportType === 'transactions' || reportType === 'accounts' ?
                                                            `PKR ${value.toLocaleString()}` :
                                                            value.toLocaleString()}
                                                    </span>
                                                </div>
                                                {reportType === 'transactions' && item.count && (
                                                    <div className="flex items-center justify-between space-x-3">
                                                        <span className="theme-text-secondary">Count:</span>
                                                        <span className="font-medium theme-text">{item.count}</span>
                                                    </div>
                                                )}
                                                {reportType === 'transactions' && item.count && value > 0 && (
                                                    <div className="flex items-center justify-between space-x-3">
                                                        <span className="theme-text-secondary">Avg:</span>
                                                        <span className="font-medium theme-text">
                                                            PKR {Math.round(value / item.count).toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Theme-aware tooltip arrow */}
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-current opacity-20"></div>
                                        </div>
                                    </div>

                                    {/* Enhanced Bar with theme colors and FIXED height */}
                                    <div
                                        className="w-full rounded-t-lg transition-all duration-300 cursor-pointer relative overflow-hidden shadow-sm hover:shadow-md hover:theme-hover-lift"
                                        style={{
                                            height: `${heightPixels}px`,
                                            background: `linear-gradient(to top, ${barColor}, ${barColor.replace(/[\d.]+\)$/g, '0.7)')})`,
                                            minHeight: '2px',
                                            maxWidth: '32px',
                                            border: '1px solid rgba(var(--color-border-rgb), 0.2)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = `linear-gradient(to top, ${hoverColor}, ${hoverColor.replace(/[\d.]+\)$/g, '0.8)')})`;
                                            e.target.style.transform = 'translateY(-2px) scaleX(1.05)';
                                            e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                                            e.target.style.borderColor = 'var(--color-accent)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = `linear-gradient(to top, ${barColor}, ${barColor.replace(/[\d.]+\)$/g, '0.7)')})`;
                                            e.target.style.transform = 'translateY(0) scaleX(1)';
                                            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                            e.target.style.borderColor = 'rgba(var(--color-border-rgb), 0.2)';
                                        }}
                                    >
                                        {/* Theme-aware shimmer effect for high values */}
                                        {value > avgValue && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-10 animate-pulse"
                                                style={{ animationDuration: '2s', color: 'var(--color-accent)' }} />
                                        )}

                                        {/* Peak indicator with theme colors */}
                                        {value === maxValue && (
                                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                                <div className="w-2 h-2 theme-warning-bg rounded-full animate-pulse shadow-sm"></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Enhanced X-axis labels */}
                                    <div className="mt-3 text-xs theme-text-muted text-center">
                                        <div className="transform -rotate-45 origin-center whitespace-nowrap font-medium">
                                            {new Date(item.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Enhanced Average line with theme colors */}
                    {scaledMaxValue > 0 && (
                        <div
                            className="absolute left-16 right-6 border-t-2 border-dashed theme-accent opacity-60 pointer-events-none"
                            style={{ bottom: `${64 + ((avgValue / scaledMaxValue) * 320)}px` }}
                        >
                            <div className="absolute -right-4 -top-4 text-xs theme-accent font-semibold theme-card px-2 py-1 rounded-md border theme-border shadow-sm">
                                Avg: {formatValue(avgValue)}
                            </div>
                        </div>
                    )}

                    {/* Median line with theme colors */}
                    {scaledMaxValue > 0 && medianValue !== avgValue && (
                        <div
                            className="absolute left-16 right-6 border-t-2 border-dotted border-emerald-500 opacity-50 pointer-events-none"
                            style={{ bottom: `${64 + ((medianValue / scaledMaxValue) * 320)}px` }}
                        >
                            <div className="absolute -right-4 -top-4 text-xs text-emerald-600 dark:text-emerald-400 font-medium theme-card px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 shadow-sm">
                                Med: {formatValue(medianValue)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Enhanced Chart Summary with theme colors */}
                <div className="theme-surface rounded-xl p-4 border theme-border">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                        <div className="flex flex-wrap items-center gap-6 text-sm theme-text-secondary">
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 theme-icon" />
                                <span>Period: <span className="font-semibold theme-text">{chartData.length} days</span></span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 theme-icon" />
                                <span>Total: <span className="font-semibold theme-text">
                                    {reportType === 'transactions' || reportType === 'accounts' ?
                                        `PKR ${chartData.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}` :
                                        chartData.reduce((sum, d) => sum + (d.count || 0), 0).toLocaleString()}
                                </span></span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <BarChart3 className="w-4 h-4 theme-icon" />
                                <span>Peak: <span className="font-semibold theme-text">
                                    {reportType === 'transactions' || reportType === 'accounts' ?
                                        `PKR ${maxValue.toLocaleString()}` :
                                        maxValue.toLocaleString()}
                                </span></span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium border ${trend.direction === 'up' ? 'theme-success bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                                    trend.direction === 'down' ? 'theme-error bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                                        'theme-text-secondary theme-surface theme-border'
                                }`}>
                                <Activity className="w-4 h-4" />
                                <span>
                                    {trend.direction === 'up' ? 'Growth' : trend.direction === 'down' ? 'Decline' : 'Stable'}:
                                    <span className="ml-1 font-bold">{trend.percentage.toFixed(1)}%</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const MetricsGrid = ({ data }) => {
        if (!data) return null;

        const getMetrics = () => {
            switch (reportType) {
                case 'transactions':
                    return [
                        {
                            title: 'Total Volume',
                            value: `PKR ${(data.totalVolume || 0).toLocaleString()}`,
                            change: data.volumeChange || '+0%',
                            icon: DollarSign,
                            color: 'green'
                        },
                        {
                            title: 'Transaction Count',
                            value: (data.totalCount || 0).toLocaleString(),
                            change: data.countChange || '+0%',
                            icon: Activity,
                            color: 'blue'
                        },
                        {
                            title: 'Average Transaction',
                            value: `PKR ${(data.averageAmount || 0).toLocaleString()}`,
                            change: data.avgChange || '+0%',
                            icon: BarChart3,
                            color: 'purple'
                        },
                        {
                            title: 'Success Rate',
                            value: `${(data.successRate || 0).toFixed(1)}%`,
                            change: data.successChange || '+0%',
                            icon: TrendingUp,
                            color: 'orange'
                        }
                    ];
                case 'users':
                    return [
                        {
                            title: 'New Users',
                            value: (data.totalCount || 0).toLocaleString(),
                            change: data.countChange || '+0%',
                            icon: Users,
                            color: 'green'
                        },
                        {
                            title: 'Total Registrations',
                            value: (data.totalVolume || 0).toLocaleString(),
                            change: data.volumeChange || '+0%',
                            icon: Activity,
                            color: 'blue'
                        },
                        {
                            title: 'Verification Rate',
                            value: `${(data.successRate || 0).toFixed(1)}%`,
                            change: data.successChange || '+0%',
                            icon: TrendingUp,
                            color: 'purple'
                        },
                        {
                            title: 'Daily Average',
                            value: Math.round((data.totalCount || 0) / 30).toString(),
                            change: '+0%',
                            icon: BarChart3,
                            color: 'orange'
                        }
                    ];
                case 'accounts':
                    return [
                        {
                            title: 'Total Balance',
                            value: `PKR ${(data.totalVolume || 0).toLocaleString()}`,
                            change: data.volumeChange || '+0%',
                            icon: DollarSign,
                            color: 'green'
                        },
                        {
                            title: 'Account Count',
                            value: (data.totalCount || 0).toLocaleString(),
                            change: data.countChange || '+0%',
                            icon: CreditCard,
                            color: 'blue'
                        },
                        {
                            title: 'Average Balance',
                            value: `PKR ${(data.averageAmount || 0).toLocaleString()}`,
                            change: data.avgChange || '+0%',
                            icon: BarChart3,
                            color: 'purple'
                        },
                        {
                            title: 'Active Rate',
                            value: `${(data.successRate || 0).toFixed(1)}%`,
                            change: data.successChange || '+0%',
                            icon: TrendingUp,
                            color: 'orange'
                        }
                    ];
                default:
                    return [];
            }
        };

        const metrics = getMetrics();

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    const isPositive = metric.change.startsWith('+');

                    return (
                        <motion.div
                            key={metric.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="theme-card-elevated rounded-lg p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg bg-${metric.color}-100 text-${metric.color}-600`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {metric.change}
                                </span>
                            </div>
                            <h3 className="text-sm theme-text-secondary mb-1">{metric.title}</h3>
                            <p className="text-2xl font-bold theme-heading-1">{metric.value}</p>
                        </motion.div>
                    );
                })}
            </div>
        );
    };

    const DataTable = ({ data }) => {
        if (!data || !data.tableData || data.tableData.length === 0) {
            return (
                <div className="theme-card-elevated rounded-lg p-8 text-center">
                    <FileText className="w-12 h-12 theme-text-muted mx-auto mb-4" />
                    <h3 className="text-lg font-medium theme-heading-1 mb-2">No Table Data Available</h3>
                    <p className="theme-text-secondary">No detailed breakdown data for this period</p>
                </div>
            );
        }

        return (
            <div className="theme-card-elevated rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b theme-border theme-surface">
                    <h3 className="font-semibold theme-heading-1">Detailed Breakdown</h3>
                    <p className="text-sm theme-text-secondary mt-1">
                        Comprehensive data analysis for the selected period
                    </p>
                </div>
                <div className="overflow-x-auto theme-scrollbar">
                    <table className="w-full">
                        <thead className="theme-surface">
                            <tr className="theme-border">
                                {data.tableHeaders?.map((header, index) => (
                                    <th key={index} className="px-6 py-4 text-left text-xs font-semibold theme-text-secondary uppercase tracking-wider border-b theme-border">
                                        <div className="flex items-center space-x-2">
                                            <span>{header}</span>
                                            {index === 0 && <Calendar className="w-3 h-3 theme-icon" />}
                                            {(header.toLowerCase().includes('volume') || header.toLowerCase().includes('balance')) && <DollarSign className="w-3 h-3 theme-icon" />}
                                            {header.toLowerCase().includes('count') && <BarChart3 className="w-3 h-3 theme-icon" />}
                                            {header.toLowerCase().includes('average') && <TrendingUp className="w-3 h-3 theme-icon" />}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y theme-border theme-bg">
                            {data.tableData.map((row, index) => (
                                <tr
                                    key={index}
                                    className="hover:theme-surface transition-colors duration-200 theme-hover-lift"
                                >
                                    {Object.values(row).map((cell, cellIndex) => (
                                        <td key={cellIndex} className="px-6 py-4 text-sm theme-text whitespace-nowrap">
                                            <div className="flex items-center">
                                                {cellIndex === 0 ? (
                                                    // Date column with special formatting
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-2 h-2 rounded-full theme-accent-bg"></div>
                                                        <span className="font-medium">
                                                            {typeof cell === 'string' && cell.includes('/') ?
                                                                new Date(cell).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                }) : cell}
                                                        </span>
                                                    </div>
                                                ) : typeof cell === 'string' && cell.includes('PKR') ? (
                                                    // Currency values with special styling
                                                    <div className="flex items-center space-x-2">
                                                        <DollarSign className="w-4 h-4 theme-success" />
                                                        <span className="font-semibold theme-success">
                                                            {cell}
                                                        </span>
                                                    </div>
                                                ) : typeof cell === 'number' ? (
                                                    // Numeric values with badge styling
                                                    <div className="flex items-center">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium theme-surface theme-text-secondary border theme-border">
                                                            {cell > 1000 ? cell.toLocaleString() : cell}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    // Regular text values
                                                    <span className="theme-text">
                                                        {typeof cell === 'number' && cell > 1000
                                                            ? cell.toLocaleString()
                                                            : cell
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer with Summary */}
                <div className="px-6 py-4 theme-surface border-t theme-border">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-4 text-sm theme-text-secondary">
                            <div className="flex items-center space-x-2">
                                <Activity className="w-4 h-4 theme-icon" />
                                <span>Total Records: <span className="font-medium theme-text">{data.tableData.length}</span></span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 theme-icon" />
                                <span>Report Type: <span className="font-medium theme-accent capitalize">{reportType}</span></span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => exportReport('csv')}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium theme-btn-secondary rounded-md transition-all duration-200 hover:theme-hover-scale"
                            >
                                <Download className="w-3 h-3 mr-1" />
                                Export Table
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ErrorDisplay = ({ message }) => (
        <div className="theme-card-elevated rounded-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium theme-heading-1 mb-2">Error Loading Report</h3>
            <p className="theme-text-secondary mb-4">{message}</p>
            <button
                onClick={generateReport}
                className="theme-btn-primary px-4 py-2 rounded-lg"
            >
                Retry
            </button>
        </div>
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold theme-heading-1">Reports & Analytics</h1>
                    <p className="theme-text-secondary">Generate comprehensive reports and analyze system performance</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => exportReport('csv')}
                        className="theme-btn-secondary px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                    <button
                        onClick={() => exportReport('pdf')}
                        className="theme-btn-primary px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                        <FileText className="w-4 h-4" />
                        <span>Export PDF</span>
                    </button>
                </div>
            </div>

            {/* Report Configuration */}
            <div className="theme-card-elevated rounded-lg p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Report Type Selection */}
                    <div>
                        <label className="block text-sm font-medium theme-text-secondary mb-3">Report Type</label>
                        <div className="space-y-2">
                            {reportTypes.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => setReportType(type.id)}
                                        className={`w-full p-3 rounded-lg flex items-center space-x-3 transition-colors ${reportType === type.id
                                            ? 'theme-accent-bg text-white'
                                            : 'theme-card hover:theme-card-hover'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{type.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Date Range Selection */}
                    <div>
                        <label className="block text-sm font-medium theme-text-secondary mb-3">Date Range</label>
                        <div className="space-y-2">
                            {dateRanges.map((range) => (
                                <button
                                    key={range.id}
                                    onClick={() => setDateRange(range.id)}
                                    className={`w-full p-2 rounded-lg text-left transition-colors ${dateRange === range.id
                                        ? 'theme-accent-bg text-white'
                                        : 'theme-card hover:theme-card-hover'
                                        }`}
                                >
                                    {range.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Date Range */}
                    {dateRange === 'custom' && (
                        <div>
                            <label className="block text-sm font-medium theme-text-secondary mb-3">Custom Date Range</label>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs theme-text-muted mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={customDate.startDate}
                                        onChange={(e) => setCustomDate({ ...customDate, startDate: e.target.value })}
                                        className="w-full theme-input rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs theme-text-muted mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={customDate.endDate}
                                        onChange={(e) => setCustomDate({ ...customDate, endDate: e.target.value })}
                                        className="w-full theme-input rounded-lg"
                                    />
                                </div>
                                <button
                                    onClick={generateReport}
                                    className="w-full theme-btn-primary py-2 rounded-lg"
                                >
                                    Generate Report
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Quick Filters */}
                    <div>
                        <label className="block text-sm font-medium theme-text-secondary mb-3">Quick Filters</label>
                        <div className="space-y-2">
                            <button className="w-full p-2 text-left theme-card hover:theme-card-hover rounded-lg">
                                High Value Transactions ({'>'}100K)
                            </button>
                            <button className="w-full p-2 text-left theme-card hover:theme-card-hover rounded-lg">
                                Failed Transactions
                            </button>
                            <button className="w-full p-2 text-left theme-card hover:theme-card-hover rounded-lg">
                                New User Registrations
                            </button>
                            <button className="w-full p-2 text-left theme-card hover:theme-card-hover rounded-lg">
                                Account Openings
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Content */}
            {loading ? (
                <div className="theme-card-elevated rounded-lg p-8">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 theme-accent-border"></div>
                        <span className="ml-3 theme-text-secondary">Generating report...</span>
                    </div>
                </div>
            ) : error ? (
                <ErrorDisplay message={error} />
            ) : reportData ? (
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <MetricsGrid data={reportData} />

                    {/* Charts and Visualizations */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Main Chart */}
                        <div className="theme-card-elevated rounded-lg p-6">
                            <TransactionChart data={reportData} />
                        </div>

                        {/* Secondary Stats */}
                        <div className="theme-card-elevated rounded-lg p-6">
                            <h3 className="font-semibold theme-heading-1 mb-4">Distribution Analysis</h3>
                            <div className="space-y-4">
                                {reportData.distribution?.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm theme-text">{item.category}</span>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="h-2 bg-blue-500 rounded-full"
                                                    style={{ width: `${item.percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium theme-text w-12 text-right">
                                                {item.percentage}%
                                            </span>
                                        </div>
                                    </div>
                                )) || (
                                        <div className="text-center py-8">
                                            <PieChart className="w-12 h-12 theme-text-muted mx-auto mb-4" />
                                            <p className="theme-text-secondary">No distribution data available</p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Data Table */}
                    <DataTable data={reportData} />

                    {/* Insights and Recommendations */}
                    <div className="theme-card-elevated rounded-lg p-6">
                        <h3 className="font-semibold theme-heading-1 mb-4">Key Insights & Recommendations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium theme-text mb-3">Positive Trends</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-green-600">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-sm">Transaction volume increased by 15.3%</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-green-600">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-sm">User registration up 12.5%</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-green-600">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-sm">System uptime at 99.9%</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium theme-text mb-3">Areas for Attention</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-orange-600">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm">5 high-value loans pending approval</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-orange-600">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm">Peak hour response time increased</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-orange-600">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm">15% increase in failed login attempts</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="theme-card-elevated rounded-lg p-8 text-center">
                    <BarChart3 className="w-16 h-16 theme-text-muted mx-auto mb-4" />
                    <h3 className="text-lg font-medium theme-heading-1 mb-2">No Report Generated</h3>
                    <p className="theme-text-secondary">Select a report type and date range to generate your report</p>
                </div>
            )}
        </div>
    );
};

export default ReportsAnalytics;
