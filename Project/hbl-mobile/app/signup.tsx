import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Colors } from '@/constants/theme';
import { SignupData, useAuth } from '@/contexts/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function SignupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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
      router.replace('/(tabs)');
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Create Account"
        onBackPress={() => router.back()}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 24 }}>
          {/* Title */}
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
            Create Your Account
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 24 }}>
            Join HBL for digital banking
          </Text>

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

          {/* Personal Information Section */}
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Personal Information
          </Text>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
            <View style={{ flex: 1 }}>
              <Input
                label="First Name"
                placeholder="First name"
                value={formData.firstName}
                onChangeText={(text) => updateFormData('firstName', text)}
              />
            </View>
            <View style={{ flex: 1 }}>
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
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 12, marginTop: 20 }}>
            Address Information
          </Text>

          <Input
            label="Street Address"
            placeholder="Enter your address"
            value={formData.address}
            onChangeText={(text) => updateFormData('address', text)}
          />

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
            <View style={{ flex: 1 }}>
              <Input
                label="City"
                placeholder="City"
                value={formData.city}
                onChangeText={(text) => updateFormData('city', text)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="State"
                placeholder="State"
                value={formData.state}
                onChangeText={(text) => updateFormData('state', text)}
              />
            </View>
          </View>

          {/* Password Section */}
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 12, marginTop: 20 }}>
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
            style={{ marginTop: 24, marginBottom: 16 }}
          />

          {/* Login Link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              Already have an account?{' '}
            </Text>
            <Text
              style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}
              onPress={() => router.push('/login')}
            >
              Sign In
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
