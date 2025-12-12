import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider, Theme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import '@/global.css';
import { AuthProvider } from '@/src/contexts/auth';
import { ThemeProvider, useTheme } from '@/src/contexts/theme';
import { ToastProvider } from '@/src/components/Toast';
import { WebSocketInitializer } from '@/src/components/WebSocketInitializer';

// Custom themes with proper background colors to prevent white flash during navigation
const CustomLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f9fafb', // gray-50
    card: '#ffffff',
  },
};

const CustomDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#121212', // background-dark
    card: '#1e1e1e', // surface-dark
  },
};

/**
 * Root Layout
 *
 * Routing Structure:
 * - /(auth) - Authentication flows (login, signup)
 * - /(tabs) - Authenticated tab navigation (home, explore)
 * - /(account) - Account-related screens (profile, cards)
 * - /(transactions) - Transaction-related screens (transfer, history)
 * - (modals) - Modal presentations
 */
export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { isDark } = useTheme();

  return (
    <NavigationThemeProvider value={isDark ? CustomDarkTheme : CustomLightTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'default',
          contentStyle: {
            backgroundColor: isDark ? '#121212' : '#f9fafb',
          },
        }}
      >
        {/* Root index - handles auth-based routing */}
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            animation: 'none',
          }}
        />

        {/* Authentication Group */}
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            animation: 'none',
            gestureEnabled: false,
          }}
        />

        {/* Tab Navigation - Main app */}
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />

        {/* Account Group */}
        <Stack.Screen
          name="(account)"
          options={{
            headerShown: false,
          }}
        />

        {/* Transactions Group */}
        <Stack.Screen
          name="(transactions)"
          options={{
            headerShown: false,
          }}
        />

        {/* Customer Group */}
        <Stack.Screen
          name="(customer)"
          options={{
            headerShown: false,
          }}
        />

        {/* Modals */}
        <Stack.Screen
          name="(modals)"
          options={{
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <WebSocketInitializer>
            <RootLayoutNav />
          </WebSocketInitializer>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
