import { Stack } from 'expo-router';
import React from 'react';
import { colors } from '../styles/colors';

/**
 * Root Layout
 * Configures stack navigation for the entire app
 * Includes tab navigation, plan trip modal, trip details, and destination details screens
 */
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.surface,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      {/* Main tab navigation */}
      <Stack.Screen
        name="(tabs)"
        options={{
          title: 'TravelMate',
          headerShown: false,
        }}
      />

      {/* Trip Navigation Stack */}
      <Stack.Screen
        name="(trip)"
        options={{
          headerShown: false,
        }}
      />

      {/* Plan Trip Screen - Modal presentation */}
      <Stack.Screen
        name="plan-trip"
        options={{
          presentation: 'modal',
          title: 'Plan a Trip',
          headerStyle: {
            backgroundColor: colors.secondary,
          },
        }}
      />

      {/* Destination Details Screen */}
      <Stack.Screen
        name="destination-details"
        options={{
          title: 'Destination Details',
          headerStyle: {
            backgroundColor: colors.primary,
          },
        }}
      />
    </Stack>
  );
}
