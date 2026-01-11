import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

/**
 * Tab Layout Configuration
 * Bottom Tab Navigation with Home, Explore, and Profile tabs
 * Using Ionicons for professional tab icons
 */
export default function TabLayout() {
  // Custom tab bar background with elevation
  const tabBarBackground = () => (
    <View
      style={styles.tabBarBackground}
    />
  );

  return (
    <Tabs
      screenOptions={({ route }: { route: any }): BottomTabNavigationOptions => ({
        // Hide headers for clean tab navigation
        headerShown: false,

        // Tab bar styling
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: styles.tabBar,
        tabBarBackground,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,

        // Screen options
        sceneStyle: { backgroundColor: colors.background },
      })}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* Explore Tab */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingBottom: spacing.xs,
    paddingTop: spacing.xs,
    height: 60,
  },
  tabBarBackground: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  tabBarIcon: {
    marginTop: spacing.xs,
  },
});
