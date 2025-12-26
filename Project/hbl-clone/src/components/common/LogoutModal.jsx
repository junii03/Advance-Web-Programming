import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, AlertTriangle } from 'lucide-react';
import PropTypes from 'prop-types';

const LogoutModal = ({
    isOpen,
    onClose,
    onConfirm,
    loading = false,
    title = "Confirm Logout",
    message = "Are you sure you want to logout? You will need to sign in again to access your account.",
    userType = "user" // "admin" or "customer" or "user" for generic
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    const getUserTypeMessage = () => {
        switch (userType) {
            case 'admin':
                return "You will be logged out of the admin dashboard and redirected to the login page.";
            case 'customer':
                return "You will be logged out of your banking account and redirected to the login page.";
            default:
                return message;
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 theme-modal-overlay z-50 flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 300,
                        duration: 0.3
                    }}
                    className="theme-modal-card rounded-xl w-full max-w-sm sm:max-w-md mx-auto p-6 sm:p-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold theme-heading-1">
                                {title}
                            </h2>
                        </div>
                        {!loading && (
                            <button
                                onClick={handleClose}
                                className="p-1 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                aria-label="Close modal"
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5 theme-text-secondary" />
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="mb-8">
                        <p className="text-sm sm:text-base theme-text-secondary leading-relaxed">
                            {getUserTypeMessage()}
                        </p>
                        {userType !== 'user' && (
                            <p className="text-xs sm:text-sm theme-text-muted mt-3">
                                This action will end your current session for security purposes.
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 px-4 py-3 sm:py-2.5 text-sm sm:text-base font-medium theme-btn-secondary rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="flex-1 px-4 py-3 sm:py-2.5 text-sm sm:text-base font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Logging out...</span>
                                </>
                            ) : (
                                <>
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Mobile-specific spacing */}
                    <div className="sm:hidden h-2"></div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

LogoutModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    title: PropTypes.string,
    message: PropTypes.string,
    userType: PropTypes.oneOf(['admin', 'customer', 'user'])
};

export default LogoutModal;
