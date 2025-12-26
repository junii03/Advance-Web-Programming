/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import UserManagement from '../../components/admin/UserManagement';

const AdminUserManagement = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleNavigation = (path) => {
        navigate(path);
        setSidebarOpen(false); // Close sidebar on mobile after navigation
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth/login');
    };

    return (
        <div className="min-h-screen theme-bg">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onNavigate={handleNavigation}
                currentPath="/admin/users"
            />

            {/* Main Content */}
            <div className="lg:ml-64 min-h-screen">
                {/* Header */}
                <AdminHeader
                    onMenuClick={() => setSidebarOpen(true)}
                    onLogout={handleLogout}
                />

                {/* Page Content - Mobile First Responsive */}
                <main className="theme-bg min-h-screen">
                    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                        <UserManagement />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminUserManagement;
