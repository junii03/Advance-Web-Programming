import { Redirect } from 'expo-router';

import { useAuth } from '@/src/contexts/auth';

/**
 * Root Index Route
 *
 * This route handles conditional rendering based on authentication state
 * Routes authenticated users to (tabs) and unauthenticated users to (auth)/login
 */
export default function RootIndex() {
  const { isAuthenticated, isLoading } = useAuth();

  // Wait for auth state to load
  if (isLoading) {
    return null;
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}
