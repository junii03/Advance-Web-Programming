import { Stack } from 'expo-router';
import React from 'react';

import { useColorScheme } from '@/src/hooks/use-color-scheme';

/**
 * Account Group Layout
 *
 * Routes:
 * - profile - User profile management
 * - edit-profile - Edit user profile
 * - change-password - Change password
 * - cards - User payment cards
 *
 * This group is shown when user IS authenticated
 */
export default function AccountLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? '#121212' : '#f9fafb',
        },
        animation: 'default',
      }}
    >
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="cards" />
    </Stack>
  );
}
