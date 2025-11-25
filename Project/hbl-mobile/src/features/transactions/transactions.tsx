import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

import { Card } from '@/src/components/ui/card';
import { Header } from '@/src/components/ui/header';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/use-color-scheme';

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
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'transfer',
      title: 'Transfer to John',
      description: 'To Account 0910-460815',
      amount: -5000,
      date: 'Today at 2:30 PM',
      icon: 'arrow-right',
      color: colors.info,
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
      color: colors.success,
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
      color: colors.warning,
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
      color: colors.error,
      status: 'completed',
    },
  ];

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'completed':
        return `${colors.success}20`;
      case 'pending':
        return `${colors.warning}20`;
      case 'failed':
        return `${colors.error}20`;
      default:
        return colors.surfaceAlt;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Transactions"
        subtitle="View all your transactions"
        onBackPress={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 16 }}>
        {transactions.map((transaction) => (
          <Card key={transaction.id} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: transaction.color,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <MaterialCommunityIcons name={transaction.icon as any} size={20} color="#FFFFFF" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                  {transaction.title}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                  {transaction.description}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textTertiary, marginTop: 4 }}>
                  {transaction.date}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: transaction.amount > 0 ? colors.success : colors.error,
                  }}
                >
                  {transaction.amount > 0 ? '+' : ''}PKR {Math.abs(transaction.amount).toLocaleString()}
                </Text>
                <View
                  style={{
                    marginTop: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 4,
                    backgroundColor: getStatusBgColor(transaction.status),
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '600',
                      color:
                        transaction.status === 'completed'
                          ? colors.success
                          : transaction.status === 'pending'
                            ? colors.warning
                            : colors.error,
                      textTransform: 'capitalize',
                    }}
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
