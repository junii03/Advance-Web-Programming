import React from 'react';
import { Bell, Settings, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import LogoutModal from '../common/LogoutModal';
import { useLogout } from '../../hooks/useLogout';

const DashboardHeader = ({ user }) => {

    const [unreadCount, setUnreadCount] = React.useState(0);
    const navigate = useNavigate();
    const { showLogoutModal, isLoggingOut, openLogoutModal, closeLogoutModal, confirmLogout } = useLogout('customer');

    React.useEffect(() => {
        let mounted = true;
        dashboardService.getUnreadNotificationCount()
            .then(res => {
                if (mounted) setUnreadCount(res.count || 0);
            })
            .catch(() => { });
        return () => { mounted = false; };
    }, []);

    return (
        <header className="theme-header border-b theme-border p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        className="w-10 h-10 theme-btn-primary rounded-full flex items-center justify-center overflow-hidden focus:outline-none cursor-pointer"
                        type="button"
                        onClick={() => navigate('/customer/profile')}
                        title="View Profile"
                        aria-label="View Profile"
                    >
                        {user.profilePicture.url ? (
                            <img
                                src={user.profilePicture.url}
                                alt={`${user.fullName || 'User'}'s profile`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-5 h-5 text-white" />
                        )}
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold theme-heading-1">
                            Welcome back, {user.fullName?.split(' ')[0] || 'User'}
                        </h1>
                        <p className="text-sm theme-text-muted">Customer ID: {user.customerNumber}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <Link to="/customer/notifications" className="relative p-2 rounded-lg theme-card hover:theme-card-hover focus:outline-none">
                        <Bell className="w-5 h-5 theme-text" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center font-bold shadow-md">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </Link>
                    <Link to="/customer/settings" className="p-2 rounded-lg theme-card hover:theme-card-hover">
                        <Settings className="w-5 h-5 theme-text" />
                    </Link>
                    <button className="p-2 rounded-lg theme-card hover:theme-card-hover" onClick={openLogoutModal}>
                        <LogOut className="w-5 h-5 theme-text" />
                    </button>
                    <LogoutModal
                        isOpen={showLogoutModal}
                        onClose={closeLogoutModal}
                        onConfirm={confirmLogout}
                        loading={isLoggingOut}
                        userType="customer"
                    />
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
