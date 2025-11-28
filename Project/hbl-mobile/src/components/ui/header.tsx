import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  style?: StyleProp<ViewStyle>;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBackPress,
  rightAction,
  style,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={{ backgroundColor: colors.primary }}>
      <View
        style={[
          {
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
          style,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {onBackPress && (
            <Pressable onPress={onBackPress} style={{ marginRight: 12 }}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
            </Pressable>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF' }}>{title}</Text>
            {subtitle && <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{subtitle}</Text>}
          </View>
        </View>

        {rightAction && (
          <Pressable onPress={rightAction.onPress} style={{ marginLeft: 12 }}>
            <MaterialCommunityIcons name={rightAction.icon as any} size={24} color="#FFFFFF" />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
};
