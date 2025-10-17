import J from '../assets/J.png'
const Hero = () => {
    return (
        <section className="flex flex-col items-center justify-center text-center  px-4" id="home">
            <img src={J} alt="Junaid Afzal" className="w-40 h-40 mb-12 rounded-full" />
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 font-heading">Software Engineer & Developer</h1>
            <p className="mt-2  text-gray-400 text-lg sm:text-xl max-w-2xl mb-6 font-display">
                Building scalable apps from mobile to web
                where design meets performance
            </p>
            <div className="flex justify-center gap-3 mt-6">
                <a href="#projects" className="inline-block bg-primary text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-primary/90 transition-colors ">
                    View My Work
                </a>
                <a href="#contact" className="glassmorphic inline-block px-6 py-3 rounded-lg text-lg font-medium">
                    Get in Touch
                </a>
            </div>
            {/* <div className="mt-15 cursor-pointer font-display flex items-center gap-2" onClick={() => {
                const element = document.getElementById('about');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }}>
                <span className="text-gray-400 font-display">Scroll Down</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3.8C9 3.51997 9 3.37996 9.0545 3.273C9.10243 3.17892 9.17892 3.10243 9.273 3.0545C9.37996 3 9.51997 3 9.8 3H14.2C14.48 3 14.62 3 14.727 3.0545C14.8211 3.10243 14.8976 3.17892 14.9455 3.273C15 3.37996 15 3.51997 15 3.8V14H19L12 21L5 14H9V3.8Z" stroke="currentColor" strokWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div> */}
        </section>

    )
}

export default Hero
