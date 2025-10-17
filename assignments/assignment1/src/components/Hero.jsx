import J from '../assets/J.png'
const Hero = () => {
    return (
        <section className="flex flex-col items-center justify-center text-center min-h-screen px-4">
            <img src={J} alt="Junaid Afzal" className="w-40 h-40 mb-6 rounded-full" />
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 font-heading">Software Engineer & Developer</h1>
            <p className="text-lg sm:text-xl max-w-2xl mb-6 font-display">
                Building scalable apps from mobile to web
                where design meets performance
            </p>
            <div className="flex justify-center gap-3">
                <a href="#projects" className="inline-block bg-primary text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-primary/90 transition-colors ">
                    View My Work
                </a>
                <a href="#contact" className="inline-block ml-4 bg-white text-primary px-6 py-3 rounded-lg text-lg font-medium hover:bg-white/90 transition-colors ">
                    Get in Touch
                </a>
            </div>
        </section>

    )
}

export default Hero
