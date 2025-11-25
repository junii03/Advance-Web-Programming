import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="profile"
              options={{
                headerShown: false,
                animationEnabled: true,
              }}
            />
            <Stack.Screen
              name="cards"
              options={{
                headerShown: false,
                animationEnabled: true,
              }}
            />
            <Stack.Screen
              name="transfer"
              options={{
                headerShown: false,
                animationEnabled: true,
              }}
            />
            <Stack.Screen
              name="transactions"
              options={{
                headerShown: false,
                animationEnabled: true,
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="login"
              options={{
                headerShown: false,
                animationEnabled: true,
              }}
            />
            <Stack.Screen
              name="signup"
              options={{
                headerShown: false,
                animationEnabled: true,
              }}
            />
          </>
        )}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
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
