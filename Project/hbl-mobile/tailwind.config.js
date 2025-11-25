/** @type {import('tailwindcss').Config} */
module.exports = {
    // Update these paths to include all locations using NativeWind className
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./screens/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                // HBL Brand Colors
                'hbl-red': '#DC143C',
                'hbl-red-light': '#FF6B6B',
                'hbl-red-dark': '#9C0E2E',
                'hbl-blue': '#003366',
                'hbl-gold': '#FFB81C',

                // Status colors
                'success': '#10B981',
                'warning': '#F59E0B',
                'error': '#EF4444',
                'info': '#3B82F6',
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
        },
    },
    plugins: [],
};
