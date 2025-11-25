import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Header } from '@/components/ui/header';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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
    router.replace('/login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Profile"
        onBackPress={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 16 }}>
        {/* Profile Header */}
        <Card style={{ alignItems: 'center', marginBottom: 24 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <MaterialCommunityIcons name="account-circle" size={60} color="#FFFFFF" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
            {user?.name}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
            ID: {user?.customerId}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
            {user?.email}
          </Text>
        </Card>

        {/* Personal Information */}
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
          Personal Information
        </Text>
        <Card style={{ marginBottom: 20 }}>
          <View style={{ gap: 12 }}>
            <View
              style={{
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>
                Full Name
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                {user?.name}
              </Text>
            </View>
            <View
              style={{
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>
                Email
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                {user?.email}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>
                Customer ID
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                {user?.customerId}
              </Text>
            </View>
          </View>
        </Card>

        {/* Settings */}
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
          Settings
        </Text>
        <Card style={{ marginBottom: 20 }}>
          {profileOptions.map((option, index) => (
            <Pressable
              key={option.label}
              onPress={option.onPress}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: index < profileOptions.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: colors.surfaceAlt,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                <MaterialCommunityIcons name={option.icon as any} size={18} color={colors.primary} />
              </View>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: colors.text }}>
                {option.label}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
            </Pressable>
          ))}
        </Card>

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: `${colors.error}20`,
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.error }}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
