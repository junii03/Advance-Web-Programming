import J from '../assets/J.png'
const Hero = () => {
    return (
        <section className="flex flex-col items-center justify-center text-center min-h-screen px-4">
            <img src={J} alt="Junaid Afzal" className="w-40 h-40 mb-6 rounded-full" />
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 font-heading">Software Engineer & Developer</h1>
            <p className="mt-2  text-gray-400 text-lg sm:text-xl max-w-2xl mb-6 font-display">
                Building scalable apps from mobile to web
                where design meets performance
            </p>
            <div className="flex justify-center gap-3">
                <a href="#projects" className="inline-block bg-primary text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-primary/90 transition-colors ">
                    View My Work
                </a>
                <a href="#contact" className="glassmorphic inline-block px-6 py-3 rounded-lg text-lg font-medium">
                    Get in Touch
                </a>
            </div>
        </section>

    )
}

export default Hero
