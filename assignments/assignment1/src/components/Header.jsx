
const Header = () => {
    return (
        <header className="sticky top-0 z-50 py-4 px-4 sm:px-6 lg:px-8 ">
            <div className="max-w-7xl mx-auto glassmorphic rounded-xl shadow-lg">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4 cursor-pointer"
                        onClick={() => {
                            const element = document.getElementById('home');
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <h2 className="text-xl font-bold font-display">JUNAID AFZAL</h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <div className="text-sm font-heading hover:text-primary transition-colors cursor-pointer"
                            onClick={() => {
                                const element = document.getElementById('about');
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                        >About</div>
                        <div className="text-sm font-heading hover:text-primary transition-colors
                        cursor-pointer"
                            onClick={() => {
                                const element = document.getElementById('projects');
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth' });
                                }
                            }} >Projects</div>
                        <div className="text-sm font-heading hover:text-primary transition-colors cursor-pointer"
                            onClick={() => {
                                const element = document.getElementById('contact');
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}>Contact</div>
                    </nav>
                    <div className="hidden md:inline-flex items-center justify-center rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors font-displaycursor-pointer"
                        onClick={() => {
                            const element = document.getElementById('contact');
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}>
                        Get in Touch
                    </div>
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
