/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, DollarSign, Filter } from 'lucide-react';

const FilterPanel = ({ filters, onFilterChange, onClose }) => {
    const handleInputChange = (field, value) => {
        onFilterChange({ [field]: value });
    };

    const clearFilters = () => {
        onFilterChange({
            status: 'pending',
            loanType: '',
            minAmount: '',
            maxAmount: '',
            startDate: '',
            endDate: '',
            search: ''
        });
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.loanType) count++;
        if (filters.minAmount) count++;
        if (filters.maxAmount) count++;
        if (filters.startDate) count++;
        if (filters.endDate) count++;
        if (filters.search) count++;
        return count;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="theme-card rounded-lg p-6 border"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 theme-text" />
                    <h3 className="text-lg font-semibold theme-heading-1">Filters</h3>
                    {getActiveFiltersCount() > 0 && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                            {getActiveFiltersCount()} active
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={clearFilters}
                        className="text-sm theme-text-secondary hover:theme-text underline"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1 theme-btn-ghost rounded hover:theme-btn-ghost-hover"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                        Status
                    </label>
                    <select
                        value={filters.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full theme-input rounded-lg text-sm"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                {/* Loan Type Filter */}
                <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                        Loan Type
                    </label>
                    <select
                        value={filters.loanType}
                        onChange={(e) => handleInputChange('loanType', e.target.value)}
                        className="w-full theme-input rounded-lg text-sm"
                    >
                        <option value="">All Types</option>
                        <option value="personal">Personal Loan</option>
                        <option value="home">Home Loan</option>
                        <option value="car">Car Loan</option>
                        <option value="business">Business Loan</option>
                    </select>
                </div>

                {/* Amount Range */}
                <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                        Min Amount (PKR)
                    </label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-muted" />
                        <input
                            type="number"
                            placeholder="50,000"
                            value={filters.minAmount}
                            onChange={(e) => handleInputChange('minAmount', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 theme-input rounded-lg text-sm"
                            min="0"
                            step="10000"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                        Max Amount (PKR)
                    </label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-muted" />
                        <input
                            type="number"
                            placeholder="10,000,000"
                            value={filters.maxAmount}
                            onChange={(e) => handleInputChange('maxAmount', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 theme-input rounded-lg text-sm"
                            min="0"
                            step="10000"
                        />
                    </div>
                </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                        Start Date
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-muted" />
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 theme-input rounded-lg text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                        End Date
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-muted" />
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 theme-input rounded-lg text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Filter Presets */}
            <div className="mt-6">
                <label className="block text-sm font-medium theme-text-secondary mb-3">
                    Quick Filters
                </label>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleInputChange('status', 'pending')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filters.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Pending Only
                    </button>
                    <button
                        onClick={() => {
                            handleInputChange('minAmount', '1000000');
                            handleInputChange('maxAmount', '');
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filters.minAmount === '1000000'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        High Value ({'>'}1M)
                    </button>
                    <button
                        onClick={() => {
                            const today = new Date();
                            const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                            handleInputChange('startDate', lastWeek.toISOString().split('T')[0]);
                            handleInputChange('endDate', today.toISOString().split('T')[0]);
                        }}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                        Last 7 Days
                    </button>
                    <button
                        onClick={() => {
                            const today = new Date();
                            const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                            handleInputChange('startDate', lastMonth.toISOString().split('T')[0]);
                            handleInputChange('endDate', today.toISOString().split('T')[0]);
                        }}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                        Last 30 Days
                    </button>
                </div>
            </div>

            {/* Filter Summary */}
            {getActiveFiltersCount() > 0 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-2">Active Filters:</p>
                    <div className="flex flex-wrap gap-2">
                        {filters.loanType && (
                            <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">
                                Type: {filters.loanType}
                                <button
                                    onClick={() => handleInputChange('loanType', '')}
                                    className="ml-1 hover:text-blue-900"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {filters.minAmount && (
                            <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">
                                Min: PKR {Number(filters.minAmount).toLocaleString()}
                                <button
                                    onClick={() => handleInputChange('minAmount', '')}
                                    className="ml-1 hover:text-blue-900"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {filters.maxAmount && (
                            <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">
                                Max: PKR {Number(filters.maxAmount).toLocaleString()}
                                <button
                                    onClick={() => handleInputChange('maxAmount', '')}
                                    className="ml-1 hover:text-blue-900"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {filters.startDate && (
                            <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">
                                From: {filters.startDate}
                                <button
                                    onClick={() => handleInputChange('startDate', '')}
                                    className="ml-1 hover:text-blue-900"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {filters.endDate && (
                            <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">
                                To: {filters.endDate}
                                <button
                                    onClick={() => handleInputChange('endDate', '')}
                                    className="ml-1 hover:text-blue-900"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default FilterPanel;
