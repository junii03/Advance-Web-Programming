/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Custom theme colors
                background: {
                    light: '#ffffff',
                    dark: '#121212'
                },
                surface: {
                    light: '#f8f9fa',
                    dark: '#1e1e1e'
                },
                card: {
                    light: '#ffffff',
                    dark: '#2a2a2a'
                },
                border: {
                    light: '#e5e7eb',
                    dark: '#374151'
                },
                text: {
                    primary: {
                        light: '#111827',
                        dark: '#f9fafb'
                    },
                    secondary: {
                        light: '#6b7280',
                        dark: '#d1d5db'
                    }
                }
            }
        },
    },
    plugins: [],
}
