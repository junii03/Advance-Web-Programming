import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleProp, Text, TextInput, TextStyle, View } from 'react-native';

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
  style?: StyleProp<TextStyle>;
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
  style,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={{ width: '100%', marginBottom: 12 }}>
      {label && (
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 }}>
          {label}
        </Text>
      )}
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 8,
            backgroundColor: colors.surfaceAlt,
            borderWidth: 1,
            borderColor: focused ? colors.primary : colors.border,
            paddingHorizontal: 12,
            paddingVertical: 10,
          },
          disabled && { opacity: 0.5 },
        ]}
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
          style={[
            {
              flex: 1,
              fontSize: 16,
              color: colors.text,
              paddingVertical: 2,
            },
            style,
          ]}
          placeholderTextColor={colors.textTertiary}
          testID={testID}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} disabled={disabled}>
            <MaterialCommunityIcons name={rightIcon as any} size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
      {error && <Text style={{ fontSize: 12, color: colors.error, marginTop: 4 }}>{error}</Text>}
    </View>
  );
};
