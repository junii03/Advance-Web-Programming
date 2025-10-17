import About from "./components/About"
import Footer from "./components/Footer"
import Header from "./components/Header"
import Hero from "./components/Hero"
import Projects from "./components/Projects"

function App() {

    return (
        <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-white font-body relative">
            <Header />
            <Hero />
            <About />
            <Projects />
            <Footer />
        </div>
    )
}

export default App
