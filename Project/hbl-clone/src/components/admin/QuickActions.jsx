/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    CreditCard,
    DollarSign,
    TrendingUp,
    BarChart3,
    Shield,
    BugIcon,
    FileText,
    Settings
} from 'lucide-react';

const QuickActions = ({ onNavigate }) => {
    const actions = [
        {
            icon: Users,
            label: 'User Management',
            path: '/admin/users',
            color: 'bg-blue-500',
            description: 'Manage user accounts'
        },
        {
            icon: DollarSign,
            label: 'Loan Approvals',
            path: '/admin/loans',
            color: 'bg-green-500',
            description: 'Review loan applications'
        },
        {
            icon: CreditCard,
            label: 'Card Management',
            path: '/admin/cards',
            color: 'bg-purple-500',
            description: 'Manage card requests'
        },
        {
            icon: TrendingUp,
            label: 'Transactions',
            path: '/admin/transactions',
            color: 'bg-orange-500',
            description: 'Monitor transactions'
        },
        {
            icon: BarChart3,
            label: 'Reports',
            path: '/admin/reports',
            color: 'bg-indigo-500',
            description: 'Generate reports'
        },
        {
            icon: BugIcon,
            label: 'Issues',
            path: '/admin/customer-reports',
            color: 'bg-red-500',
            description: 'Customer Issues'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
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

    return (
        <div className="theme-card-elevated rounded-lg p-6">
            <h2 className="text-lg font-semibold theme-heading-1 mb-4">Quick Actions</h2>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
            >
                {actions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <motion.button
                            key={index}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onNavigate(action.path)}
                            className="flex flex-col items-center p-4 theme-card rounded-lg hover:theme-card-hover transition-all group"
                        >
                            <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:shadow-lg transition-shadow`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-medium theme-text text-center">{action.label}</span>
                            <span className="text-xs theme-text-muted text-center mt-1">{action.description}</span>
                        </motion.button>
                    );
                })}
            </motion.div>
        </div>
    );
};

export default QuickActions;
