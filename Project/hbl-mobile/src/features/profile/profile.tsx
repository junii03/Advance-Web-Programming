import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/src/components/ui/card';
import { useAuth } from '@/src/contexts/auth';
import { getProfileImageUrl } from '@/src/utils/helper';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const profileOptions = [
    { icon: 'account-edit', label: 'Edit Profile', onPress: () => router.push('/(account)/edit-profile' as any) },
    { icon: 'lock', label: 'Change Password', onPress: () => router.push('/(account)/change-password' as any) },
    { icon: 'bell', label: 'Notifications', onPress: () => router.push('/(customer)/notifications' as any) },
    { icon: 'security', label: 'Security Settings', onPress: () => router.push('/(customer)/settings' as any) },
    { icon: 'file-document', label: 'Documents', onPress: () => {} },
    { icon: 'help-circle', label: 'Help & Support', onPress: () => router.push('/(customer)/help' as any) },
  ];

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login' as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Ionicons name="chevron-back" size={28} color="#006747" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900 dark:text-white flex-1">
          Profile
        </Text>
      </View>

      <FlatList
        data={profileOptions}
        keyExtractor={(item) => item.label}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <>
            {/* Profile Header */}
            <Card className="mb-6 flex-col items-center">
              {user?.profileImage ? (
                <Image
                  source={{ uri: getProfileImageUrl(user.profileImage) || '' }}
                  className="w-20 h-20 rounded-full mb-4"
                />
              ) : (
                <View className="w-20 h-20 rounded-full mb-4 bg-gray-200 dark:bg-surface-alt-dark flex-center">
                  <MaterialCommunityIcons
                    name="account"
                    size={40}
                    color="#9CA3AF"
                  />
                </View>
              )}
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                {user?.name}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                ID: {user?.id}
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
                    {user?.id}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Settings */}
            <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Settings
            </Text>
          </>
        }
        renderItem={({ item: option, index }) => (
          <Pressable
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
        )}
        ListFooterComponent={
          <View className="mt-6">
            <Card>
              <Pressable
                onPress={handleLogout}
                className="py-3 px-4 items-center active:opacity-70"
              >
                <Text className="text-sm font-semibold text-red-500">Sign Out</Text>
              </Pressable>
            </Card>
            <View className="h-6" />
          </View>
        }
      />
    </SafeAreaView>
  );
}
