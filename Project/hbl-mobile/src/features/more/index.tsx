import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Image,
  Pressable,

  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/src/contexts/auth';
import { getProfileImageUrl } from '@/src/utils/helper';




interface MenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  route?: string;
  action?: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function MoreScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/login' as never);
            } catch (error) {
              console.error('Logout failed:', error);
            }
          },
        },
      ]
    );
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Banking',
      items: [
        {
          id: 'transactions',
          title: 'Transaction History',
          subtitle: 'View all transactions',
          icon: 'receipt-outline',
          iconColor: '#3B82F6',
          route: '/(customer)/transactions',
        },
        {
          id: 'loans',
          title: 'Loans',
          subtitle: 'Apply and manage loans',
          icon: 'document-text-outline',
          iconColor: '#F59E0B',
          route: '/(customer)/loans',
        },
        {
          id: 'add-account',
          title: 'Open New Account',
          subtitle: 'Apply for a new account',
          icon: 'add-circle-outline',
          iconColor: '#10B981',
          route: '/(customer)/add-account',
        },
        {
          id: 'request-card',
          title: 'Request New Card',
          subtitle: 'Apply for debit/credit card',
          icon: 'card-outline',
          iconColor: '#8B5CF6',
          route: '/(customer)/request-card',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'My Profile',
          subtitle: 'View and edit profile',
          icon: 'person-outline',
          iconColor: '#006747',
          route: '/(account)/profile',
        },
        {
          id: 'notifications',
          title: 'Notifications',
          subtitle: 'View all notifications',
          icon: 'notifications-outline',
          iconColor: '#EF4444',
          route: '/(customer)/notifications',
        },
        {
          id: 'settings',
          title: 'Settings',
          subtitle: 'App preferences',
          icon: 'settings-outline',
          iconColor: '#6B7280',
          route: '/(customer)/settings',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'reports',
          title: 'Report an Issue',
          subtitle: 'Submit complaints or feedback',
          icon: 'flag-outline',
          iconColor: '#F97316',
          route: '/(customer)/reports',
        },
        {
          id: 'help',
          title: 'Help & Support',
          subtitle: 'FAQs and contact support',
          icon: 'help-circle-outline',
          iconColor: '#06B6D4',
          route: '/(customer)/help',
        },
        {
          id: 'about',
          title: 'About HBL Mobile',
          subtitle: 'App version and info',
          icon: 'information-circle-outline',
          iconColor: '#8B5CF6',
          route: '/(customer)/about',
        },
      ],
    },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <Pressable
      key={item.id}
      onPress={() => {
        if (item.action) {
          item.action();
        } else if (item.route) {
          router.push(item.route as never);
        }
      }}
      className="flex-row items-center py-3 px-4 active:bg-gray-50 dark:active:bg-gray-800"
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: `${item.iconColor}15` }}
      >
        <Ionicons name={item.icon} size={22} color={item.iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900 dark:text-white">
          {item.title}
        </Text>
        {item.subtitle && (
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {item.subtitle}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Pressable
          onPress={() => router.push('/(account)/profile' as never)}
          className="bg-white dark:bg-surface-dark mx-4 mt-4 rounded-xl p-4 flex-row items-center active:opacity-90"
        >
          {user?.profileImage ? (
            <Image
              source={{ uri: getProfileImageUrl(user.profileImage) || '' }}
              className="w-16 h-16 rounded-full mr-4"
            />
          ) : (
            <View className="w-16 h-16 rounded-full bg-hbl-green/10 items-center justify-center mr-4">
              <Ionicons name="person" size={32} color="#006747" />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              {user?.name || 'User'}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {user?.email || 'user@example.com'}
            </Text>
            <View className="flex-row items-center mt-1">
              {user?.isEmailVerified ? (
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text className="text-xs text-green-600 ml-1">Verified</Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="alert-circle" size={14} color="#F59E0B" />
                  <Text className="text-xs text-yellow-600 ml-1">Pending Verification</Text>
                </View>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
        </Pressable>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <View key={section.title} className="mt-6">
            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-4 mb-2 uppercase">
              {section.title}
            </Text>
            <View className="bg-white dark:bg-surface-dark mx-4 rounded-xl overflow-hidden">
              {section.items.map((item, index) => (
                <View key={item.id}>
                  {renderMenuItem(item)}
                  {index < section.items.length - 1 && (
                    <View className="h-px bg-gray-100 dark:bg-gray-700 ml-16" />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View className="mt-6 mx-4 mb-8">
          <Pressable
            onPress={handleLogout}
            className="bg-white dark:bg-surface-dark rounded-xl py-4 flex-row items-center justify-center active:bg-red-50"
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text className="text-red-500 font-semibold ml-2">Logout</Text>
          </Pressable>
        </View>

        {/* App Version */}
        <View className="items-center mb-8">
          <Text className="text-xs text-gray-400">HBL Mobile v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
