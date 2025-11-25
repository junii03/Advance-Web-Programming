import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/src/contexts/auth';
import { useColorScheme } from '@/src/hooks/use-color-scheme';

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
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        {/* Root index - handles auth-based routing */}
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            animationEnabled: false,
          }}
        />

        {/* Authentication Group */}
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            animationEnabled: false,
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

        {/* Modals */}
        <Stack.Screen
          name="(modals)"
          options={{
            presentation: 'modal',
            headerShown: false,
            animationEnabled: true,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
