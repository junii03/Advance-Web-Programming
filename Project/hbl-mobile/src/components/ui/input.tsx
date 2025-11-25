import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

interface InputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  label?: string;
  error?: string;
  disabled?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  rightIcon?: string;
  onRightIconPress?: () => void;
  className?: string;
  testID?: string;
}

export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  label,
  error,
  disabled = false,
  keyboardType = 'default',
  rightIcon,
  onRightIconPress,
  className = '',
  testID,
}) => {
  const [focused, setFocused] = React.useState(false);

  return (
    <View className={`w-full mb-4 ${className}`}>
      {label && (
        <Text className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center rounded-md border-2 bg-gray-50 px-4 py-3 transition-colors dark:bg-surface-dark ${
          focused
            ? 'border-hbl-red dark:border-hbl-red-light'
            : 'border-gray-200 dark:border-gray-600'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          editable={!disabled}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 text-base text-gray-900 dark:text-white"
          placeholderTextColor="#9CA3AF"
          testID={testID}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} disabled={disabled} className="ml-3 active:opacity-70">
            <MaterialCommunityIcons
              name={rightIcon as any}
              size={20}
              color={disabled ? '#D1D5DB' : '#666'}
            />
          </Pressable>
        )}
      </View>
      {error && (
        <Text className="mt-2 text-xs font-medium text-red-500 dark:text-error-light">
          {error}
        </Text>
      )}
    </View>
  );
};
