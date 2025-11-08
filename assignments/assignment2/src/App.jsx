import React from 'react'
import Header from './components/Header'
import Hero from './sections/Hero'
import Gallery from './sections/Gallery'
import Contact from './sections/Contact'
import Footer from './components/Footer'

function App() {
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
                <div className="flex flex-1 justify-center py-5">
                    <div className="layout-content-container flex flex-col max-w-6xl flex-1 px-4 sm:px-6 lg:px-8">
                        <Header />

                        <main>
                            <Hero />

                            <h2 className="theme-text text-3xl font-bold leading-tight tracking-tight px-4 pb-4 pt-5 text-center md:text-4xl">Our Products</h2>

                            <Gallery />

                            <Contact />

                            <Footer />
                        </main>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
