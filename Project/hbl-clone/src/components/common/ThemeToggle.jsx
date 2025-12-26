import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500 transition-transform duration-300 hover:rotate-180" />
            ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform duration-300 hover:rotate-12" />
            )}
        </button>
    );
};

export default ThemeToggle;
