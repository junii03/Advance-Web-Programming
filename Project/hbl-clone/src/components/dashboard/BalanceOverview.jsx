/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const statsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    }
};

const numberCountVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

const BalanceOverview = ({
    formattedTotalBalance,
    showBalance,
    onToggleBalance,
    quickStats
}) => {
    return (
        <motion.div
            className="theme-card-elevated rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="flex items-center justify-between mb-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2 className="text-lg font-semibold theme-heading-1">Total Balance</h2>
                    <p className="text-sm theme-text-muted">Across all accounts</p>
                </motion.div>
                <motion.button
                    onClick={onToggleBalance}
                    className="p-2 rounded-lg theme-card hover:theme-card-hover"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <motion.div
                        key={showBalance ? 'visible' : 'hidden'}
                        initial={{ rotate: 0, scale: 0.8 }}
                        animate={{ rotate: 360, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </motion.div>
                </motion.button>
            </div>

            <motion.div
                className="text-3xl font-bold theme-heading-1 mb-6"
                key={showBalance ? 'balance-shown' : 'balance-hidden'}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                {showBalance ? formattedTotalBalance : '••••••••'}
            </motion.div>

            {/* Quick Stats */}
            <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, staggerChildren: 0.1 }}
            >
                <motion.div
                    className="text-center"
                    variants={statsVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.05 }}
                >
                    <motion.div
                        className="text-2xl font-bold theme-accent"
                        variants={numberCountVariants}
                    >
                        {quickStats.totalAccounts}
                    </motion.div>
                    <div className="text-sm theme-text-muted">Total Accounts</div>
                </motion.div>
                <motion.div
                    className="text-center"
                    variants={statsVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.05 }}
                >
                    <motion.div
                        className="text-2xl font-bold text-green-600"
                        variants={numberCountVariants}
                    >
                        {quickStats.todayTransactions}
                    </motion.div>
                    <div className="text-sm theme-text-muted">Today's Transactions</div>
                </motion.div>
                <motion.div
                    className="text-center"
                    variants={statsVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.05 }}
                >
                    <motion.div
                        className="text-2xl font-bold text-blue-600"
                        variants={numberCountVariants}
                    >
                        {quickStats.activeAccounts}
                    </motion.div>
                    <div className="text-sm theme-text-muted">Active Accounts</div>
                </motion.div>
                <motion.div
                    className="text-center"
                    variants={statsVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.05 }}
                >
                    <motion.div
                        className="text-2xl font-bold text-orange-600"
                        variants={numberCountVariants}
                    >
                        {quickStats.pendingTransactions}
                    </motion.div>
                    <div className="text-sm theme-text-muted">Pending</div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default BalanceOverview;
