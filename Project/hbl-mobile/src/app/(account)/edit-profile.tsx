import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/src/contexts/auth';
import { authService } from '@/src/services/auth.service';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    try {
      setLoading(true);

      await authService.updateDetails({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        address: {
          street: street.trim() || undefined,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          postalCode: postalCode.trim() || undefined,
        },
      });

      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Ionicons name="chevron-back" size={28} color="#006747" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900 dark:text-white flex-1">
          Edit Profile
        </Text>
        <Pressable
          onPress={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-hbl-green rounded-lg"
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-semibold">Save</Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 pt-4">
          {/* Personal Information */}
          <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase">
            Personal Information
          </Text>
          <View className="bg-white dark:bg-surface-dark rounded-xl p-4 mb-6">
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name *
              </Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-50 dark:bg-surface-alt-dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name *
              </Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-50 dark:bg-surface-alt-dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="03001234567"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                className="bg-gray-50 dark:bg-surface-alt-dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
              />
            </View>
          </View>

          {/* Address */}
          <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase">
            Address
          </Text>
          <View className="bg-white dark:bg-surface-dark rounded-xl p-4 mb-6">
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Street Address
              </Text>
              <TextInput
                value={street}
                onChangeText={setStreet}
                placeholder="Enter street address"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-50 dark:bg-surface-alt-dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
              />
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </Text>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="City"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-50 dark:bg-surface-alt-dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State/Province
                </Text>
                <TextInput
                  value={state}
                  onChangeText={setState}
                  placeholder="State"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-50 dark:bg-surface-alt-dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Postal Code
              </Text>
              <TextInput
                value={postalCode}
                onChangeText={setPostalCode}
                placeholder="Postal Code"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                className="bg-gray-50 dark:bg-surface-alt-dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
              />
            </View>
          </View>

          {/* Info Note */}
          <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-8 flex-row">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text className="text-sm text-blue-600 dark:text-blue-400 ml-2 flex-1">
              Some information like email and CNIC cannot be changed. Please visit a branch for such updates.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
