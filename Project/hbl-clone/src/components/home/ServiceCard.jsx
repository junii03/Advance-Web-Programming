import PropTypes from 'prop-types';

export default function ServiceCard({ icon, title, subtitle }) {
    return (
        <div className="flex flex-col items-center text-center p-3 md:p-4 rounded-lg cursor-pointer transition-all duration-300 theme-card-elevated theme-hover-scale">
            <div className="mb-2 md:mb-3">
                {icon}
            </div>
            <h3 className="text-xs md:text-sm font-bold mb-1 theme-heading-2">
                {title}
            </h3>
            {subtitle && (
                <p className="text-xs md:text-sm font-bold theme-text-secondary">
                    {subtitle}
                </p>
            )}
        </div>
    );
}

ServiceCard.propTypes = {
    icon: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string
};
