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

import { authService } from '@/src/services/auth.service';

export default function ChangePasswordScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('One number');
    }
    return errors;
  };

  const passwordErrors = validatePassword(newPassword);
  const isPasswordValid = passwordErrors.length === 0 && newPassword.length > 0;
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!isPasswordValid) {
      Alert.alert('Error', 'Please meet all password requirements');
      return;
    }

    if (!doPasswordsMatch) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      await authService.updatePassword({
        currentPassword,
        newPassword,
      });

      Alert.alert(
        'Success',
        'Your password has been changed successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      console.error('Failed to change password:', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to change password. Please check your current password.'
      );
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
          Change Password
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 pt-6">
          {/* Current Password */}
          <View className="bg-white dark:bg-surface-dark rounded-xl p-4 mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password
            </Text>
            <View className="flex-row items-center bg-gray-50 dark:bg-surface-alt-dark border border-gray-200 dark:border-gray-700 rounded-lg">
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showCurrentPassword}
                className="flex-1 px-4 py-3 text-gray-900 dark:text-white"
              />
              <Pressable
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                className="px-4"
              >
                <Ionicons
                  name={showCurrentPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6B7280"
                />
              </Pressable>
            </View>
          </View>

          {/* New Password */}
          <View className="bg-white dark:bg-surface-dark rounded-xl p-4 mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </Text>
            <View className="flex-row items-center bg-gray-50 dark:bg-surface-alt-dark border border-gray-200 dark:border-gray-700 rounded-lg mb-3">
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showNewPassword}
                className="flex-1 px-4 py-3 text-gray-900 dark:text-white"
              />
              <Pressable
                onPress={() => setShowNewPassword(!showNewPassword)}
                className="px-4"
              >
                <Ionicons
                  name={showNewPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6B7280"
                />
              </Pressable>
            </View>

            {/* Password Requirements */}
            <View className="space-y-1">
              <Text className="text-xs font-medium text-gray-500 mb-2">
                Password must contain:
              </Text>
              {[
                { label: 'At least 8 characters', met: newPassword.length >= 8 },
                { label: 'One uppercase letter', met: /[A-Z]/.test(newPassword) },
                { label: 'One lowercase letter', met: /[a-z]/.test(newPassword) },
                { label: 'One number', met: /[0-9]/.test(newPassword) },
              ].map((req) => (
                <View key={req.label} className="flex-row items-center">
                  <Ionicons
                    name={req.met ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={req.met ? '#10B981' : '#9CA3AF'}
                  />
                  <Text
                    className={`text-xs ml-2 ${
                      req.met ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {req.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Confirm Password */}
          <View className="bg-white dark:bg-surface-dark rounded-xl p-4 mb-6">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password
            </Text>
            <View className="flex-row items-center bg-gray-50 dark:bg-surface-alt-dark border border-gray-200 dark:border-gray-700 rounded-lg">
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                className="flex-1 px-4 py-3 text-gray-900 dark:text-white"
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="px-4"
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6B7280"
                />
              </Pressable>
            </View>
            {confirmPassword.length > 0 && (
              <View className="flex-row items-center mt-2">
                <Ionicons
                  name={doPasswordsMatch ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={doPasswordsMatch ? '#10B981' : '#EF4444'}
                />
                <Text
                  className={`text-xs ml-2 ${
                    doPasswordsMatch ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {doPasswordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </Text>
              </View>
            )}
          </View>

          {/* Security Note */}
          <View className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 mb-6 flex-row">
            <Ionicons name="shield-checkmark" size={20} color="#F59E0B" />
            <Text className="text-sm text-yellow-700 dark:text-yellow-400 ml-2 flex-1">
              For your security, you will remain logged in after changing your password.
            </Text>
          </View>

          {/* Change Password Button */}
          <Pressable
            onPress={handleChangePassword}
            disabled={loading || !isPasswordValid || !doPasswordsMatch || !currentPassword}
            className={`py-4 rounded-xl items-center mb-8 ${
              loading || !isPasswordValid || !doPasswordsMatch || !currentPassword
                ? 'bg-gray-300 dark:bg-gray-700'
                : 'bg-hbl-green'
            }`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Change Password</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
