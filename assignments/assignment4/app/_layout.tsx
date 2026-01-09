import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function RootLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
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

      {/* Plan Trip Screen */}
      <Stack.Screen
        name="plan-trip"
        options={{
          presentation: 'modal',
          title: 'Plan a Trip',
          headerStyle: {
            backgroundColor: '#9C27B0',
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Trip Details with parameter */}
      <Stack.Screen
        name="trip/[id]"
        options={{
          title: 'Trip Details',
          headerStyle: {
            backgroundColor: '#00BCD4',
          },
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginRight: 16,
  },
});
