import PropTypes from 'prop-types';

export default function MobileAppCard({ appName, appDescription, image }) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-lg justify-self-center">
            {/* Text content - appears first on mobile, right side on desktop */}
            <div className="flex-1 text-center md:text-left order-1 md:order-2">
                <h2 className="text-xl md:text-3xl font-bold mb-2 theme-heading-1">
                    {appName}
                </h2>
                <p className="theme-text-secondary text-sm md:text-base">
                    {appDescription}
                </p>
            </div>

            {/* Image - appears second on mobile, left side on desktop */}
            <img
                src={image}
                alt={`${appName} logo`}
                className="flex-shrink-0  h-50  md:h-100 object-contain order-2 md:order-1"
            />
        </div>
    );
}

MobileAppCard.propTypes = {
    appName: PropTypes.string.isRequired,
    appDescription: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired, // fixed from `node` to `string`
};
