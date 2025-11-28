import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { accountService, transactionService } from '@/src/services';
import { ApiAccount, ApiTransaction } from '@/src/types/api';

// Format currency in PKR
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date/time
const formatDateTime = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get account type icon
const getAccountTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    savings: 'trending-up',
    current: 'cash',
    fixed_deposit: 'calendar',
    islamic_savings: 'shield-checkmark',
    salary: 'briefcase',
  };
  return icons[type] || 'wallet';
};

// Get status color
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'active':
      return { color: '#10B981', icon: 'checkmark-circle' as const, bg: 'bg-green-100' };
    case 'inactive':
      return { color: '#F59E0B', icon: 'pause-circle' as const, bg: 'bg-yellow-100' };
    case 'frozen':
      return { color: '#EF4444', icon: 'snow' as const, bg: 'bg-red-100' };
    case 'closed':
      return { color: '#6B7280', icon: 'close-circle' as const, bg: 'bg-gray-100' };
    default:
      return { color: '#6B7280', icon: 'help-circle' as const, bg: 'bg-gray-100' };
  }
};

// Get transaction style based on type
const getTransactionStyle = (transaction: ApiTransaction) => {
  const isCredit = transaction.type === 'deposit' || transaction.type === 'interest';

  return {
    icon: isCredit ? 'arrow-bottom-left' : 'arrow-top-right',
    color: isCredit ? '#10B981' : '#EF4444',
    bgColor: isCredit ? 'bg-green-100' : 'bg-red-100',
    prefix: isCredit ? '+' : '-',
  };
};

// Info Row Component
const InfoRow = ({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) => (
  <View className="flex-row justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
    <Text className="text-sm text-gray-500 dark:text-gray-400">{label}</Text>
    <Text
      className="text-sm font-medium text-gray-900 dark:text-white"
      style={valueColor ? { color: valueColor } : undefined}
    >
      {value}
    </Text>
  </View>
);

// Transaction Item Component
const TransactionItem = ({ transaction }: { transaction: ApiTransaction }) => {
  const style = getTransactionStyle(transaction);

  return (
    <View className="flex-row items-center py-3 border-b border-gray-100 dark:border-gray-800">
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${style.bgColor}`}
      >
        <MaterialCommunityIcons name={style.icon as any} size={20} color={style.color} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-gray-900 dark:text-white" numberOfLines={1}>
          {transaction.description || `${transaction.type} Transaction`}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {formatDateTime(transaction.createdAt)}
        </Text>
      </View>
      <Text className="text-sm font-semibold" style={{ color: style.color }}>
        {style.prefix}
        {formatCurrency(transaction.amount)}
      </Text>
    </View>
  );
};

export default function AccountDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [account, setAccount] = useState<ApiAccount | null>(null);
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);

  const fetchAccountData = useCallback(async () => {
    if (!id) {
      setError('Account ID not found');
      setLoading(false);
      return;
    }

    try {
      setError(null);

      // Fetch account details and transactions in parallel
      const [accountData, transactionsData] = await Promise.all([
        accountService.getAccount(id),
        transactionService.getTransactions({ accountId: id, limit: 10 }).catch(() => []),
      ]);

      setAccount(accountData);
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
    } catch (err) {
      console.error('Failed to fetch account data:', err);
      setError('Failed to load account details. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAccountData();
  }, [fetchAccountData]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#006747" />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading account details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !account) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="chevron-back" size={28} color="#006747" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">Account Details</Text>
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="text-gray-900 dark:text-white font-semibold mt-4 text-center">
            {error || 'Account not found'}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 bg-hbl-green px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Account type color can be used for styling if needed
  const typeIcon = getAccountTypeIcon(account.accountType);
  const statusStyle = getStatusStyle(account.status);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Ionicons name="chevron-back" size={28} color="#006747" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900 dark:text-white flex-1">
          Account Details
        </Text>
        <Pressable onPress={() => setShowBalance(!showBalance)}>
          <Ionicons
            name={showBalance ? 'eye-outline' : 'eye-off-outline'}
            size={24}
            color="#6B7280"
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#006747" />
        }
      >
        {/* Account Header Card */}
        <View className="bg-hbl-green px-4 py-6">
          <View className="flex-row items-center mb-4">
            <View
              className="w-14 h-14 rounded-xl items-center justify-center mr-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Ionicons name={typeIcon} size={28} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-white/80">
                {account.accountType.replace('_', ' ').toUpperCase()}
              </Text>
              <Text className="text-xl font-bold text-white" numberOfLines={1}>
                {account.accountTitle}
              </Text>
            </View>
          </View>

          {/* Balance */}
          <View className="bg-white/10 rounded-xl p-4 border border-white/20">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-white/80">Available Balance</Text>
              <View className={`px-2 py-1 rounded-full ${statusStyle.bg}`}>
                <Text className="text-xs font-medium capitalize" style={{ color: statusStyle.color }}>
                  {account.status}
                </Text>
              </View>
            </View>
            <Text className="text-3xl font-bold text-white mb-1">
              {showBalance ? formatCurrency(account.availableBalance) : '••••••••'}
            </Text>
            <Text className="text-xs text-white/70">
              Current: {showBalance ? formatCurrency(account.balance) : '••••••••'}
            </Text>
          </View>
        </View>

        {/* Account Information */}
        <View className="px-4 py-4">
          <View className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Account Information
            </Text>

            <InfoRow label="Account Number" value={account.accountNumber} />
            <InfoRow label="IBAN" value={account.iban || 'N/A'} />
            <InfoRow label="Currency" value={account.currency} valueColor="#006747" />
            <InfoRow
              label="Status"
              value={account.status.charAt(0).toUpperCase() + account.status.slice(1)}
              valueColor={statusStyle.color}
            />
          </View>
        </View>

        {/* Limits Section */}
        <View className="px-4 pb-4">
          <View className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Transaction Limits
            </Text>

            <InfoRow
              label="Daily Limit"
              value={formatCurrency(account.dailyTransactionLimit)}
            />
            <InfoRow
              label="Monthly Limit"
              value={formatCurrency(account.monthlyTransactionLimit)}
            />
            {account.minimumBalance !== undefined && (
              <InfoRow
                label="Minimum Balance"
                value={formatCurrency(account.minimumBalance)}
              />
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 pb-4">
          <View className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Quick Actions
            </Text>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/transfers',
                    params: { fromAccountId: account._id },
                  })
                }
                className="flex-1 bg-hbl-green rounded-lg py-3 items-center"
              >
                <Ionicons name="swap-horizontal" size={20} color="#FFFFFF" />
                <Text className="text-white text-sm font-medium mt-1">Transfer</Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/(customer)/transactions',
                    params: { accountId: account._id },
                  })
                }
                className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg py-3 items-center"
              >
                <Ionicons name="receipt-outline" size={20} color="#6B7280" />
                <Text className="text-gray-700 dark:text-gray-300 text-sm font-medium mt-1">
                  History
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View className="px-4 pb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              Recent Transactions
            </Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(customer)/transactions',
                  params: { accountId: account._id },
                })
              }
            >
              <Text className="text-sm font-medium text-hbl-green">View All</Text>
            </Pressable>
          </View>

          <View className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm">
            {transactions.length === 0 ? (
              <View className="py-6 items-center">
                <Ionicons name="receipt-outline" size={40} color="#9CA3AF" />
                <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center">
                  No recent transactions
                </Text>
              </View>
            ) : (
              transactions.slice(0, 5).map((transaction) => (
                <TransactionItem key={transaction._id} transaction={transaction} />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
