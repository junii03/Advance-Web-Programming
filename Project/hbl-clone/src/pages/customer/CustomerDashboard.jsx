import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import dashboardService from '../../services/dashboardService';

// Import modular components
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import BalanceOverview from '../../components/dashboard/BalanceOverview';
import QuickActions from '../../components/dashboard/QuickActions';
import AccountsList from '../../components/dashboard/AccountsList';
import RecentTransactions from '../../components/dashboard/RecentTransactions';
import PendingTransactions from '../../components/dashboard/PendingTransactions';
import MonthlyStats from '../../components/dashboard/MonthlyStats';
import SpendingCategories from '../../components/dashboard/SpendingCategories';
import CardsList from '../../components/dashboard/CardsList';
import { LoadingState, ErrorState } from '../../components/dashboard/DashboardStates';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Animation variants
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
            duration: 0.3,
            ease: "easeOut"
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    },
    hover: {
        scale: 1.02,
        transition: {
            duration: 0.2,
            ease: "easeInOut"
        }
    }
};

const slideInVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        }
    }
};

// Verification pending component
const VerificationPending = ({ user }) => {
    const pendingVerifications = [];
    if (!user.isEmailVerified) pendingVerifications.push('Email');
    if (!user.isPhoneVerified) pendingVerifications.push('Phone number');

    return (
        <motion.div
            className="max-w-4xl mx-auto p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                className="theme-card rounded-lg p-8 text-center"
                variants={cardVariants}
                whileHover="hover"
            >
                <motion.div
                    className="mb-6"
                    variants={itemVariants}
                >
                    <motion.div
                        className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4"
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    >
                        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </motion.div>
                    <h2 className="text-2xl font-bold theme-heading-2 mb-2">
                        Account Verification Pending
                    </h2>
                    <p className="theme-text-secondary text-lg mb-6">
                        Your account is under review. Please wait for verification to complete.
                    </p>
                </motion.div>

                <motion.div
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6"
                    variants={itemVariants}
                >
                    <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-left">
                            <h3 className="font-semibold text-yellow-800 mb-2">
                                Pending Verifications:
                            </h3>
                            <ul className="text-yellow-700 space-y-1">
                                {pendingVerifications.map((item, index) => (
                                    <motion.li
                                        key={index}
                                        className="flex items-center space-x-2"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></span>
                                        <span>{item} verification</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="text-sm theme-text-secondary space-y-2"
                    variants={itemVariants}
                >
                    <p>
                        <strong>What happens next?</strong>
                    </p>
                    <p>
                        Our team is reviewing your submitted documents and will verify your {pendingVerifications.join(' and ').toLowerCase()} shortly.
                        You will receive a notification once verification is complete.
                    </p>
                    <p className="mt-4">
                        <strong>Estimated verification time:</strong> 1-2 business days
                    </p>
                </motion.div>

                <motion.div
                    className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
                    variants={itemVariants}
                >
                    <motion.button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Refresh Status
                    </motion.button>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default function CustomerDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBalance, setShowBalance] = useState(true);
    const [showCardDetails, setShowCardDetails] = useState(false);
    const navigate = useNavigate();

    const fetchDashboardData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/auth/login');
                return;
            }

            // Fetch dashboard data and cards in parallel
            const [dashboardResponse, cardsResponse] = await Promise.all([
                dashboardService.getDashboardData(),
                dashboardService.getCards()
            ]);

            setDashboardData(dashboardResponse.data);
            setCards(cardsResponse.data || []);
        } catch (err) {
            setError(err.message);
            if (err.message.includes('token') || err.message.includes('401')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/auth/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleToggleBalance = () => {
        setShowBalance(!showBalance);
    };

    const handleToggleCardDetails = () => {
        setShowCardDetails(!showCardDetails);
    };

    // Quick action handlers
    const handleTransfer = () => {
        navigate('/customer/transfer');
    };

    const handleAddAccount = () => {
        navigate('/customer/accounts/new');
    };

    const handleRequestCard = () => {
        navigate('/customer/cards/request');
    };

    const handleLoan = () => {
        navigate('/customer/loans');
    };

    const handleReports = () => {
        navigate('/customer/reports');
    };

    const handleViewAllAccounts = () => {
        navigate('/customer/view-all-accounts');
    };

    const handleViewAllTransactions = () => {
        navigate('/customer/view-all-transactions');
    };

    const handleViewAllCards = () => {
        navigate('/customer/cards');
    };

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <LoadingState />
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <ErrorState error={error} onRetry={fetchDashboardData} />
            </motion.div>
        );
    }

    const {
        user,
        accounts,
        totalBalance,
        formattedTotalBalance,
        recentTransactions,
        quickStats,
        pendingTransactions,
        monthlyStats,
        spendingByCategory
    } = dashboardData;

    // Check if user verification is pending
    const isVerificationPending = !user.isEmailVerified || !user.isPhoneVerified;

    return (
        <motion.div
            className="min-h-screen theme-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                <DashboardHeader user={user} onLogout={handleLogout} />
            </motion.div>

            <AnimatePresence mode="wait">
                {isVerificationPending ? (
                    <motion.div
                        key="verification-pending"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Show only balance overview for unverified users */}
                        <motion.div
                            className="max-w-7xl mx-auto p-4"
                            variants={slideInVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <BalanceOverview
                                totalBalance={totalBalance}
                                formattedTotalBalance={formattedTotalBalance}
                                showBalance={showBalance}
                                onToggleBalance={handleToggleBalance}
                                quickStats={quickStats}
                            />
                        </motion.div>

                        {/* Show verification pending message */}
                        <VerificationPending user={user} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="full-dashboard"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Show full dashboard for verified users */}
                        <motion.div
                            className="max-w-7xl mx-auto p-4 space-y-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div variants={itemVariants}>
                                <BalanceOverview
                                    totalBalance={totalBalance}
                                    formattedTotalBalance={formattedTotalBalance}
                                    showBalance={showBalance}
                                    onToggleBalance={handleToggleBalance}
                                    quickStats={quickStats}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <QuickActions
                                    onTransfer={handleTransfer}
                                    onAddAccount={handleAddAccount}
                                    onRequestCard={handleRequestCard}
                                    onLoan={handleLoan}
                                    onReports={handleReports}
                                />
                            </motion.div>

                            <motion.div
                                className="grid lg:grid-cols-3 gap-6"
                                variants={itemVariants}
                            >
                                {/* Main Content */}
                                <div className="lg:col-span-2 space-y-6">
                                    <motion.div
                                        variants={cardVariants}
                                        whileHover="hover"
                                    >
                                        <AccountsList
                                            accounts={accounts}
                                            showBalance={showBalance}
                                            onViewAll={handleViewAllAccounts}
                                        />
                                    </motion.div>

                                    <motion.div
                                        variants={cardVariants}
                                        whileHover="hover"
                                    >
                                        <RecentTransactions
                                            transactions={recentTransactions}
                                            onViewAll={handleViewAllTransactions}
                                        />
                                    </motion.div>
                                </div>

                                {/* Sidebar */}
                                <motion.div
                                    className="space-y-6"
                                    variants={containerVariants}
                                >
                                    <motion.div variants={cardVariants} whileHover="hover">
                                        <CardsList
                                            cards={cards}
                                            showCardDetails={showCardDetails}
                                            onToggleCardDetails={handleToggleCardDetails}
                                            onViewAll={handleViewAllCards}
                                        />
                                    </motion.div>
                                    <motion.div variants={cardVariants} whileHover="hover">
                                        <PendingTransactions transactions={pendingTransactions} />
                                    </motion.div>
                                    <motion.div variants={cardVariants} whileHover="hover">
                                        <MonthlyStats stats={monthlyStats} />
                                    </motion.div>
                                    <motion.div variants={cardVariants} whileHover="hover">
                                        <SpendingCategories categories={spendingByCategory} />
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
