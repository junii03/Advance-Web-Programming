import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Link Item Component
const LinkItem = ({
  icon,
  title,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className="flex-row items-center py-3 border-b border-gray-100 dark:border-gray-800"
  >
    <Ionicons name={icon} size={20} color="#006747" className="mr-3" />
    <Text className="text-base text-gray-900 dark:text-white flex-1 ml-3">{title}</Text>
    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
  </Pressable>
);

export default function AboutScreen() {
  const router = useRouter();

  const links = [
    {
      icon: 'globe' as const,
      title: 'Visit Website',
      onPress: () => Linking.openURL('https://hbl-clone-project.vercel.app/'),
    },
    {
      icon: 'document-text' as const,
      title: 'Terms of Service',
      onPress: () => Linking.openURL('https://hbl-clone-project.vercel.app'),
    },
    {
      icon: 'shield-checkmark' as const,
      title: 'Privacy Policy',
      onPress: () => Linking.openURL('https://hbl-clone-project.vercel.app'),
    },
    {
      icon: 'information-circle' as const,
      title: 'Licenses',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Ionicons name="chevron-back" size={28} color="#006747" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900 dark:text-white">About</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Logo & App Info */}
        <View className="items-center py-8 bg-white dark:bg-surface-dark">
          <View className="w-20 h-20 rounded-2xl bg-hbl-green items-center justify-center mb-4">
            <Text className="text-3xl font-bold text-white">HBL</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">HBL Mobile</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">Version 1.0.0</Text>
        </View>

        {/* Description */}
        <View className="px-4 py-6">
          <Text className="text-base text-gray-700 dark:text-gray-300 leading-6 text-center">
            HBL Mobile is your banking companion that puts the power of HBL at your fingertips.
            Manage your accounts, transfer money, pay bills, and much more - all from your mobile device.
          </Text>
        </View>

        {/* Links */}
        <View className="bg-white dark:bg-surface-dark mx-4 rounded-xl px-4">
          {links.map((link, index) => (
            <LinkItem key={index} {...link} />
          ))}
        </View>

        {/* Company Info */}
        <View className="px-4 py-6 items-center">
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Habib Bank Limited
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
            Regulated by State Bank of Pakistan
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
            © 2025 Habib Bank Limited. All rights reserved.
          </Text>
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
