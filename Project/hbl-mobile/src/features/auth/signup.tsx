import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { useAuth } from '@/src/contexts/auth';
import { SignupData } from '@/src/types';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();

  const [formData, setFormData] = useState<SignupData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cnic: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError('');

    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await signup(formData);
      router.replace('/(tabs)' as any);
    } catch {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof SignupData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <View className="flex-1 px-5 py-6">
          {/* Title */}
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Create Your Account
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Join HBL for digital banking
          </Text>

          {/* Error Message */}
          {error && (
            <View className="mb-4 rounded-lg bg-red-500 px-4 py-3">
              <Text className="text-sm font-medium text-white">{error}</Text>
            </View>
          )}

          {/* Personal Information Section */}
          <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Personal Information
          </Text>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Input
                label="First Name"
                placeholder="First name"
                value={formData.firstName}
                onChangeText={(text) => updateFormData('firstName', text)}
              />
            </View>
            <View className="flex-1">
              <Input
                label="Last Name"
                placeholder="Last name"
                value={formData.lastName}
                onChangeText={(text) => updateFormData('lastName', text)}
              />
            </View>
          </View>

          <Input
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => updateFormData('email', text)}
            keyboardType="email-address"
          />

          <Input
            label="Phone Number"
            placeholder="Enter your phone"
            value={formData.phone}
            onChangeText={(text) => updateFormData('phone', text)}
            keyboardType="phone-pad"
          />

          <Input
            label="CNIC"
            placeholder="Enter your CNIC"
            value={formData.cnic}
            onChangeText={(text) => updateFormData('cnic', text)}
          />

          <Input
            label="Date of Birth"
            placeholder="YYYY-MM-DD"
            value={formData.dateOfBirth}
            onChangeText={(text) => updateFormData('dateOfBirth', text)}
          />

          <Input
            label="Gender"
            placeholder="Select gender"
            value={formData.gender}
            onChangeText={(text) => updateFormData('gender', text)}
          />

          {/* Address Information Section */}
          <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3 mt-6">
            Address Information
          </Text>

          <Input
            label="Street Address"
            placeholder="Enter your address"
            value={formData.address}
            onChangeText={(text) => updateFormData('address', text)}
          />

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Input
                label="City"
                placeholder="City"
                value={formData.city}
                onChangeText={(text) => updateFormData('city', text)}
              />
            </View>
            <View className="flex-1">
              <Input
                label="State"
                placeholder="State"
                value={formData.state}
                onChangeText={(text) => updateFormData('state', text)}
              />
            </View>
          </View>

          {/* Password Section */}
          <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3 mt-6">
            Security
          </Text>

          <Input
            label="Password"
            placeholder="Create a password"
            value={formData.password}
            onChangeText={(text) => updateFormData('password', text)}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? 'eye-off' : 'eye'}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          {/* Submit Button */}
          <Button
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            disabled={loading}
            size="lg"
            className="mt-6 mb-4"
          />

          {/* Login Link */}
          <View className="flex-row items-center justify-center mb-6">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
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
