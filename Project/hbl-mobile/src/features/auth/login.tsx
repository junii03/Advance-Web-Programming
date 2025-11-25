import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { useAuth } from '@/src/contexts/auth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)' as any);
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="safe-area">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-5 py-6">
          {/* Logo */}
          <View className="mb-8 items-center">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-hbl-red">
              <Text className="text-4xl font-bold text-white">HBL</Text>
            </View>
            <Text className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              Welcome Back
            </Text>
            <Text className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sign in to your HBL account
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="mb-4 rounded-lg bg-red-500 px-4 py-3">
              <Text className="text-sm font-medium text-white">{error}</Text>
            </View>
          )}

          {/* Form Fields */}
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? 'eye-off' : 'eye'}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          {/* Forgot Password Link */}
          <Text
            className="mb-6 text-right text-sm font-semibold text-hbl-red active:opacity-70"
            onPress={() => {}}
          >
            Forgot Password?
          </Text>

          {/* Login Button */}
          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            size="lg"
            className="mb-4"
          />

          {/* Sign Up Link */}
          <View className="flex-row items-center justify-center">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {`Don't have an account? `}
            </Text>
            <Text
              className="text-sm font-semibold text-hbl-red active:opacity-70"
              onPress={() => router.push('/(auth)/signup' as any)}
            >
              Sign Up
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
