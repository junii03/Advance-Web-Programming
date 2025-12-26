import PropTypes from 'prop-types';

const CarouselImageContent = ({ content, animationKey }) => {
    return (
        <div
            key={`image-${animationKey}`}
            className="order-1 lg:order-2 animate-slide-in-right"
        >
            <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] overflow-hidden rounded-lg sm:rounded-xl shadow-xl sm:shadow-2xl">
                <img
                    src={content.src}
                    alt={content.alt}
                    className="w-full h-full object-fill transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                        // Fallback to a gradient background if image fails to load
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = 'linear-gradient(135deg, #0f766e, #14b8a6)';
                        e.target.parentElement.innerHTML = `
                            <div class="flex items-center justify-center h-full text-white text-lg font-semibold">
                                ${content.title}
                            </div>
                        `;
                    }}
                />
                {/* Image overlay for better visual effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            </div>
        </div>
    );
};

CarouselImageContent.propTypes = {
    content: PropTypes.shape({
        src: PropTypes.string.isRequired,
        alt: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired
    }).isRequired,
    animationKey: PropTypes.number.isRequired
};

export default CarouselImageContent;
