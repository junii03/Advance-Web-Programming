import React from 'react';
import { Navigate } from 'react-router-dom';

// Role-based route protection component
export const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    // Check if authentication is required and user is not logged in
    if (requireAuth && !token) {
        return <Navigate to="/auth/login" replace />;
    }

    // If roles are specified, check user role
    if (allowedRoles.length > 0 && userStr) {
        try {
            const user = JSON.parse(userStr);
            if (!allowedRoles.includes(user.role)) {
                // Redirect based on user's actual role
                const redirectPath = user.role === 'admin' || user.role === 'manager'
                    ? '/admin/dashboard'
                    : '/customer/dashboard';
                return <Navigate to={redirectPath} replace />;
            }
        } catch (error) {
            console.error('Invalid user data:', error);
            // Invalid user data, redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return <Navigate to="/auth/login" replace />;
        }
    }

    return children;
};

// Admin route protection
export const AdminRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['admin', 'manager']}>
        {children}
    </ProtectedRoute>
);

// Customer route protection
export const CustomerRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['customer']}>
        {children}
    </ProtectedRoute>
);

// General authenticated route protection
export const AuthRoute = ({ children }) => (
    <ProtectedRoute requireAuth={true}>
        {children}
    </ProtectedRoute>
);
