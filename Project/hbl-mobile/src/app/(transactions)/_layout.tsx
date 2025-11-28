import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { useColorScheme } from '@/src/hooks/use-color-scheme';

/**
 * Transactions Group Layout
 *
 * Routes:
 * - transfer - Money transfer screen
 * - history - Transaction history
 *
 * This group is shown when user IS authenticated
 */
export default function TransactionsLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackVisible: true,
        contentStyle: {
          backgroundColor: isDark ? '#121212' : '#f9fafb',
        },
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            className="active:opacity-70"
          >
            <View className="flex-row items-center">
              <Ionicons
                name="chevron-back"
                size={24}
                color={isDark ? '#10B981' : '#006747'}
              />
            </View>
          </Pressable>
        ),
        headerStyle: {
          backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
          color: isDark ? '#ffffff' : '#111827',
        },
      }}
    >
      <Stack.Screen
        name="transfer"
        options={{
          title: 'Transfer Money',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'Transaction History',
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
