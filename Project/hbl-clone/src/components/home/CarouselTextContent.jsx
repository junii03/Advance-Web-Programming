import PropTypes from 'prop-types';

const CarouselTextContent = ({ content, animationKey }) => {
    return (
        <div
            key={`text-${animationKey}`}
            className="space-y-4 sm:space-y-6 lg:space-y-8 order-2 lg:order-1 animate-slide-in-left transition-colors duration-300 theme-text"
        >
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight sm:leading-tight lg:leading-tight theme-heading-1">
                    {content.title}
                </h1>
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium leading-relaxed theme-accent">
                    {content.subtitle}
                </h2>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-prose theme-text-secondary">
                    {content.description}
                </p>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                <button className="theme-btn-primary text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base">
                    Learn More
                </button>
                <button className="theme-btn-secondary px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base">
                    Get Started
                </button>
            </div>
        </div>
    );
};

CarouselTextContent.propTypes = {
    content: PropTypes.shape({
        title: PropTypes.string.isRequired,
        subtitle: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired
    }).isRequired,
    animationKey: PropTypes.number.isRequired
};

export default CarouselTextContent;
