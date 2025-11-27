import { Stack } from 'expo-router';
import React from 'react';

export default function CustomerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
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
