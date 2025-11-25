import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { Card } from '@/src/components/ui/card';
import { useAuth } from '@/src/contexts/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const profileOptions = [
    { icon: 'account-edit', label: 'Edit Profile', onPress: () => {} },
    { icon: 'lock', label: 'Change Password', onPress: () => {} },
    { icon: 'bell', label: 'Notifications', onPress: () => {} },
    { icon: 'security', label: 'Security Settings', onPress: () => {} },
    { icon: 'file-document', label: 'Documents', onPress: () => {} },
    { icon: 'help-circle', label: 'Help & Support', onPress: () => {} },
  ];

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login' as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Profile Header */}
        <Card className="mb-6 flex-col items-center">
          <View className="h-20 w-20 flex-center mb-3 rounded-full bg-hbl-red">
            <MaterialCommunityIcons name="account-circle" size={60} color="#FFFFFF" />
          </View>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            {user?.name}
          </Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            ID: {user?.customerId}
          </Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400">
            {user?.email}
          </Text>
        </Card>

        {/* Personal Information */}
        <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Personal Information
        </Text>
        <Card className="mb-6">
          <View className="gap-3">
            <View className="pb-3 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Full Name
              </Text>
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                {user?.name}
              </Text>
            </View>
            <View className="pb-3 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Email
              </Text>
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                {user?.email}
              </Text>
            </View>
            <View>
              <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Customer ID
              </Text>
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                {user?.customerId}
              </Text>
            </View>
          </View>
        </Card>

        {/* Settings */}
        <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Settings
        </Text>
        <Card className="mb-6">
          {profileOptions.map((option, index) => (
            <Pressable
              key={option.label}
              onPress={option.onPress}
              className={`flex-row items-center py-3 active:opacity-70 ${
                index < profileOptions.length - 1
                  ? 'border-b border-gray-200 dark:border-gray-700'
                  : ''
              }`}
            >
              <View className="h-9 w-9 flex-center mr-3 rounded-lg bg-gray-100 dark:bg-surface-alt-dark">
                <MaterialCommunityIcons
                  name={option.icon as any}
                  size={18}
                  color="#DC143C"
                />
              </View>
              <Text className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
                {option.label}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#9CA3AF"
              />
            </Pressable>
          ))}
        </Card>

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          className="py-3 px-4 rounded-lg bg-red-500/10 items-center mb-6 active:opacity-70"
        >
          <Text className="text-sm font-semibold text-red-500">Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
