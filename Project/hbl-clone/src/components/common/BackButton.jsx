import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function BackButton({
    to,
    className = "",
    children = "Back",
    showIcon = true
}) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (to) {
            navigate(to);
        } else {
            navigate(-1); // Go back to previous page
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300
                theme-btn-secondary hover:theme-btn-secondary-hover
                theme-text text-sm font-medium
                border theme-border hover:border-opacity-80
                focus:outline-none focus:ring-2 focus:ring-offset-2 theme-focus-ring
                ${className}`}
        >
            {showIcon && (
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            )}
            <span>{children}</span>
        </button>
    );
}

BackButton.propTypes = {
    to: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node,
    showIcon: PropTypes.bool
};
