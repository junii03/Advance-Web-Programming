import { useContext } from 'react';
import { useColorScheme as useSystemColorScheme, Appearance } from 'react-native';

// Re-export useAppColorScheme from theme context for backward compatibility
export { useAppColorScheme } from '@/src/contexts/theme';

// Custom useColorScheme that respects the theme context
export function useColorScheme() {
  // Try to get the color scheme from appearance (which is set by ThemeProvider)
  const appearanceScheme = Appearance.getColorScheme();
  return appearanceScheme ?? 'light';
}
