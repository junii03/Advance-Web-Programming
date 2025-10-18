import About from "./components/About"
import Footer from "./components/Footer"
import Header from "./components/Header"
import Hero from "./components/Hero"
import Projects from "./components/Projects"

function App() {

    return (
        <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-white font-body relative select-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full filter blur-[150px] opacity-20"></div>
                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-teal-500 via-cyan-500 to-sky-500 rounded-full filter blur-[150px] opacity-20"></div>
            </div>
            <div className="max-w-7xl mx-auto pt-20">
                <Header />
                <Hero />
                <About />
                <Projects />
                <Footer />
            </div>

        </div>
    )
}

export default App
