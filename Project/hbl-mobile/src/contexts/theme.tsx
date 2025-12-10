import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useColorScheme as useSystemColorScheme, Appearance } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';
type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@hbl_theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
          setThemeModeState(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    loadTheme();
  }, []);

  // Save theme preference when it changes
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, []);

  // Toggle between light and dark mode (not system)
  const toggleDarkMode = useCallback(() => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
  }, [themeMode, setThemeMode]);

  // Calculate the actual color scheme based on theme mode
  const colorScheme: ColorScheme = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme ?? 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  const isDark = colorScheme === 'dark';

  // Update theme class on root element when color scheme changes
  useEffect(() => {
    if (isInitialized) {
      // For web: update the document root class
      if (typeof document !== 'undefined') {
        const htmlElement = document.documentElement;
        htmlElement.classList.remove('light', 'dark');
        htmlElement.classList.add(colorScheme);
      }
    }
  }, [colorScheme, isInitialized]);

  const value = useMemo(
    () => ({
      themeMode,
      colorScheme,
      isDark,
      setThemeMode,
      toggleDarkMode,
    }),
    [themeMode, colorScheme, isDark, setThemeMode, toggleDarkMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Custom hook that returns the actual color scheme (for backward compatibility)
export function useAppColorScheme(): ColorScheme {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Fallback to system color scheme if not in ThemeProvider
    const systemScheme = Appearance.getColorScheme();
    return systemScheme ?? 'light';
  }
  return context.colorScheme;
}
