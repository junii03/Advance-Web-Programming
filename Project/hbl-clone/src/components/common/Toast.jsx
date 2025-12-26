import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({
    message,
    type = 'success',
    duration = 5000,
    position = 'top-right',
    onClose,
    showCloseButton = true,
    autoClose = true
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (autoClose && duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, autoClose]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            if (onClose) onClose();
        }, 300); // Match animation duration
    };

    if (!isVisible) return null;

    // Toast type configurations
    const typeConfig = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            borderColor: 'border-green-200 dark:border-green-800',
            textColor: 'text-green-800 dark:text-green-200',
            iconColor: 'text-green-600 dark:text-green-400'
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            borderColor: 'border-red-200 dark:border-red-800',
            textColor: 'text-red-800 dark:text-red-200',
            iconColor: 'text-red-600 dark:text-red-400'
        },
        warning: {
            icon: AlertCircle,
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            borderColor: 'border-yellow-200 dark:border-yellow-800',
            textColor: 'text-yellow-800 dark:text-yellow-200',
            iconColor: 'text-yellow-600 dark:text-yellow-400'
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            borderColor: 'border-blue-200 dark:border-blue-800',
            textColor: 'text-blue-800 dark:text-blue-200',
            iconColor: 'text-blue-600 dark:text-blue-400'
        }
    };

    // Position configurations
    const positionClasses = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };

    const config = typeConfig[type] || typeConfig.info;
    const Icon = config.icon;

    return (
        <div
            className={`
                fixed z-50 ${positionClasses[position]}
                ${isExiting ? 'animate-out slide-out-to-right' : 'animate-in slide-in-from-right'}
                transition-all duration-300 ease-in-out
            `}
        >
            <div
                className={`
                    ${config.bgColor} ${config.borderColor} ${config.textColor}
                    border rounded-lg shadow-lg p-4 min-w-[300px] max-w-md
                    backdrop-blur-sm
                `}
            >
                <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium break-words">
                            {message}
                        </p>
                    </div>

                    {showCloseButton && (
                        <button
                            onClick={handleClose}
                            className={`
                                ${config.iconColor} hover:opacity-75
                                flex-shrink-0 p-0.5 rounded
                                transition-opacity duration-200
                                focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current
                            `}
                            aria-label="Close notification"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Progress bar for auto-close */}
                {autoClose && duration > 0 && (
                    <div className="mt-3 w-full bg-white/20 dark:bg-black/20 rounded-full h-1 overflow-hidden">
                        <div
                            className={`h-full ${config.iconColor.replace('text-', 'bg-')} rounded-full animate-progress`}
                            style={{
                                animation: `progress ${duration}ms linear forwards`
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// Toast Container component for managing multiple toasts
export const ToastContainer = ({ toasts = [], onRemoveToast }) => {
    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id || index}
                    className="pointer-events-auto"
                    style={{
                        transform: `translateY(${index * 80}px)`
                    }}
                >
                    <Toast
                        {...toast}
                        onClose={() => onRemoveToast && onRemoveToast(toast.id || index)}
                    />
                </div>
            ))}
        </div>
    );
};

// Hook for managing toasts
export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'success', options = {}) => {
        const id = Date.now() + Math.random();
        const toast = {
            id,
            message,
            type,
            ...options
        };

        setToasts(prev => [...prev, toast]);

        // Auto remove if duration is set
        if (options.autoClose !== false) {
            const duration = options.duration || 5000;
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const clearToasts = () => {
        setToasts([]);
    };

    return {
        toasts,
        addToast,
        removeToast,
        clearToasts,
        success: (message, options) => addToast(message, 'success', options),
        error: (message, options) => addToast(message, 'error', options),
        warning: (message, options) => addToast(message, 'warning', options),
        info: (message, options) => addToast(message, 'info', options)
    };
};

// CSS for animations (should be added to global styles)
const toastStyles = `
@keyframes progress {
    from { width: 100%; }
    to { width: 0%; }
}

.animate-progress {
    animation: progress var(--duration, 5000ms) linear forwards;
}

@keyframes slide-in-from-right {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slide-out-to-right {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.animate-in.slide-in-from-right {
    animation: slide-in-from-right 300ms ease-out;
}

.animate-out.slide-out-to-right {
    animation: slide-out-to-right 300ms ease-in;
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = toastStyles;
    document.head.appendChild(style);
}

export default Toast;
