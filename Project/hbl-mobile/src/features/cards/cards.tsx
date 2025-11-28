import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/src/components/ui/card';

interface BankCard {
  id: string;
  lastFour: string;
  holderName: string;
  expiryDate: string;
  type: 'credit' | 'debit';
  status: 'active' | 'blocked' | 'expired';
  balance?: string;
}

export default function CardsScreen() {
  const cards: BankCard[] = [
    {
      id: '1',
      lastFour: '8090',
      holderName: 'Muhammad Junaid',
      expiryDate: '06/27',
      type: 'credit',
      status: 'active',
      balance: 'PKR 25,000',
    },
    {
      id: '2',
      lastFour: '9896',
      holderName: 'Muhammad Junaid',
      expiryDate: '06/27',
      type: 'debit',
      status: 'active',
      balance: 'PKR 50,000',
    },
    {
      id: '3',
      lastFour: '1234',
      holderName: 'Ahmed Ali',
      expiryDate: '06/27',
      type: 'credit',
      status: 'active',
      balance: 'PKR 100,000',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10';
      case 'blocked':
        return 'bg-error/10';
      case 'expired':
        return 'bg-warning/10';
      default:
        return 'bg-gray-100 dark:bg-surface-alt-dark';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-success';
      case 'blocked':
        return 'text-error';
      case 'expired':
        return 'text-warning';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
      >
        <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Manage and monitor all your cards
        </Text>

        {cards.map((card) => (
          <Card key={card.id} padding="md" className="mb-3">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                {/* Card Header */}
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center gap-2">
                    <MaterialCommunityIcons
                      name="credit-card"
                      size={20}
                      color={card.type === 'credit' ? '#DC143C' : '#3B82F6'}
                    />
                    <Text className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                      {card.type} Card
                    </Text>
                  </View>
                  <View className={`px-2 py-1 rounded ${getStatusColor(card.status)}`}>
                    <Text className={`text-xs font-semibold capitalize ${getStatusTextColor(card.status)}`}>
                      {card.status}
                    </Text>
                  </View>
                </View>

                {/* Card Number */}
                <View className="mb-3">
                  <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Card Number
                  </Text>
                  <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                    4532 •••• •••• {card.lastFour}
                  </Text>
                </View>

                {/* Card Holder & Expiry */}
                <View className="flex-row justify-between">
                  <View className="flex-1">
                    <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Cardholder
                    </Text>
                    <Text className="text-xs font-semibold text-gray-900 dark:text-white">
                      {card.holderName}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Expires
                    </Text>
                    <Text className="text-xs font-semibold text-gray-900 dark:text-white">
                      {card.expiryDate}
                    </Text>
                  </View>
                </View>

                {/* Balance */}
                {card.balance && (
                  <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Available Balance
                    </Text>
                    <Text className="text-sm font-bold text-hbl-green">
                      {card.balance}
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Menu */}
              <Pressable className="ml-3 active:opacity-70">
                <MaterialCommunityIcons name="dots-vertical" size={20} color="#9CA3AF" />
              </Pressable>
            </View>
          </Card>
        ))}

        {/* Card Services */}
        <View className="mt-6 mb-6">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Card Services
          </Text>

          <Card padding="md">
            {[
              { icon: 'lock', label: 'Block Card', color: 'text-red-500', bgColor: 'bg-red-500/10' },
              { icon: 'reload', label: 'Replace Card', color: 'text-warning', bgColor: 'bg-warning/10' },
              { icon: 'cog', label: 'Card Settings', color: 'text-info', bgColor: 'bg-info/10' },
            ].map((service, index) => (
              <Pressable
                key={service.label}
                className={`flex-row items-center py-3 active:opacity-70 ${
                  index < 2 ? 'border-b border-gray-200 dark:border-gray-700' : ''
                }`}
              >
                <View className={`h-9 w-9 flex-center mr-3 rounded-lg ${service.bgColor}`}>
                  <MaterialCommunityIcons
                    name={service.icon as any}
                    size={18}
                    color={service.color === 'text-red-500' ? '#EF4444' : service.color === 'text-warning' ? '#F59E0B' : '#3B82F6'}
                  />
                </View>
                <Text className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
                  {service.label}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
              </Pressable>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
