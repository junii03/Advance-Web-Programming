import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({
    size = 'md',
    variant = 'default',
    text = '',
    className = '',
    showText = true,
    color = 'accent'
}) => {
    // Size configurations
    const sizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
        '2xl': 'w-16 h-16'
    };

    // Color configurations
    const colorClasses = {
        accent: 'theme-accent',
        primary: 'text-blue-600',
        secondary: 'theme-text-secondary',
        success: 'theme-success',
        warning: 'theme-warning',
        error: 'theme-error',
        white: 'text-white',
        muted: 'theme-text-muted'
    };

    // Text size based on spinner size
    const textSizeClasses = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl'
    };

    // Variants for different use cases
    const variants = {
        default: 'flex flex-col items-center justify-center',
        inline: 'inline-flex items-center gap-2',
        overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
        card: 'flex flex-col items-center justify-center p-6 theme-card-elevated rounded-lg',
        fullscreen: 'min-h-screen flex flex-col items-center justify-center theme-container'
    };

    const spinnerSize = sizeClasses[size] || sizeClasses.md;
    const spinnerColor = colorClasses[color] || colorClasses.accent;
    const textSize = textSizeClasses[size] || textSizeClasses.md;
    const variantClass = variants[variant] || variants.default;

    const defaultTexts = {
        xs: 'Loading...',
        sm: 'Loading...',
        md: 'Loading...',
        lg: 'Please wait...',
        xl: 'Loading content...',
        '2xl': 'Loading content...'
    };

    const displayText = text || (showText ? defaultTexts[size] : '');

    return (
        <div className={`${variantClass} ${className}`}>
            <Loader2
                className={`${spinnerSize} ${spinnerColor} animate-spin`}
                aria-hidden="true"
            />
            {displayText && variant !== 'inline' && (
                <span className={`mt-2 ${textSize} theme-text-secondary font-medium`}>
                    {displayText}
                </span>
            )}
            {displayText && variant === 'inline' && (
                <span className={`${textSize} theme-text-secondary font-medium`}>
                    {displayText}
                </span>
            )}
            <span className="sr-only">Loading...</span>
        </div>
    );
};

// Preset components for common use cases
export const LoadingSpinnerFullscreen = ({ text = "Loading...", ...props }) => (
    <LoadingSpinner
        variant="fullscreen"
        size="xl"
        text={text}
        {...props}
    />
);

export const LoadingSpinnerOverlay = ({ text = "Processing...", ...props }) => (
    <LoadingSpinner
        variant="overlay"
        size="lg"
        text={text}
        color="white"
        {...props}
    />
);

export const LoadingSpinnerCard = ({ text = "Loading content...", ...props }) => (
    <LoadingSpinner
        variant="card"
        size="lg"
        text={text}
        {...props}
    />
);

export const LoadingSpinnerInline = ({ text = "Loading...", size = "sm", ...props }) => (
    <LoadingSpinner
        variant="inline"
        size={size}
        text={text}
        {...props}
    />
);

export const LoadingSpinnerButton = ({ ...props }) => (
    <LoadingSpinner
        variant="inline"
        size="sm"
        showText={false}
        color="white"
        {...props}
    />
);

export default LoadingSpinner;
