/** @type {import('tailwindcss').Config} */
module.exports = {
    // Update these paths to include all locations using NativeWind className
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./src/app/**/*.{js,jsx,ts,tsx}",
        "./src/components/**/*.{js,jsx,ts,tsx}",
        "./src/features/**/*.{js,jsx,ts,tsx}",
        "./src/screens/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                // HBL Primary Brand Colors
                'hbl-red': '#DC143C',
                'hbl-red-light': '#FF6B6B',
                'hbl-red-dark': '#9C0E2E',
                'hbl-blue': '#003366',
                'hbl-gold': '#FFB81C',

                // Semantic/Status Colors
                'success': '#10B981',
                'success-light': '#6EE7B7',
                'warning': '#F59E0B',
                'warning-light': '#FCD34D',
                'error': '#EF4444',
                'error-light': '#FCA5A5',
                'info': '#3B82F6',
                'info-light': '#93C5FD',

                // Neutral Colors - Light Mode
                'background-light': '#FFFFFF',
                'surface-light': '#F9FAFB',
                'surface-alt-light': '#F3F4F6',
                'border-light': '#E5E7EB',
                'border-lighter': '#F3F4F6',

                // Text Colors - Light Mode
                'text-primary': '#111827',
                'text-secondary': '#6B7280',
                'text-tertiary': '#9CA3AF',

                // Neutral Colors - Dark Mode
                'background-dark': '#111827',
                'surface-dark': '#1F2937',
                'surface-alt-dark': '#374151',
                'border-dark': '#4B5563',
                'border-darker': '#374151',

                // Text Colors - Dark Mode
                'text-dark-primary': '#F9FAFB',
                'text-dark-secondary': '#D1D5DB',
                'text-dark-tertiary': '#9CA3AF',
            },
            spacing: {
                'xs': '4px',
                'sm': '8px',
                'md': '12px',
                'lg': '16px',
                'xl': '20px',
                'xxl': '24px',
                'xxxl': '32px',
            },
            borderRadius: {
                'sm': '4px',
                'md': '8px',
                'lg': '12px',
                'xl': '16px',
            },
            fontSize: {
                'xs': '12px',
                'sm': '14px',
                'base': '16px',
                'lg': '18px',
                'xl': '20px',
                'xxl': '24px',
                'xxxl': '32px',
            },
            lineHeight: {
                'tight': 1.2,
                'normal': 1.5,
                'relaxed': 1.75,
            },
            shadows: {
                'sm': {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.18,
                    shadowRadius: 1.0,
                    elevation: 1,
                },
                'md': {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                },
                'lg': {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4.65,
                    elevation: 8,
                },
            },
        },
    },
    plugins: [],
};
