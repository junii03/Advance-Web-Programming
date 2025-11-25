import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, Text, ViewStyle } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    } as StyleProp<ViewStyle>;

    const sizeStyle = {
      sm: { paddingVertical: 8, paddingHorizontal: 12, minHeight: 32 },
      md: { paddingVertical: 12, paddingHorizontal: 16, minHeight: 44 },
      lg: { paddingVertical: 14, paddingHorizontal: 20, minHeight: 52 },
    }[size];

    const variantStyle =
      variant === 'primary'
        ? { backgroundColor: disabled ? colors.textTertiary : colors.primary }
        : variant === 'secondary'
          ? { backgroundColor: colors.secondary }
          : variant === 'danger'
            ? { backgroundColor: colors.error }
            : {
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: colors.primary,
              };

    return [baseStyle, sizeStyle, variantStyle, style];
  };

  const getTextStyle = () => {
    const textSize = {
      sm: 14,
      md: 16,
      lg: 18,
    }[size];

    return {
      fontSize: textSize,
      fontWeight: '600' as const,
      color: variant === 'outline' ? colors.primary : '#FFFFFF',
      marginLeft: loading ? 8 : 0,
    };
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        getButtonStyle(),
        pressed && { opacity: 0.7 },
        disabled && { opacity: 0.5 },
      ]}
      testID={testID}
    >
      {loading && <ActivityIndicator size="small" color="#FFFFFF" />}
      <Text style={getTextStyle()}>{title}</Text>
    </Pressable>
  );
};
