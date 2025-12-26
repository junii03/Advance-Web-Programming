import Carousel from './Carousel';

export default function MainContent() {
    return (
        <main className="flex-1 theme-bg transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
                <Carousel />
            </div>
        </main>
    );
}
