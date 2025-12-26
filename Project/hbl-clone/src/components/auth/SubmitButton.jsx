import PropTypes from 'prop-types';

export default function SubmitButton({ loading, children, className = "" }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className={`w-full theme-btn-primary text-white py-3 rounded-lg font-semibold text-sm transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
        >
            {loading ? (
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{typeof loading === 'string' ? loading : 'Processing...'}</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
}

SubmitButton.propTypes = {
    loading: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    children: PropTypes.node.isRequired,
    className: PropTypes.string
};
