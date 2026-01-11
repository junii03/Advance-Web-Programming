import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { colors } from '../../styles/colors';

/**
 * Trip Stack Navigation
 * Handles trip-related screens with stack navigation
 */
export default function TripStackLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.surface,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerBackTitle: 'Back',
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      {/* Trip Home Screen */}
      <Stack.Screen
        name="index"
        options={{
          title: 'My Trips',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 16 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.surface} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Trip Details Screen */}
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Trip Details',
        }}
      />
    </Stack>
  );
}
