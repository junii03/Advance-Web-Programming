import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import PropTypes from 'prop-types';

// Import flag images
import pakistanFlag from '/src/assets/pakistan-flag-new.png';
import belgiumFlag from '/src/assets/Balgium_flag.png';
import chinaFlag from '/src/assets/China_Flag1.png';
import turkeyFlag from '/src/assets/Turkey_Flag.png';
import bahrainFlag from '/src/assets/Baharin_Flag.png';
import bangladeshFlag from '/src/assets/Bangladesh.png';
import uaeFlag from '/src/assets/UAE.png';
import ukFlag from '/src/assets/UK.png';

const flagsData = [
    { code: 'PK', name: 'Pakistan', flag: pakistanFlag },
    { code: 'BE', name: 'Belgium', flag: belgiumFlag },
    { code: 'CN', name: 'China', flag: chinaFlag },
    { code: 'TR', name: 'Turkey', flag: turkeyFlag },
    { code: 'BH', name: 'Bahrain', flag: bahrainFlag },
    { code: 'BD', name: 'Bangladesh', flag: bangladeshFlag },
    { code: 'AE', name: 'UAE', flag: uaeFlag },
    { code: 'GB', name: 'United Kingdom', flag: ukFlag },
];

const FlagDropdown = ({ selectedFlag = 'PK', onFlagChange, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentFlag = flagsData.find(flag => flag.code === selectedFlag) || flagsData[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleFlagSelect = (flag) => {
        setIsOpen(false);
        if (onFlagChange) {
            onFlagChange(flag);
        }
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Dropdown Trigger */}
            <button
                className="flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 theme-focus-ring"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={`Select country flag. Currently selected: ${currentFlag.name}`}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <img
                    src={currentFlag.flag}
                    alt={`${currentFlag.name} flag`}
                    className="w-4 h-4 md:w-5 md:h-5 object-cover rounded-sm transition-transform duration-300 hover:scale-110"
                />
                <ChevronDown
                    className={`w-3 h-3 theme-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 theme-card-elevated rounded-lg shadow-lg border z-50 overflow-hidden">
                    <div className="py-2 max-h-64 overflow-y-auto theme-scrollbar">
                        {flagsData.map((flag) => (
                            <button
                                key={flag.code}
                                className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${selectedFlag === flag.code
                                        ? 'bg-gray-50 dark:bg-gray-700 theme-accent'
                                        : 'theme-text'
                                    }`}
                                onClick={() => handleFlagSelect(flag)}
                                role="option"
                                aria-selected={selectedFlag === flag.code}
                            >
                                <img
                                    src={flag.flag}
                                    alt={`${flag.name} flag`}
                                    className="w-5 h-5 object-cover rounded-sm flex-shrink-0"
                                />
                                <span className="text-sm font-medium truncate">
                                    {flag.name}
                                </span>
                                <span className="text-xs theme-text-muted ml-auto">
                                    {flag.code}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

FlagDropdown.propTypes = {
    selectedFlag: PropTypes.string,
    onFlagChange: PropTypes.func,
    className: PropTypes.string
};

export default FlagDropdown;
