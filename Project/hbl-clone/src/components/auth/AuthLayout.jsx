import PropTypes from 'prop-types';
import { useTheme } from '../../hooks/useTheme';
import darkModeLogo from '/src/assets/darkmode-logo-HBL.png';
import lightModeLogo from '/src/assets/logo-1920.png';
import ThemeToggle from '../common/ThemeToggle';
import BackButton from '../common/BackButton';

export default function AuthLayout({ children, title, showBackButton = true, backButtonTo = "/" }) {
    const { isDark } = useTheme();
    const logo = isDark ? darkModeLogo : lightModeLogo;

    return (
        <div className="min-h-screen theme-container transition-colors duration-300 flex flex-col items-center justify-center p-4">
            {/* Top Navigation */}
            <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-4">
                {showBackButton && (
                    <BackButton to={backButtonTo} />
                )}
                <div className={!showBackButton ? "ml-auto" : ""}>
                    <ThemeToggle />
                </div>
            </div>

            {/* Logo */}
            <div className="mb-8">
                <img src={logo} alt="HBL Logo" className="w-32 h-auto" />
            </div>

            {/* Auth Form Container */}
            <div className="theme-card-elevated rounded-lg shadow-lg w-full max-w-md lg:max-w-lg p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 theme-heading-1">
                    {title}
                </h1>
                {children}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-sm theme-text-muted">
                    © 2025 Habib Bank Limited. All rights reserved.
                </p>
            </div>
        </div>
    );
}

AuthLayout.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    showBackButton: PropTypes.bool,
    backButtonTo: PropTypes.string
};
