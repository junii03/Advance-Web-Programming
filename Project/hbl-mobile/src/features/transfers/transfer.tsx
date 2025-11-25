import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';

export default function TransferScreen() {

  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
    transferType: 'own-account',
  });

  const handleTransfer = () => {
    alert('Transfer initiated!');
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
      >
        <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Transfer money between accounts or to other users
        </Text>

        {/* Transfer Type Selection */}
        <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Transfer Type
        </Text>
        <View className="flex-row gap-3 mb-6">
          {[
            { id: 'own-account', label: 'Own Account' },
            { id: 'other-account', label: 'Other Account' },
          ].map((type) => (
            <Pressable
              key={type.id}
              onPress={() => setFormData({ ...formData, transferType: type.id })}
              className={`flex-1 py-3 px-3 rounded-lg border-2 active:opacity-70 ${
                formData.transferType === type.id
                  ? 'border-hbl-green bg-hbl-green/10'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-surface-dark'
              }`}
            >
              <Text className={`text-sm font-semibold text-center ${
                formData.transferType === type.id
                  ? 'text-hbl-green'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {type.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Form Fields */}
        <Input
          label="From Account"
          placeholder="Select account"
          value={formData.fromAccount}
          onChangeText={(text) => setFormData({ ...formData, fromAccount: text })}
        />

        <Input
          label="To Account"
          placeholder="Recipient account"
          value={formData.toAccount}
          onChangeText={(text) => setFormData({ ...formData, toAccount: text })}
        />

        <Input
          label="Amount (PKR)"
          placeholder="Enter amount"
          value={formData.amount}
          onChangeText={(text) => setFormData({ ...formData, amount: text })}
          keyboardType="numeric"
        />

        {/* Fee Information */}
        <Card className="my-6">
          <View className="mb-3">
            <Text className="text-xs text-gray-600 dark:text-gray-400">Estimated Fee</Text>
            <Text className="text-lg font-bold text-gray-900 dark:text-white mt-1">
              Free
            </Text>
          </View>
          <View className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <Text className="text-xs text-gray-600 dark:text-gray-400">Total Amount</Text>
            <Text className="text-lg font-bold text-hbl-green mt-1">
              PKR {formData.amount || '0'}
            </Text>
          </View>
        </Card>

        <Button
          title="Proceed Transfer"
          onPress={handleTransfer}
          size="lg"
          className="mb-6"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
