import { View, type ViewProps, useColorScheme } from 'react-native';

export type ThemedViewProps = ViewProps & {
  className?: string;
};

export function ThemedView({ className, style, ...otherProps }: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      className={`bg-white dark:bg-background-dark ${className || ''}`}
      style={[{ backgroundColor: isDark ? '#121212' : '#ffffff' }, style]}
      {...otherProps}
    />
  );
}
