import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  className?: string;
};

export function ThemedView({ className, ...otherProps }: ThemedViewProps) {
  return (
    <View
      className={`bg-white dark:bg-background-dark ${className || ''}`}
      {...otherProps}
    />
  );
}
