import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

/**
 * Account Group Layout
 *
 * Routes:
 * - profile - User profile management
 * - cards - User payment cards
 *
 * This group is shown when user IS authenticated
 */
export default function AccountLayout() {
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
        name="profile"
        options={{
          title: 'Profile',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="cards"
        options={{
          title: 'My Cards',
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
