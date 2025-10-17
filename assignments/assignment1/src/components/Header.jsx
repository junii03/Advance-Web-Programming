
const Header = () => {
    return (
        <header className="sticky top-0 z-50 py-4 px-4 sm:px-6 lg:px-8 ">
            <div className="max-w-7xl mx-auto glassmorphic rounded-xl shadow-lg">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <h2 className="text-xl font-bold font-display">JUNAID AFZAL</h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <a className="text-sm font-heading hover:text-primary transition-colors" href="#about">About</a>
                        <a className="text-sm font-heading hover:text-primary transition-colors" href="#projects">Projects</a>
                        <a className="text-sm font-heading hover:text-primary transition-colors" href="#contact">Contact</a>
                    </nav>
                    <a className="hidden md:inline-flex items-center justify-center rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors font-display" href="#contact">
                        Get in Touch
                    </a>
                    <button className="md:hidden p-2 rounded-md hover:bg-white/10 transition-colors">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>

    )
}

export default Header
