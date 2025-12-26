import Home from './pages/Home'
import './styles/App.css'
import { ThemeProvider } from './components/providers/ThemeProvider'
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import RequestCard from './pages/customer/RequestCard';
import AddAccount from './pages/customer/AddAccount';
import TransferMoney from './pages/customer/TransferMoney';
import { CustomerRoute, AdminRoute, AuthRoute } from './components/ProtectedRoute';
import ViewAllTransactions from './pages/customer/ViewAllTransactions';
import ViewAllAccounts from './pages/customer/ViewAllAccounts';
import ViewAllCards from './pages/customer/ViewAllCards';
import Notification from './pages/customer/Notification';
import Settings from './pages/customer/Settings';
import Loan from './pages/customer/Loan';
import ApplyLoan from './components/dashboard/ApplyLoan';
import Reports from './pages/customer/Reports';
import CustomerProfile from './pages/customer/CustomerProfile';
import AdminDashboard from "./pages/admin/AdminDashboard";
import LoanApprovals from './pages/admin/LoanApprovals';
import AdminReports from "./pages/admin/AdminReports";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AdminCardManagement from "./pages/admin/AdminCardManagement";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminReportsAnalytics from "./pages/admin/AdminReportsAnalytics";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSystemLogs from "./pages/admin/AdminSystemLogs";

// Component to handle initial route redirection based on user role
const RoleBasedRedirect = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token) {
        return <Navigate to="/auth/login" replace />;
    }

    try {
        const user = JSON.parse(userStr);
        switch (user.role) {
            case 'admin':
            case 'manager':
                return <Navigate to="/admin/dashboard" replace />;
            case 'customer':
            default:
                return <Navigate to="/customer/dashboard" replace />;
        }
    } catch (error) {
        console.error('Invalid user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/auth/login" replace />;
    }
};

function AppContent() {
    return (
        <div className="min-h-screen theme-container">
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />

                {/* Protected Customer Routes */}
                <Route
                    path="/customer/dashboard"
                    element={
                        <CustomerRoute>
                            <CustomerDashboard />
                        </CustomerRoute>
                    }
                />
                <Route
                    path="/customer/transfer"
                    element={
                        <CustomerRoute>
                            <TransferMoney />
                        </CustomerRoute>
                    }
                />
                <Route
                    path="/customer/cards/request"
                    element={
                        <CustomerRoute>
                            <RequestCard />
                        </CustomerRoute>
                    }
                />
                <Route
                    path="/customer/accounts/new"
                    element={
                        <CustomerRoute>
                            <AddAccount />
                        </CustomerRoute>
                    }
                />
                <Route
                    path="/customer/view-all-transactions"
                    element={
                        <CustomerRoute>
                            <ViewAllTransactions />
                        </CustomerRoute>
                    }
                />
                <Route
                    path="/customer/view-all-accounts"
                    element={
                        <CustomerRoute>
                            <ViewAllAccounts />
                        </CustomerRoute>
                    }
                />
                <Route
                    path="/customer/cards"
                    element={
                        <CustomerRoute>
                            <ViewAllCards />
                        </CustomerRoute>
                    }
                />
                <Route
                    path="/customer/notifications"
                    element={
                        <CustomerRoute>
                            <Notification />
                        </CustomerRoute>
                    }
                />
                <Route
                    path="/customer/settings"
                    element={
                        <CustomerRoute>
                            <Settings />
                        </CustomerRoute>
                    }
                />
                <Route
                    path="/customer/loans"
                    element={
                        <CustomerRoute>
                            <Loan />
                        </CustomerRoute>
                    }
                />
                <Route
                    path="/customer/loans/apply"
                    element={
                        <CustomerRoute>
                            <ApplyLoan />
                        </CustomerRoute>
                    }
                />
                <Route
                    path="/customer/reports"
                    element={
                        <CustomerRoute>
                            <Reports />
                        </CustomerRoute>
                    }
                />
                <Route
                    path="/customer/profile"
                    element={
                        <CustomerRoute>
                            <CustomerProfile />
                        </CustomerRoute>
                    }
                />


                {/* Protected Admin Routes - Placeholder for now */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/loans"
                    element={
                        <AdminRoute>
                            <LoanApprovals />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/customer-reports"
                    element={
                        <AdminRoute>
                            <AdminReports />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <AdminRoute>
                            <AdminUserManagement />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/cards"
                    element={
                        <AdminRoute>
                            <AdminCardManagement />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/transactions"
                    element={
                        <AdminRoute>
                            <AdminTransactions />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/reports"
                    element={
                        <AdminRoute>
                            <AdminReportsAnalytics />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/logs"
                    element={
                        <AdminRoute>
                            <AdminSystemLogs />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/security"
                    element={
                        <AdminRoute>
                            <AdminSecurity />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/settings"
                    element={
                        <AdminRoute>
                            <AdminSettings />
                        </AdminRoute>
                    }
                />


                {/* Role-based redirect for /dashboard */}
                <Route path="/dashboard" element={<RoleBasedRedirect />} />

                {/* Catch all route - redirect to role-based dashboard or login */}
                <Route path="*" element={<RoleBasedRedirect />} />
            </Routes>
        </div>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}
