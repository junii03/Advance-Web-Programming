import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { authService } from '@/src/services';
import { ApiError } from '@/src/types/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string; email?: string }>();

  const [resetToken, setResetToken] = useState(params.token || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Pre-fill token if passed from forgot password screen
  useEffect(() => {
    if (params.token) {
      setResetToken(params.token);
    }
  }, [params.token]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return null;
  };

  const handleResetPassword = async () => {
    setError('');

    // Validation
    if (!resetToken) {
      setError('Please enter the reset token');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(resetToken, newPassword);
      setSuccess(true);

      // Auto-navigate to login after success
      setTimeout(() => {
        router.replace('/(auth)/login' as any);
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : 'Failed to reset password. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
        <View className="flex-1 items-center justify-center px-5">
          <View className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/20 items-center justify-center mb-6">
            <MaterialCommunityIcons
              name="check-circle"
              size={60}
              color="#16a34a"
            />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Password Reset Successful!
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
            Your password has been updated. Redirecting to login...
          </Text>
          <Button
            title="Go to Login"
            onPress={() => router.replace('/(auth)/login' as any)}
            size="lg"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-5 py-6">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-6 flex-row items-center"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#006747"
            />
            <Text className="text-hbl-green ml-2">Back</Text>
          </TouchableOpacity>

          {/* Icon */}
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-hbl-green/10 items-center justify-center">
              <MaterialCommunityIcons
                name="lock-check"
                size={40}
                color="#006747"
              />
            </View>
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Reset Password
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8">
            Enter your reset token and create a new password
          </Text>

          {/* Error Message */}
          {error && (
            <View className="mb-4 rounded-lg bg-red-500 px-4 py-3">
              <Text className="text-sm font-medium text-white">{error}</Text>
            </View>
          )}

          {/* Info about email */}
          {params.email && (
            <View className="mb-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border border-blue-200 dark:border-blue-800">
              <Text className="text-sm text-blue-700 dark:text-blue-400">
                Resetting password for: <Text className="font-semibold">{params.email}</Text>
              </Text>
            </View>
          )}

          {/* Reset Token Input */}
          <Input
            label="Reset Token"
            placeholder="Enter the reset token"
            value={resetToken}
            onChangeText={setResetToken}
          />

          {/* New Password Input */}
          <Input
            label="New Password"
            placeholder="Enter new password (min 8 characters)"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? 'eye-off' : 'eye'}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          {/* Confirm Password Input */}
          <Input
            label="Confirm Password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            rightIcon={showConfirmPassword ? 'eye-off' : 'eye'}
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          {/* Password Requirements */}
          <View className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Password Requirements:
            </Text>
            <View className="flex-row items-center mb-1">
              <MaterialCommunityIcons
                name={newPassword.length >= 8 ? 'check-circle' : 'circle-outline'}
                size={16}
                color={newPassword.length >= 8 ? '#16a34a' : '#9ca3af'}
              />
              <Text className={`text-xs ml-2 ${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                At least 8 characters
              </Text>
            </View>
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name={newPassword && newPassword === confirmPassword ? 'check-circle' : 'circle-outline'}
                size={16}
                color={newPassword && newPassword === confirmPassword ? '#16a34a' : '#9ca3af'}
              />
              <Text className={`text-xs ml-2 ${newPassword && newPassword === confirmPassword ? 'text-green-600' : 'text-gray-500'}`}>
                Passwords match
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <Button
            title="Reset Password"
            onPress={handleResetPassword}
            loading={loading}
            disabled={loading}
            size="lg"
            className="mt-2"
          />

          {/* Back to Login Link */}
          <View className="flex-row items-center justify-center mt-6">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{' '}
            </Text>
            <Text
              className="text-sm font-semibold text-hbl-green active:opacity-70"
              onPress={() => router.push('/(auth)/login' as any)}
            >
              Sign In
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
