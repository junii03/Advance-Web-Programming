import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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
      router.replace('/(tabs)');
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingVertical: 24,
            justifyContent: 'center',
          }}
        >
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 32, fontWeight: '700', color: '#FFFFFF' }}>HBL</Text>
            </View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: colors.text,
                marginTop: 16,
              }}
            >
              Welcome Back
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginTop: 8,
              }}
            >
              Sign in to your HBL account
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View
              style={{
                backgroundColor: colors.error,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 14, color: '#FFFFFF', fontWeight: '500' }}>{error}</Text>
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
            style={{
              fontSize: 14,
              color: colors.primary,
              fontWeight: '600',
              marginBottom: 24,
              textAlign: 'right',
            }}
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
            style={{ marginBottom: 16 }}
          />

          {/* Sign Up Link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              {`Don't have an account? `}
            </Text>
            <Text
              style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}
              onPress={() => router.push('/signup')}
            >
              Sign Up
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
