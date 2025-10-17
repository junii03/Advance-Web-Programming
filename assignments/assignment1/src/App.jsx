import About from "./components/About"
import Footer from "./components/Footer"
import Header from "./components/Header"
import Hero from "./components/Hero"
import Projects from "./components/Projects"

function App() {

    return (
        <body className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-white font-body relative min-h-screen w-full">
            <Header />
            <Hero />
            <About />
            <Projects />
            <Footer />
        </body>
    )
}

export default App
