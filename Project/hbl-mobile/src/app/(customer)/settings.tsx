import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';

import { useAuth } from '@/src/contexts/auth';

// Settings section type
interface SettingItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: 'toggle' | 'navigate' | 'action';
  value?: boolean;
  description?: string;
  onPress?: () => void;
  danger?: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Settings state
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: true,
    biometricLogin: false,
    transactionAlerts: true,
    marketingEmails: false,
    darkMode: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
            await logout();
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is irreversible. All your data will be permanently deleted. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In real app, call deleteAccount API
            Alert.alert('Request Submitted', 'Your account deletion request has been submitted. Our team will contact you shortly.');
          },
        },
      ]
    );
  };

  // Settings sections
  const sections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          label: 'Edit Profile',
          icon: 'person',
          type: 'navigate',
          description: 'Update your personal information',
          onPress: () => router.push('/(account)/profile' as never),
        },
        {
          id: 'change-password',
          label: 'Change Password',
          icon: 'lock-closed',
          type: 'navigate',
          description: 'Update your account password',
          onPress: () => router.push('/(account)/change-password' as never),
        },
        {
          id: 'biometric',
          label: 'Biometric Login',
          icon: 'finger-print',
          type: 'toggle',
          value: settings.biometricLogin,
          description: 'Use Face ID or fingerprint to login',
          onPress: () => toggleSetting('biometricLogin'),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'push',
          label: 'Push Notifications',
          icon: 'notifications',
          type: 'toggle',
          value: settings.pushNotifications,
          onPress: () => toggleSetting('pushNotifications'),
        },
        {
          id: 'email',
          label: 'Email Notifications',
          icon: 'mail',
          type: 'toggle',
          value: settings.emailNotifications,
          onPress: () => toggleSetting('emailNotifications'),
        },
        {
          id: 'sms',
          label: 'SMS Notifications',
          icon: 'chatbubble',
          type: 'toggle',
          value: settings.smsNotifications,
          onPress: () => toggleSetting('smsNotifications'),
        },
        {
          id: 'transaction-alerts',
          label: 'Transaction Alerts',
          icon: 'swap-horizontal',
          type: 'toggle',
          value: settings.transactionAlerts,
          description: 'Get notified for every transaction',
          onPress: () => toggleSetting('transactionAlerts'),
        },
        {
          id: 'marketing',
          label: 'Marketing Emails',
          icon: 'megaphone',
          type: 'toggle',
          value: settings.marketingEmails,
          description: 'Receive offers and promotions',
          onPress: () => toggleSetting('marketingEmails'),
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          id: 'dark-mode',
          label: 'Dark Mode',
          icon: 'moon',
          type: 'toggle',
          value: settings.darkMode,
          description: 'Use dark theme throughout the app',
          onPress: () => toggleSetting('darkMode'),
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          id: 'devices',
          label: 'Manage Devices',
          icon: 'phone-portrait',
          type: 'navigate',
          description: 'View and manage logged in devices',
          onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon.'),
        },
        {
          id: 'login-history',
          label: 'Login History',
          icon: 'time',
          type: 'navigate',
          description: 'View recent login activity',
          onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon.'),
        },
        {
          id: 'two-factor',
          label: 'Two-Factor Authentication',
          icon: 'shield-checkmark',
          type: 'navigate',
          description: 'Add extra security to your account',
          onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon.'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          label: 'Help Center',
          icon: 'help-circle',
          type: 'navigate',
          onPress: () => Alert.alert('Help Center', 'Contact us at support@hbl.com or call 111-111-425'),
        },
        {
          id: 'faq',
          label: 'FAQs',
          icon: 'document-text',
          type: 'navigate',
          onPress: () => Alert.alert('Coming Soon', 'FAQ section will be available soon.'),
        },
        {
          id: 'feedback',
          label: 'Send Feedback',
          icon: 'chatbox-ellipses',
          type: 'navigate',
          onPress: () => Alert.alert('Feedback', 'Thank you for your interest! Email us at feedback@hbl.com'),
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          id: 'terms',
          label: 'Terms of Service',
          icon: 'document',
          type: 'navigate',
          onPress: () => Alert.alert('Terms of Service', 'View full terms at hbl.com/terms'),
        },
        {
          id: 'privacy',
          label: 'Privacy Policy',
          icon: 'shield',
          type: 'navigate',
          onPress: () => Alert.alert('Privacy Policy', 'View full policy at hbl.com/privacy'),
        },
        {
          id: 'version',
          label: 'App Version',
          icon: 'information-circle',
          type: 'navigate',
          description: '1.0.0',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        {
          id: 'logout',
          label: 'Logout',
          icon: 'log-out',
          type: 'action',
          danger: true,
          onPress: handleLogout,
        },
        {
          id: 'delete-account',
          label: 'Delete Account',
          icon: 'trash',
          type: 'action',
          danger: true,
          description: 'Permanently delete your account',
          onPress: handleDeleteAccount,
        },
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </Pressable>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Settings</Text>
      </View>

      <ScrollView className="flex-1">
        {/* User Info Card */}
        <View className="px-4 py-4">
          <View className="bg-white dark:bg-surface-dark rounded-xl p-4 flex-row items-center">
            <View className="w-14 h-14 rounded-full bg-hbl-green items-center justify-center mr-4">
              <Text className="text-white text-xl font-bold">
                {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400">{user?.email}</Text>
            </View>
            <Pressable
              onPress={() => router.push('/(account)/profile' as never)}
              className="p-2"
            >
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>

        {/* Settings Sections */}
        {sections.map((section) => (
          <View key={section.title} className="mb-4">
            <Text className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">
              {section.title}
            </Text>
            <View className="bg-white dark:bg-surface-dark mx-4 rounded-xl overflow-hidden">
              {section.items.map((item, index) => (
                <Pressable
                  key={item.id}
                  onPress={item.type !== 'toggle' ? item.onPress : undefined}
                  className={`flex-row items-center px-4 py-3.5 ${
                    index < section.items.length - 1
                      ? 'border-b border-gray-100 dark:border-gray-800'
                      : ''
                  } active:opacity-80`}
                >
                  <View
                    className={`w-9 h-9 rounded-lg items-center justify-center mr-3 ${
                      item.danger ? 'bg-red-100' : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={item.danger ? '#EF4444' : '#6B7280'}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-medium ${
                        item.danger ? 'text-red-500' : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {item.label}
                    </Text>
                    {item.description && (
                      <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.description}
                      </Text>
                    )}
                  </View>
                  {item.type === 'toggle' && (
                    <Switch
                      value={item.value}
                      onValueChange={item.onPress}
                      trackColor={{ false: '#E5E7EB', true: '#006747' }}
                      thumbColor="#FFFFFF"
                      ios_backgroundColor="#E5E7EB"
                    />
                  )}
                  {item.type === 'navigate' && !item.description?.match(/^\d/) && (
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Footer */}
        <View className="px-4 py-6 items-center">
          <Text className="text-sm text-gray-400 mb-1">HBL Mobile Banking</Text>
          <Text className="text-xs text-gray-400">© 2024 Habib Bank Limited</Text>
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
