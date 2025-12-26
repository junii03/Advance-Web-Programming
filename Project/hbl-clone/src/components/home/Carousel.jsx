import CarouselTextContent from './CarouselTextContent';
import CarouselImageContent from './CarouselImageContent';
import CarouselControls from './CarouselControls';
import useCarousel from '../../scripts/hooks/useCarousel';
import { carouselData } from '../../scripts/data/carouselData';

const Carousel = () => {
    const {
        currentSlide,
        animationKey,
        currentContent,
        goToSlide,
        goToPrevious,
        goToNext,
        totalSlides
    } = useCarousel(carouselData);

    return (
        <div className="relative w-full min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16 items-center h-full">
                {/* Text Content - Left Side */}
                <CarouselTextContent
                    content={currentContent}
                    animationKey={animationKey}
                />

                {/* Image Content - Right Side */}
                <CarouselImageContent
                    content={currentContent}
                    animationKey={animationKey}
                />
            </div>

            {/* Navigation Controls */}
            <CarouselControls
                currentSlide={currentSlide}
                totalSlides={totalSlides}
                onGoToSlide={goToSlide}
                onGoToPrevious={goToPrevious}
                onGoToNext={goToNext}
            />

            {/* Carousel Animations */}
            <style jsx>{`
                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .animate-slide-in-left {
                    animation: slideInLeft 0.8s ease-out forwards;
                }

                .animate-slide-in-right {
                    animation: slideInRight 0.8s ease-out forwards;
                }

                /* Mobile-specific adjustments */
                @media (max-width: 640px) {
                    .animate-slide-in-left {
                        animation: slideInLeft 0.6s ease-out forwards;
                    }

                    .animate-slide-in-right {
                        animation: slideInRight 0.6s ease-out forwards;
                    }
                }

                /* Smooth transitions for responsive changes */
                * {
                    transition-property: margin, padding, font-size, width, height;
                    transition-duration: 0.2s;
                    transition-timing-function: ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default Carousel;
