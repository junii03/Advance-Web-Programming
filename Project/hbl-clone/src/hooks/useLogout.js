import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useLogout = (userType = 'user') => {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();

    const openLogoutModal = () => {
        setShowLogoutModal(true);
    };

    const closeLogoutModal = () => {
        if (!isLoggingOut) {
            setShowLogoutModal(false);
        }
    };

    const confirmLogout = async () => {
        setIsLoggingOut(true);
        
        try {
            // Clear authentication data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Small delay for better UX (optional)
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Navigate to appropriate login page
            const loginPath = userType === 'admin' ? '/auth/login' : '/auth/login';
            navigate(loginPath, { replace: true });
            
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoggingOut(false);
            setShowLogoutModal(false);
        }
    };

    return {
        showLogoutModal,
        isLoggingOut,
        openLogoutModal,
        closeLogoutModal,
        confirmLogout
    };
};