/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { Send, Plus, CreditCard, PieChart, Banknote, FileText } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    }
};

const QuickActions = ({ onTransfer, onAddAccount, onRequestCard, onLoan, onReports }) => {
    const actions = [
        {
            icon: Send,
            label: 'Transfer Money',
            onClick: onTransfer,
            color: 'theme-accent'
        },
        {
            icon: Plus,
            label: 'Add Account',
            onClick: onAddAccount,
            color: 'theme-accent'
        },
        {
            icon: CreditCard,
            label: 'Request Card',
            onClick: onRequestCard,
            color: 'theme-accent'
        },
        {
            icon: Banknote,
            label: 'Loan',
            onClick: onLoan,
            color: 'theme-accent'
        },
        {
            icon: FileText,
            label: 'Report Issue',
            onClick: onReports,
            color: 'theme-accent'
        }
    ];

    return (
        <motion.div
            className="grid grid-cols-2 md:grid-cols-5 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                    <motion.button
                        key={index}
                        onClick={action.onClick}
                        className="theme-card-elevated p-4 rounded-lg hover:theme-card-hover text-center group"
                        variants={itemVariants}
                        whileHover={{
                            scale: 1.05,
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <motion.div
                            whileHover={{
                                scale: 1.2,
                                rotate: 5
                            }}
                            transition={{ duration: 0.2 }}
                        >
                            <Icon className={`w-6 h-6 ${action.color} mx-auto mb-2`} />
                        </motion.div>
                        <div className="text-sm font-medium theme-text">
                            {action.label}
                        </div>
                    </motion.button>
                );
            })}
        </motion.div>
    );
};

export default QuickActions;
