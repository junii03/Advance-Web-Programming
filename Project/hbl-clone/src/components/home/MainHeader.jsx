import { useState } from 'react';
import { Search, Phone, Menu, X } from "lucide-react";
import darkModeLogo from '/src/assets/darkmode-logo-HBL.png';
import lightModeLogo from '/src/assets/logo-1920.png';
import { useTheme } from '../../hooks/useTheme';
import { useNavigate } from 'react-router-dom';

export default function MainHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isDark } = useTheme();
    const logo = isDark ? darkModeLogo : lightModeLogo;
    const navigate = useNavigate();

    return (
        <header className="border-b theme-header transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4 lg:space-x-8">
                        <div className="theme-logo-container font-bold">
                            <img src={logo} alt="logo" className="w-20 h-auto lg:w-28" />
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 text-sm font-medium">
                            {[
                                "DIGITAL BANKING",
                                "ACCOUNTS",
                                "CARDS",
                                "LOANS",
                                "KONNECT",
                                "REMITTANCE",
                                "WEALTH",
                                "RDA"
                            ].map(item => (
                                <span
                                    key={item}
                                    className="cursor-pointer whitespace-nowrap theme-nav-link"
                                >
                                    {item}
                                </span>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-4">
                        {/* Desktop Icons */}
                        <div className="hidden md:flex items-center space-x-4">
                            <Phone className="w-4 h-4 lg:w-5 lg:h-5 theme-icon cursor-pointer" />
                            <Search className="w-4 h-4 lg:w-5 lg:h-5 theme-icon cursor-pointer" />
                        </div>

                        {/* Login Button */}
                        <button
                            className="theme-btn-primary text-white px-3 py-1.5 md:px-6 md:py-2 text-xs md:text-sm font-medium rounded"
                            onClick={() => navigate('/auth/login')}
                        >
                            LOGIN
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden ml-2 theme-text transition-colors duration-300"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu with smooth transition */}
                <div
                    className={`lg:hidden border-t theme-mobile-menu overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "max-h-screen py-4 opacity-100" : "max-h-0 py-0 opacity-0"
                        }`}
                >
                    <nav className="flex flex-col space-y-3">
                        {[
                            "DIGITAL BANKING",
                            "ACCOUNTS",
                            "CARDS",
                            "LOANS",
                            "KONNECT",
                            "REMITTANCE",
                            "WEALTH",
                            "RDA"
                        ].map((item) => (
                            <span
                                key={item}
                                className="cursor-pointer py-3 px-2 rounded text-sm font-medium theme-menu-item"
                            >
                                {item}
                            </span>
                        ))}

                        {/* Mobile Icons */}
                        <div className="flex items-center space-x-4 pt-4 border-t theme-border px-2">
                            <Phone className="w-5 h-5 theme-icon cursor-pointer" />
                            <Search className="w-5 h-5 theme-icon cursor-pointer" />
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}
