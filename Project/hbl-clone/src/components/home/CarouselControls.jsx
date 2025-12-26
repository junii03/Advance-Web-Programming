import PropTypes from 'prop-types';

const CarouselControls = ({
    currentSlide,
    totalSlides,
    onGoToSlide,
    onGoToPrevious,
    onGoToNext
}) => {
    return (
        <>
            {/* Mobile Navigation - Swipe gesture area */}
            <div className="sm:hidden absolute inset-0 z-5 pointer-events-none">
                <div
                    className="absolute left-0 top-0 w-1/3 h-full pointer-events-auto cursor-pointer"
                    onClick={onGoToPrevious}
                ></div>
                <div
                    className="absolute right-0 top-0 w-1/3 h-full pointer-events-auto cursor-pointer"
                    onClick={onGoToNext}
                ></div>
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center space-x-1.5 sm:space-x-2 mt-6 sm:mt-8">
                {Array.from({ length: totalSlides }, (_, index) => (
                    <button
                        key={index}
                        onClick={() => onGoToSlide(index)}
                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full cursor-pointer ${index === currentSlide
                            ? 'scale-125 shadow-lg theme-carousel-dot-active'
                            : 'hover:scale-110 theme-carousel-dot'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </>
    );
};

CarouselControls.propTypes = {
    currentSlide: PropTypes.number.isRequired,
    totalSlides: PropTypes.number.isRequired,
    onGoToSlide: PropTypes.func.isRequired,
    onGoToPrevious: PropTypes.func.isRequired,
    onGoToNext: PropTypes.func.isRequired
};

export default CarouselControls;
