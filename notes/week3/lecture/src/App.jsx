import Header from './components/Header'
import Main from './components/Main'
import Footer from './components/Footer'
import "./style.css";

function App() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow flex justify-center items-center">
                <Main />
            </main>
            <Footer />
        </div>
    )
}

export default App
