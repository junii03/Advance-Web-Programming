import React from 'react';
import { View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  elevated = true,
  padding = 'md',
  variant = 'default',
}) => {
  const paddingClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  }[padding];

  const elevatedClass = elevated ? 'shadow-md' : '';
  const variantClasses = {
    default: 'rounded-lg border border-gray-200 bg-white dark:bg-surface-dark dark:border-gray-700',
    outlined: 'rounded-lg border-2 border-gray-300 bg-transparent dark:border-gray-600',
  }[variant];

  return (
    <View
      className={`${variantClasses} ${paddingClasses} ${elevatedClass} ${className}`}
    >
      {children}
    </View>
  );
};
