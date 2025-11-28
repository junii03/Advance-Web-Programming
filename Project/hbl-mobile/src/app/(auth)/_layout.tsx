import { Stack } from 'expo-router';

import { useColorScheme } from '@/src/hooks/use-color-scheme';

/**
 * Auth Group Layout
 *
 * Routes:
 * - login - User login screen
 * - signup - User registration screen
 *
 * This group is shown when user is NOT authenticated
 */
export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? '#121212' : '#f9fafb',
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'Login',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: 'Sign Up',
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
