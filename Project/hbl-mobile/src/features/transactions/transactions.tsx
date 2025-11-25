import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

import { Card } from '@/src/components/ui/card';

interface Transaction {
  id: string;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'payment';
  title: string;
  description: string;
  amount: number;
  date: string;
  icon: string;
  color: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function TransactionsScreen() {
  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'transfer',
      title: 'Transfer to John',
      description: 'To Account 0910-460815',
      amount: -5000,
      date: 'Today at 2:30 PM',
      icon: 'arrow-right',
      color: '#3B82F6',
      status: 'completed',
    },
    {
      id: '2',
      type: 'deposit',
      title: 'Salary Credit',
      description: 'From Employer Account',
      amount: 150000,
      date: 'Yesterday at 10:00 AM',
      icon: 'arrow-left',
      color: '#10B981',
      status: 'completed',
    },
    {
      id: '3',
      type: 'payment',
      title: 'Online Shopping',
      description: 'Payment to Store',
      amount: -3500,
      date: 'Dec 20, 2024',
      icon: 'shopping-outline',
      color: '#F59E0B',
      status: 'completed',
    },
    {
      id: '4',
      type: 'withdrawal',
      title: 'ATM Withdrawal',
      description: 'At ATM Branch Name',
      amount: -10000,
      date: 'Dec 19, 2024',
      icon: 'cash-multiple',
      color: '#EF4444',
      status: 'completed',
    },
  ];

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10';
      case 'pending':
        return 'bg-warning/10';
      case 'failed':
        return 'bg-error/10';
      default:
        return 'bg-gray-100 dark:bg-surface-alt-dark';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'pending':
        return 'text-warning';
      case 'failed':
        return 'text-error';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <SafeAreaView className="safe-area">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 p-4"
      >
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="mb-3">
            <View className="flex-row items-center gap-3">
              <View
                className="h-11 w-11 flex-center rounded-full"
                style={{ backgroundColor: transaction.color }}
              >
                <MaterialCommunityIcons
                  name={transaction.icon as any}
                  size={20}
                  color="#FFFFFF"
                />
              </View>

              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                  {transaction.title}
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {transaction.description}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {transaction.date}
                </Text>
              </View>

              <View className="items-end">
                <Text
                  className={`text-sm font-bold ${
                    transaction.amount > 0 ? 'text-success' : 'text-error'
                  }`}
                >
                  {transaction.amount > 0 ? '+' : ''}PKR {Math.abs(transaction.amount).toLocaleString()}
                </Text>
                <View
                  className={`mt-1.5 px-2 py-0.5 rounded ${getStatusBgColor(transaction.status)}`}
                >
                  <Text
                    className={`text-xs font-semibold capitalize ${getStatusTextColor(transaction.status)}`}
                  >
                    {transaction.status}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
