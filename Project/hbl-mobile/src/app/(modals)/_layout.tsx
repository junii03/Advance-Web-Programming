import { Stack } from 'expo-router';

/**
 * Modals Group Layout
 *
 * Routes:
 * - modal - Generic modal presentation
 *
 * Modals are presented on top of the current stack
 */
export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: true,
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen
        name="modal"
        options={{
          title: 'Modal',
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
