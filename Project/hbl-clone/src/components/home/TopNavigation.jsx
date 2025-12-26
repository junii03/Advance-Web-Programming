import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import FlagDropdown from '../common/FlagDropdown';
import useScrollDirection from '../../hooks/useScrollDirection';


export default function TopNavigation() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [selectedFlag, setSelectedFlag] = useState('PK'); // Default to Pakistan
    const { scrollDirection, isScrolled } = useScrollDirection();

    const handleFlagChange = (flag) => {
        setSelectedFlag(flag.code);
        // You can add additional logic here like changing language, currency, etc.
        console.log('Selected country:', flag.name);
    };

    // Determine navbar classes based on scroll behavior
    const navbarClasses = `
        fixed top-0 left-0 right-0 z-40 border-b theme-header transition-colors duration-300
        ${scrollDirection === 'down' ? 'navbar-hidden' : 'navbar-visible'}
        ${isScrolled ? 'navbar-scrolled' : ''}
    `.trim();

    return (
        <nav className={navbarClasses}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-12 text-sm">
                    {/* Left Navigation Links - Desktop */}
                    <div className="hidden lg:flex items-center space-x-8 pl-4">
                        <span className="font-medium relative group transition duration-300 px-2 theme-nav-link-active">
                            PERSONAL
                            <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 transition-all duration-300 group-hover:w-full theme-nav-underline"></span>
                        </span>
                        {["BUSINESS", "ISLAMIC", "PRESTIGE"].map((item) => (
                            <span
                                key={item}
                                className="cursor-pointer relative group transition duration-300 theme-nav-link"
                            >
                                {item}
                                <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 transition-all duration-300 group-hover:w-full theme-nav-underline"></span>
                            </span>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden theme-text"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    {/* Right Navigation Links - Desktop */}
                    <div className="hidden md:flex items-center space-x-3 text-xs">
                        {[
                            "About Us",
                            "Investor Relations",
                            "Sustainability",
                            "Forex",
                            "Careers",
                            "News",
                            "Contact Us",
                            "Resources",
                        ].map((item) => (
                            <span
                                key={item}
                                className="cursor-pointer transition duration-300 px-1 hidden xl:inline theme-nav-link"
                            >
                                {item}
                            </span>
                        ))}

                        {/* Show only essential links on smaller desktop screens */}
                        <div className="xl:hidden flex items-center space-x-3">
                            <span className="cursor-pointer transition duration-300 px-1 theme-nav-link">About Us</span>
                            <span className="cursor-pointer transition duration-300 px-1 theme-nav-link">Contact Us</span>
                        </div>

                        {/* Icons with Hover Effects */}
                        <div className="flex items-center space-x-3 ml-6">
                            <ThemeToggle />
                            <FlagDropdown
                                selectedFlag={selectedFlag}
                                onFlagChange={handleFlagChange}
                            />
                        </div>
                    </div>

                    {/* Mobile Icons Only */}
                    <div className="md:hidden flex items-center space-x-3">
                        <ThemeToggle />
                        <FlagDropdown
                            selectedFlag={selectedFlag}
                            onFlagChange={handleFlagChange}
                        />
                    </div>
                </div>

                {/* Mobile Menu Dropdown with smooth transition */}
                <div
                    className={`lg:hidden border-t theme-mobile-menu overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "max-h-screen py-4 opacity-100" : "max-h-0 py-0 opacity-0"
                        }`}
                >
                    <div className="flex flex-col space-y-4">
                        {/* Main Navigation */}
                        <div className="flex flex-col space-y-2">
                            <span className="font-medium py-2 theme-nav-link-active">PERSONAL</span>
                            {["BUSINESS", "ISLAMIC", "PRESTIGE"].map((item) => (
                                <span key={item} className="cursor-pointer py-2 theme-menu-item">
                                    {item}
                                </span>
                            ))}
                        </div>

                        {/* Secondary Navigation */}
                        <div className="border-t pt-4 flex flex-col space-y-2 text-xs theme-border">
                            {[
                                "About Us",
                                "Investor Relations",
                                "Sustainability",
                                "Forex",
                                "Careers",
                                "News",
                                "Contact Us",
                                "Resources",
                            ].map((item) => (
                                <span key={item} className="cursor-pointer py-1 theme-menu-item">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
