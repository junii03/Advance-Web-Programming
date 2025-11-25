import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  testID,
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2 min-h-8',
    md: 'px-4 py-3 min-h-11',
    lg: 'px-5 py-3.5 min-h-13',
  }[size];

  const variantClasses = {
    primary: `${disabled ? 'bg-gray-400' : 'bg-hbl-green'} active:opacity-70`,
    secondary: 'bg-hbl-blue active:opacity-70',
    danger: 'bg-red-500 active:opacity-70',
    outline: 'bg-transparent border-2 border-hbl-green active:opacity-70',
  }[variant];

  const textColorClass = variant === 'outline' ? 'text-hbl-green' : 'text-white';
  const textSizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center rounded-md ${sizeClasses} ${variantClasses} ${disabled ? 'opacity-50' : ''} ${className || ''}`}
      testID={testID}
    >
      {loading && <ActivityIndicator size="small" color="white" className="mr-2" />}
      <Text className={`font-semibold ${textSizeClass} ${textColorClass} ${loading ? 'ml-2' : ''}`}>
        {title}
      </Text>
    </Pressable>
  );
};
