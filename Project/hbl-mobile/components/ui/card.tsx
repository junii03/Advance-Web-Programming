import React from 'react';
import { View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  elevated = true,
  padding = 'md'
}) => {
  const paddingClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  }[padding];

  const elevatedClass = elevated ? 'shadow-md' : '';

  return (
    <View
      className={`rounded-lg border border-gray-200 bg-white ${paddingClasses} ${elevatedClass} ${className}`}
    >
      {children}
    </View>
  );
};
