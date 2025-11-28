import { Stack } from 'expo-router';
import React from 'react';

import { useColorScheme } from '@/src/hooks/use-color-scheme';

export default function CustomerLayout() {
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
      <Stack.Screen name="transactions" />
      <Stack.Screen name="loans" />
      <Stack.Screen name="apply-loan" />
      <Stack.Screen name="add-account" />
      <Stack.Screen name="request-card" />
      <Stack.Screen name="account-details" />
      <Stack.Screen name="card-details" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="help" />
      <Stack.Screen name="about" />
    </Stack>
  );
}
