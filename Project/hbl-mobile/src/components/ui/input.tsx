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
    <View className={`w-full mb-3 ${className}`}>
      {label && (
        <Text className="mb-1.5 text-sm font-semibold text-gray-900">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center rounded-lg border-2 bg-gray-50 px-3 py-2.5 ${
          focused ? 'border-hbl-red' : 'border-gray-200'
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
          className="flex-1 text-base text-gray-900"
          placeholderTextColor="#999"
          testID={testID}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} disabled={disabled} className="ml-2">
            <MaterialCommunityIcons name={rightIcon as any} size={20} color="#666" />
          </Pressable>
        )}
      </View>
      {error && <Text className="mt-1 text-xs font-medium text-red-500">{error}</Text>}
    </View>
  );
};
