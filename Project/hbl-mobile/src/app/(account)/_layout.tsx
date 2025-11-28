import { Stack } from 'expo-router';
import React from 'react';

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
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="cards" />
    </Stack>
  );
}
