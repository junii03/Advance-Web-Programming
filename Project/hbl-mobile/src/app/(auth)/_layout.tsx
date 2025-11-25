import { Stack } from 'expo-router';

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
  return (
    <Stack screenOptions={{ headerShown: false }}>
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
