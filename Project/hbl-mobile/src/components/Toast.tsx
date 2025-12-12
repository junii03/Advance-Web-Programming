import React, { useRef, useEffect, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Toast Notification Component
 * Displays brief notifications at the top of the screen
 */

const toastConfig = {
  transaction: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-l-4 border-blue-500',
    icon: 'swap-horizontal',
    color: '#3B82F6',
  },
  account: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    border: 'border-l-4 border-green-500',
    icon: 'wallet',
    color: '#10B981',
  },
  card: {
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    border: 'border-l-4 border-purple-500',
    icon: 'card',
    color: '#8B5CF6',
  },
  loan: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    border: 'border-l-4 border-amber-500',
    icon: 'cash',
    color: '#F59E0B',
  },
  security: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    border: 'border-l-4 border-red-500',
    icon: 'shield-checkmark',
    color: '#EF4444',
  },
  promo: {
    bg: 'bg-pink-50 dark:bg-pink-900/30',
    border: 'border-l-4 border-pink-500',
    icon: 'gift',
    color: '#EC4899',
  },
  system: {
    bg: 'bg-gray-50 dark:bg-gray-900/30',
    border: 'border-l-4 border-gray-500',
    icon: 'information-circle',
    color: '#6B7280',
  },
};

interface Toast {
  id: string;
  title: string;
  message: string;
  type: keyof typeof toastConfig;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider - Wraps app to provide toast functionality
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random()}`;
    const fullToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 4000,
    };

    setToasts((prev) => [...prev, fullToast]);

    // Auto-hide after duration
    if (fullToast.duration && fullToast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, fullToast.duration);
    }
  };

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          toast={toast}
          onDismiss={() => hideToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

/**
 * Individual Toast Component
 */
const ToastNotification: React.FC<{
  toast: Toast;
  onDismiss: () => void;
}> = ({ toast, onDismiss }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const config = toastConfig[toast.type] || toastConfig.system;

  useEffect(() => {
    // Slide in animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleDismiss = () => {
    // Slide out animation
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(onDismiss);
  };

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
      }}
      className="absolute top-0 left-0 right-0 z-50 px-4 pt-14"
    >
      <Pressable
        onPress={handleDismiss}
        className={`${config.bg} ${config.border} rounded-lg shadow-lg p-4 flex-row items-start`}
      >
        <View className="mr-3 mt-0.5">
          <Ionicons
            name={config.icon as any}
            size={20}
            color={config.color}
          />
        </View>

        <View className="flex-1">
          <Text
            className="font-semibold text-gray-900 dark:text-white"
            numberOfLines={1}
          >
            {toast.title}
          </Text>
          <Text
            className="text-sm text-gray-600 dark:text-gray-300 mt-1"
            numberOfLines={2}
          >
            {toast.message}
          </Text>
        </View>

        <Pressable
          onPress={handleDismiss}
          className="ml-2 p-1"
        >
          <Ionicons
            name="close"
            size={18}
            color="#9CA3AF"
          />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

/**
 * Hook to use Toast
 */
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export default ToastProvider;
