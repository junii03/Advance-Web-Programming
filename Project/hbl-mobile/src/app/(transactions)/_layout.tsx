import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

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

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackVisible: true,
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            className="active:opacity-70"
          >
            <View className="flex-row items-center">
              <Ionicons
                name="chevron-back"
                size={24}
                color="#DC143C"
              />
            </View>
          </Pressable>
        ),
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
          color: '#111827',
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
