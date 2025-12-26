import React from 'react';
import { AlertCircle } from 'lucide-react';

const LoadingState = ({ message = "Loading your dashboard..." }) => {
    return (
        <div className="min-h-screen theme-container flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 theme-border-accent mx-auto mb-4"></div>
                <p className="theme-text">{message}</p>
            </div>
        </div>
    );
};

const ErrorState = ({ error, onRetry }) => {
    return (
        <div className="min-h-screen theme-container flex items-center justify-center">
            <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="theme-text mb-4">{error}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="theme-btn-primary px-4 py-2 rounded-lg"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
};

export { LoadingState, ErrorState };
