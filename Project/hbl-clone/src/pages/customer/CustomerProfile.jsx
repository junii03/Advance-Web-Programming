import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, FileText, Download, User, Mail, Phone, MapPin, Hash, Calendar, Eye, Edit } from 'lucide-react';
import dashboardService from '../../services/dashboardService';

// Animation variants for consistent motion
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
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: "easeOut" }
    },
    hover: {
        y: -2,
        transition: { duration: 0.2, ease: "easeInOut" }
    }
};

const avatarVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: "easeOut" }
    },
    hover: {
        scale: 1.05,
        transition: { duration: 0.2, ease: "easeInOut" }
    }
};

export default function CustomerProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            setError('');
            try {
                const res = await dashboardService.getUserProfile();
                setUser(res.data);
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                setError('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen theme-container flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="theme-text-secondary">Loading your profile...</p>
                </motion.div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen theme-container flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md mx-auto p-6"
                >
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold theme-text mb-2">Unable to Load Profile</h3>
                    <p className="theme-text-secondary mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="theme-btn-primary px-6 py-2 rounded-lg"
                    >
                        Try Again
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen theme-container"
        >
            {/* Header */}
            <motion.div
                variants={itemVariants}
                className="theme-card-elevated border-b theme-border sticky top-0 z-10 backdrop-blur-sm"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/customer/dashboard')}
                            className="p-2 rounded-lg theme-card hover:theme-surface transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 theme-text" />
                        </motion.button>
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold theme-heading-1">My Profile</h1>
                            <p className="text-sm theme-text-secondary">Manage your personal information and documents</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 theme-btn-secondary rounded-lg text-sm font-medium"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Profile
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Profile Card - Left Column */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        className="lg:col-span-1"
                    >
                        <div className="theme-card-elevated rounded-xl p-6 shadow-sm">
                            {/* Avatar Section */}
                            <div className="text-center mb-6">
                                <motion.div
                                    variants={avatarVariants}
                                    whileHover="hover"
                                    className="relative inline-block mb-4"
                                >
                                    <img
                                        src={user?.profilePicture?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.email)}&background=14b8a6&color=fff&size=128`}
                                        alt="Profile"
                                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-teal-500 object-cover shadow-lg"
                                    />
                                    <div className="absolute bottom-0 right-0 w-8 h-8 theme-accent-bg rounded-full flex items-center justify-center shadow-lg">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                </motion.div>
                                <h2 className="text-xl font-bold theme-heading-1 mb-1">{user?.fullName}</h2>
                                <p className="theme-text-secondary text-sm">Customer Since {new Date(user?.createdAt).getFullYear()}</p>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="text-center p-3 theme-card rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        {user?.isEmailVerified ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-yellow-500" />
                                        )}
                                        <Mail className="w-4 h-4 theme-text-secondary" />
                                    </div>
                                    <p className="text-xs theme-text-muted">Email Status</p>
                                </div>
                                <div className="text-center p-3 theme-card rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        {user?.isPhoneVerified ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-yellow-500" />
                                        )}
                                        <Phone className="w-4 h-4 theme-text-secondary" />
                                    </div>
                                    <p className="text-xs theme-text-muted">Phone Status</p>
                                </div>
                            </div>

                            {/* Mobile Edit Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full sm:hidden flex items-center justify-center gap-2 px-4 py-3 theme-btn-primary rounded-lg font-medium"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Profile
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Details Section - Right Column */}
                    <motion.div
                        variants={itemVariants}
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Tab Navigation */}
                        <div className="theme-card-elevated rounded-xl p-1 shadow-sm">
                            <div className="flex space-x-1">
                                {[
                                    { id: 'overview', label: 'Overview', icon: Eye },
                                    { id: 'documents', label: 'Documents', icon: FileText }
                                ].map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <motion.button
                                            key={tab.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                                ? 'theme-accent-bg text-white shadow-sm'
                                                : 'theme-text hover:theme-surface'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="hidden sm:inline">{tab.label}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[400px]">
                            <AnimatePresence mode="wait">
                                {activeTab === 'overview' && (
                                    <motion.div
                                        key="overview"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        {/* Personal Information */}
                                        <div className="theme-card-elevated rounded-xl p-6 shadow-sm">
                                            <h3 className="text-lg font-semibold theme-heading-2 mb-4">Personal Information</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-3 p-3 theme-card rounded-lg">
                                                    <Mail className="w-5 h-5 theme-accent flex-shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs theme-text-muted mb-1">Email Address</p>
                                                        <p className="theme-text text-sm font-medium truncate">{user?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 theme-card rounded-lg">
                                                    <Phone className="w-5 h-5 theme-accent flex-shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs theme-text-muted mb-1">Phone Number</p>
                                                        <p className="theme-text text-sm font-medium">{user?.phone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 theme-card rounded-lg">
                                                    <Hash className="w-5 h-5 theme-accent flex-shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs theme-text-muted mb-1">Customer Number</p>
                                                        <p className="theme-text text-sm font-medium">{user?.customerNumber}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 theme-card rounded-lg">
                                                    <Calendar className="w-5 h-5 theme-accent flex-shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs theme-text-muted mb-1">Member Since</p>
                                                        <p className="theme-text text-sm font-medium">{new Date(user?.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address Information */}
                                        {user?.address && (
                                            <div className="theme-card-elevated rounded-xl p-6 shadow-sm">
                                                <h3 className="text-lg font-semibold theme-heading-2 mb-4">Address Information</h3>
                                                <div className="flex items-start gap-3 p-4 theme-card rounded-lg">
                                                    <MapPin className="w-5 h-5 theme-accent flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="theme-text font-medium mb-1">
                                                            {user.address.street}
                                                        </p>
                                                        <p className="theme-text-secondary text-sm">
                                                            {user.address.city}, {user.address.state} {user.address.postalCode}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'documents' && (
                                    <motion.div
                                        key="documents"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="theme-card-elevated rounded-xl p-6 shadow-sm">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-lg font-semibold theme-heading-2 flex items-center gap-2">
                                                    <FileText className="w-5 h-5 theme-accent" />
                                                    Uploaded Documents
                                                </h3>
                                                <span className="text-sm theme-text-muted">
                                                    {user?.documents?.length || 0} document(s)
                                                </span>
                                            </div>

                                            {user?.documents && user.documents.length > 0 ? (
                                                <div className="space-y-4">
                                                    {user.documents.map((doc, idx) => (
                                                        <motion.div
                                                            key={doc.publicId || idx}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.1 }}
                                                            whileHover={{ scale: 1.01 }}
                                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg theme-card border theme-border hover:shadow-sm transition-all"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                    <FileText className="w-5 h-5 text-blue-600" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h4 className="font-medium theme-text text-sm mb-1">
                                                                        {doc.type.replace('_', ' ').toUpperCase()}
                                                                    </h4>
                                                                    <p className="theme-text-muted text-xs mb-1 truncate">{doc.originalName}</p>
                                                                    <p className="theme-text-muted text-xs">
                                                                        Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-center gap-1">
                                                                    {doc.verified ? (
                                                                        <span className="flex items-center text-green-600 text-xs font-medium">
                                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                                            Verified
                                                                        </span>
                                                                    ) : (
                                                                        <span className="flex items-center text-yellow-600 text-xs font-medium">
                                                                            <XCircle className="w-4 h-4 mr-1" />
                                                                            Pending
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <motion.a
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    href={doc.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1 px-3 py-2 rounded-lg theme-btn-secondary text-xs font-medium"
                                                                >
                                                                    <Eye className="w-3 h-3" />
                                                                    View
                                                                </motion.a>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-center py-12"
                                                >
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <FileText className="w-8 h-8 theme-text-muted" />
                                                    </div>
                                                    <h4 className="font-medium theme-text mb-2">No Documents</h4>
                                                    <p className="theme-text-muted text-sm">You haven't uploaded any documents yet.</p>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
