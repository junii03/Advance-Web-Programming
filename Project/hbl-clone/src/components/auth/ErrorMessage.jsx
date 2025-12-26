import PropTypes from 'prop-types';

export default function ErrorMessage({ message }) {
    if (!message) return null;

    return (
        <div className="mb-4 p-3 rounded-lg theme-error-bg text-white text-sm">
            {message}
        </div>
    );
}

ErrorMessage.propTypes = {
    message: PropTypes.string
};
