import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { authService } from '@/src/services';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImageAsset {
  uri: string;
  name: string;
  type: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cnic: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  city: string;
  state: string;
  postalCode: string;
  password: string;
}

export default function SignupScreen() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cnic: '',
    dateOfBirth: '',
    gender: 'male',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    password: '',
  });

  const [profilePicture, setProfilePicture] = useState<ImageAsset | null>(null);
  const [cnicFront, setCnicFront] = useState<ImageAsset | null>(null);
  const [cnicBack, setCnicBack] = useState<ImageAsset | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Request camera/gallery permissions
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload images.'
        );
        return false;
      }
    }
    return true;
  };

  // Pick image from gallery
  const pickImage = async (
    setImage: React.Dispatch<React.SetStateAction<ImageAsset | null>>,
    imageType: string
  ) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: imageType === 'profile' ? [1, 1] : [16, 10],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const fileName = asset.fileName || `${imageType}_${Date.now()}.jpg`;
      const mimeType = asset.mimeType || 'image/jpeg';

      setImage({
        uri: asset.uri,
        name: fileName,
        type: mimeType,
      });
    }
  };

  // Create FormData for multipart upload
  const createFormData = (): globalThis.FormData | null => {
    if (!profilePicture || !cnicFront || !cnicBack) {
      setError('Please upload all required images');
      return null;
    }

    const data = new FormData();

    // Add text fields
    data.append('firstName', formData.firstName);
    data.append('lastName', formData.lastName);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('phone', formData.phone);
    data.append('cnic', formData.cnic);
    data.append('dateOfBirth', formData.dateOfBirth);
    data.append('gender', formData.gender);

    // Add address as JSON string
    const addressObj = {
      street: formData.address,
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode || '00000',
      country: 'Pakistan',
    };
    data.append('address', JSON.stringify(addressObj));

    // Add image files
    data.append('profilePicture', {
      uri: profilePicture.uri,
      name: profilePicture.name,
      type: profilePicture.type,
    } as unknown as Blob);

    data.append('cnicFront', {
      uri: cnicFront.uri,
      name: cnicFront.name,
      type: cnicFront.type,
    } as unknown as Blob);

    data.append('cnicBack', {
      uri: cnicBack.uri,
      name: cnicBack.name,
      type: cnicBack.type,
    } as unknown as Blob);

    return data;
  };

  const handleSignup = async () => {
    setError('');

    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.cnic ||
      !formData.dateOfBirth ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.password
    ) {
      setError('Please fill in all required fields');
      return;
    }

    if (!profilePicture || !cnicFront || !cnicBack) {
      setError('Please upload profile picture and both sides of CNIC');
      return;
    }

    // Validate CNIC format
    const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]$/;
    if (!cnicRegex.test(formData.cnic)) {
      setError('CNIC format should be: 12345-1234567-1');
      return;
    }

    // Validate phone format
    const phoneRegex = /^(\+92|0)?[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid Pakistani phone number');
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    const multipartData = createFormData();
    if (!multipartData) return;

    setLoading(true);
    try {
      await authService.registerWithFiles(multipartData);
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)' as never) },
      ]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Image picker component
  const ImagePickerBox = ({
    image,
    onPress,
    label,
    aspectRatio = 1,
  }: {
    image: ImageAsset | null;
    onPress: () => void;
    label: string;
    aspectRatio?: number;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
      style={{ aspectRatio }}
    >
      {image ? (
        <Image source={{ uri: image.uri }} className="w-full h-full" resizeMode="cover" />
      ) : (
        <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-800 p-4">
          <Ionicons name="camera" size={32} color="#9CA3AF" />
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
            {label}
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">Tap to upload</Text>
        </View>
      )}
    </TouchableOpacity>
  );

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

          {/* Profile Picture Section */}
          <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Profile Picture *
          </Text>
          <View className="w-32 h-32 self-center mb-4">
            <ImagePickerBox
              image={profilePicture}
              onPress={() => pickImage(setProfilePicture, 'profile')}
              label="Profile Photo"
              aspectRatio={1}
            />
          </View>

          {/* Personal Information Section */}
          <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Personal Information
          </Text>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Input
                label="First Name *"
                placeholder="First name"
                value={formData.firstName}
                onChangeText={(text) => updateFormData('firstName', text)}
              />
            </View>
            <View className="flex-1">
              <Input
                label="Last Name *"
                placeholder="Last name"
                value={formData.lastName}
                onChangeText={(text) => updateFormData('lastName', text)}
              />
            </View>
          </View>

          <Input
            label="Email *"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => updateFormData('email', text)}
            keyboardType="email-address"
          />

          <Input
            label="Phone Number *"
            placeholder="03001234567"
            value={formData.phone}
            onChangeText={(text) => updateFormData('phone', text)}
            keyboardType="phone-pad"
          />

          <Input
            label="CNIC *"
            placeholder="12345-1234567-1"
            value={formData.cnic}
            onChangeText={(text) => updateFormData('cnic', text)}
          />

          <Input
            label="Date of Birth *"
            placeholder="YYYY-MM-DD"
            value={formData.dateOfBirth}
            onChangeText={(text) => updateFormData('dateOfBirth', text)}
          />

          {/* Gender Selection */}
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Gender *
          </Text>
          <View className="flex-row gap-3 mb-4">
            {(['male', 'female', 'other'] as const).map((gender) => (
              <TouchableOpacity
                key={gender}
                onPress={() => updateFormData('gender', gender)}
                className={`flex-1 py-3 rounded-lg border ${
                  formData.gender === gender
                    ? 'border-hbl-green bg-hbl-green/10'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <Text
                  className={`text-center capitalize ${
                    formData.gender === gender
                      ? 'text-hbl-green font-semibold'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Address Information Section */}
          <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3 mt-2">
            Address Information
          </Text>

          <Input
            label="Street Address *"
            placeholder="Enter your address"
            value={formData.address}
            onChangeText={(text) => updateFormData('address', text)}
          />

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Input
                label="City *"
                placeholder="City"
                value={formData.city}
                onChangeText={(text) => updateFormData('city', text)}
              />
            </View>
            <View className="flex-1">
              <Input
                label="State *"
                placeholder="State"
                value={formData.state}
                onChangeText={(text) => updateFormData('state', text)}
              />
            </View>
          </View>

          <Input
            label="Postal Code"
            placeholder="74000"
            value={formData.postalCode}
            onChangeText={(text) => updateFormData('postalCode', text)}
            keyboardType="numeric"
          />

          {/* CNIC Documents Section */}
          <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3 mt-6">
            CNIC Documents *
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Upload clear images of both sides of your CNIC
          </Text>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs text-gray-600 dark:text-gray-400 mb-2 text-center">
                Front Side
              </Text>
              <ImagePickerBox
                image={cnicFront}
                onPress={() => pickImage(setCnicFront, 'cnic_front')}
                label="CNIC Front"
                aspectRatio={1.6}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-600 dark:text-gray-400 mb-2 text-center">
                Back Side
              </Text>
              <ImagePickerBox
                image={cnicBack}
                onPress={() => pickImage(setCnicBack, 'cnic_back')}
                label="CNIC Back"
                aspectRatio={1.6}
              />
            </View>
          </View>

          {/* Password Section */}
          <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3 mt-6">
            Security
          </Text>

          <Input
            label="Password *"
            placeholder="Minimum 8 characters"
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
              onPress={() => router.push('/(auth)/login' as never)}
            >
              Sign In
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
