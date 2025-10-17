
const Header = () => {
    return (
        <header className="sticky top-0 z-50 py-4 px-4 sm:px-6 lg:px-8 ">
            <div className="max-w-7xl mx-auto glassmorphic rounded-xl shadow-lg">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => {
                            const element = document.getElementById('home');
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}>
                        <svg className="w-5 h-6 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 15L10 12L7 9M13 15H17M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <h2 className="text-xl font-bold font-heading">JUNAID AFZAL</h2>
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
