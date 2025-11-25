import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

/**
 * Modal Screen
 *
 * Displayed as a modal presentation on top of other screens
 */
export default function ModalScreen() {
  const [visible, setVisible] = useState(false);

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-background-dark">
      <Pressable
        onPress={() => setVisible(true)}
        className="rounded-md bg-hbl-red px-6 py-3 active:opacity-70"
      >
        <Text className="text-base font-semibold text-white">
          Open Modal
        </Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="w-11/12 rounded-lg bg-white p-6 dark:bg-surface-dark">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              Modal Title
            </Text>
            <Text className="mt-4 text-gray-600 dark:text-gray-400">
              Modal content goes here
            </Text>
            <View className="mt-6 flex-row justify-end gap-2">
              <Pressable
                onPress={() => setVisible(false)}
                className="px-4 py-2 active:opacity-70"
              >
                <Text className="text-hbl-blue">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setVisible(false)}
                className="rounded-md bg-hbl-red px-4 py-2 active:opacity-70"
              >
                <Text className="text-white font-semibold">
                  Confirm
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
