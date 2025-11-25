import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ children, style, elevated = true, padding = 'md' }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const paddingValues = {
    sm: 8,
    md: 12,
    lg: 16,
  };

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: paddingValues[padding],
          borderWidth: 1,
          borderColor: colors.border,
        },
        elevated && {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
