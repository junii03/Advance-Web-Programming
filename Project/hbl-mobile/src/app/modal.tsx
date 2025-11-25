import { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ModalScreen({ visible, onClose, onConfirm }: ModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="w-11/12 rounded-lg bg-white p-6">
          <Text className="text-lg font-bold">Modal Title</Text>
          <Text className="mt-4 text-gray-600">Modal content goes here</Text>
          <View className="mt-6 flex-row justify-end gap-2">
            <Pressable onPress={onClose} className="px-4 py-2">
              <Text className="text-blue-500">Cancel</Text>
            </Pressable>
            <Pressable onPress={onConfirm} className="rounded bg-blue-500 px-4 py-2">
              <Text className="text-white">Confirm</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
