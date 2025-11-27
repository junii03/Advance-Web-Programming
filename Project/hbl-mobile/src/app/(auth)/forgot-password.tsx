import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { authService } from '@/src/services';
import { ApiError } from '@/src/types/api';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [showFullToken, setShowFullToken] = useState(false);

  /**
   * Mask the reset token for display
   * Shows first 4 and last 4 characters
   */
  const maskToken = (token: string): string => {
    if (token.length <= 8) return token;
    const first = token.substring(0, 4);
    const last = token.substring(token.length - 4);
    const middle = '*'.repeat(Math.min(token.length - 8, 10));
    return `${first}${middle}${last}`;
  };

  const handleForgotPassword = async () => {
    setError('');
    setResetToken(null);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);

      if (response.resetToken) {
        // Development mode - show the token
        setResetToken(response.resetToken);
      } else {
        // Production mode - show success message
        setError(''); // Clear any errors
        // Navigate to reset password with email hint
        router.push({
          pathname: '/(auth)/reset-password' as any,
          params: { email }
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : 'Failed to send reset request. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToReset = () => {
    if (resetToken) {
      router.push({
        pathname: '/(auth)/reset-password' as any,
        params: { token: resetToken, email }
      });
    }
  };

  const copyTokenToClipboard = async () => {
    // In React Native, you'd use Clipboard API
    // For now, just toggle showing the full token
    setShowFullToken(!showFullToken);
  };

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
            <Text className="text-hbl-green ml-2">Back to Login</Text>
          </TouchableOpacity>

          {/* Icon */}
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-hbl-green/10 items-center justify-center">
              <MaterialCommunityIcons
                name="lock-reset"
                size={40}
                color="#006747"
              />
            </View>
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Forgot Password?
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8">
            Enter your email address and we&apos;ll send you a reset token
          </Text>

          {/* Error Message */}
          {error && (
            <View className="mb-4 rounded-lg bg-red-500 px-4 py-3">
              <Text className="text-sm font-medium text-white">{error}</Text>
            </View>
          )}

          {/* Reset Token Display (Development Mode) */}
          {resetToken && (
            <View className="mb-6 rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#16a34a"
                />
                <Text className="text-green-700 dark:text-green-400 font-semibold ml-2">
                  Reset Token Generated!
                </Text>
              </View>

              <Text className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Your password reset token (valid for 10 minutes):
              </Text>

              <TouchableOpacity
                onPress={copyTokenToClipboard}
                className="bg-white dark:bg-gray-800 rounded-lg p-3 flex-row items-center justify-between"
              >
                <Text className="text-sm font-mono text-gray-900 dark:text-white flex-1">
                  {showFullToken ? resetToken : maskToken(resetToken)}
                </Text>
                <MaterialCommunityIcons
                  name={showFullToken ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>

              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Tap to {showFullToken ? 'hide' : 'reveal'} full token
              </Text>

              <Button
                title="Proceed to Reset Password"
                onPress={handleProceedToReset}
                size="lg"
                className="mt-4"
              />
            </View>
          )}

          {/* Email Input */}
          {!resetToken && (
            <>
              <Input
                label="Email Address"
                placeholder="Enter your registered email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />

              {/* Submit Button */}
              <Button
                title="Send Reset Token"
                onPress={handleForgotPassword}
                loading={loading}
                disabled={loading}
                size="lg"
                className="mt-6"
              />
            </>
          )}

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
