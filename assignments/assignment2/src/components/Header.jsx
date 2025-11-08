import React, { useEffect, useRef, useState } from 'react'
import sun from '../assets/icons8-sun.apng'
import moon from '../assets/icons8-moon.apng'
import cart from '../assets/icons8-shopping-cart.apng'

const Header = () => {
    const [theme, setTheme] = useState('')

    const transitionTimeout = useRef(null)

    useEffect(() => {
        // Determine initial theme: localStorage -> OS preference -> light
        const stored = localStorage.getItem('theme')
        if (stored) {
            setTheme(stored)
            applyTheme(stored)
        } else {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            const initial = prefersDark ? 'dark' : 'light'
            setTheme(initial)
            applyTheme(initial)
        }

        return () => {
            // cleanup any pending timeout and transition classes
            if (transitionTimeout.current) {
                clearTimeout(transitionTimeout.current)
                transitionTimeout.current = null
            }
            try {
                document.documentElement.classList.remove('theme-transition')
                document.body.classList.remove('theme-transition')
            } catch {
                /* ignore in non-browser env */
            }
        }
    }, [])

    function applyTheme(value) {
        // Use data-theme attribute so `src/index.css` rules apply
        if (value === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark')
            // Also add the Tailwind 'dark' class so dark: utilities apply
            document.documentElement.classList.add('dark')
        } else {
            // Set explicit light theme so OS-level prefers-color-scheme media queries
            // do not override user's explicit choice when we want light
            document.documentElement.setAttribute('data-theme', 'light')
            document.documentElement.classList.remove('dark')
        }

        // Add a short theme-transition class so color/background changes animate smoothly.
        // Clear any previous timeout so rapid toggles don't leak classes.
        try {
            if (transitionTimeout.current) {
                clearTimeout(transitionTimeout.current)
            }
            document.documentElement.classList.add('theme-transition')
            document.body.classList.add('theme-transition')
            transitionTimeout.current = window.setTimeout(() => {
                document.documentElement.classList.remove('theme-transition')
                document.body.classList.remove('theme-transition')
                transitionTimeout.current = null
            }, 220)
        } catch {
            // ignore in non-browser environment
        }
    }

    function toggleTheme() {
        const next = theme === 'dark' ? 'light' : 'dark'
        setTheme(next)
        localStorage.setItem('theme', next)
        applyTheme(next)
    }

    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-theme px-4 py-4 md:px-6">
            <div className="flex items-center gap-4 theme-text">
                <img src={cart} alt="" />
                <h2 className="theme-text text-xl font-bold leading-tight tracking-[-0.015em]">Products Store</h2>
            </div>

            <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 gap-2s leading-normal tracking-[0.015em] min-w-0"
            >
                <img
                    className=' object-contain'
                    src={theme !== 'dark' ? moon : sun}
                    alt="" />
            </button>
        </header>
    )
}

export default Header
