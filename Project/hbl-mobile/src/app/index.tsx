import { Redirect } from 'expo-router';
import { View, ActivityIndicator, useColorScheme } from 'react-native';

import { useAuth } from '@/src/contexts/auth';

/**
 * Root Index Route
 *
 * This route handles conditional rendering based on authentication state
 * Routes authenticated users to (tabs) and unauthenticated users to (auth)/login
 */
export default function RootIndex() {
  const { isAuthenticated, isInitialized } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Wait for auth state to initialize (checking stored token)
  if (!isInitialized) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: isDark ? '#121212' : '#f9fafb' }}
      >
        <ActivityIndicator size="large" color="#006747" />
      </View>
    );
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}
