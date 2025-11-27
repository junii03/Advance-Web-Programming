import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { accountService } from '@/src/services';
import { ApiAccount } from '@/src/types/api';

// Format currency in PKR
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Get account type color
const getAccountTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    savings: '#3B82F6',
    current: '#10B981',
    fixed_deposit: '#8B5CF6',
    islamic_savings: '#14B8A6',
    salary: '#F59E0B',
  };
  return colors[type] || '#6B7280';
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
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'inactive':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
    case 'frozen':
      return { bg: 'bg-red-100', text: 'text-red-700' };
    case 'closed':
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
};

// Account Card Component
const AccountCard = ({
  account,
  showBalance,
  onPress,
}: {
  account: ApiAccount;
  showBalance: boolean;
  onPress: () => void;
}) => {
  const typeColor = getAccountTypeColor(account.accountType);
  const typeIcon = getAccountTypeIcon(account.accountType);
  const statusStyle = getStatusColor(account.status);

  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-surface-dark rounded-xl p-4 mb-3 shadow-sm active:opacity-90"
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View
            className="w-12 h-12 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: `${typeColor}20` }}
          >
            <Ionicons name={typeIcon} size={24} color={typeColor} />
          </View>
          <View className="flex-1">
            <Text
              className="text-base font-semibold text-gray-900 dark:text-white"
              numberOfLines={1}
            >
              {account.accountTitle}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {account.accountNumber} • {account.accountType.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
        <View className={`px-2 py-1 rounded-full ${statusStyle.bg}`}>
          <Text className={`text-xs font-medium capitalize ${statusStyle.text}`}>
            {account.status}
          </Text>
        </View>
      </View>

      {/* Balance Section */}
      <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xs text-gray-500 dark:text-gray-400">Available Balance</Text>
            <Text className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {showBalance ? formatCurrency(account.availableBalance) : '••••••••'}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-gray-500 dark:text-gray-400">Currency</Text>
            <Text className="text-base font-semibold text-green-600 mt-0.5">
              {account.currency}
            </Text>
          </View>
        </View>
      </View>

      {/* Account Details */}
      <View className="flex-row justify-between">
        <View>
          <Text className="text-xs text-gray-500 dark:text-gray-400">Daily Limit</Text>
          <Text className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(account.dailyTransactionLimit)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-gray-500 dark:text-gray-400">Monthly Limit</Text>
          <Text className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(account.monthlyTransactionLimit)}
          </Text>
        </View>
      </View>

      {/* View Details Arrow */}
      <View className="flex-row items-center justify-end mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <Text className="text-sm text-hbl-green font-medium mr-1">View Details</Text>
        <Ionicons name="chevron-forward" size={16} color="#006747" />
      </View>
    </Pressable>
  );
};

// Summary Card Component
const SummaryCard = ({
  accounts,
  showBalance,
}: {
  accounts: ApiAccount[];
  showBalance: boolean;
}) => {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalAvailable = accounts.reduce((sum, acc) => sum + acc.availableBalance, 0);
  const activeAccounts = accounts.filter((acc) => acc.status === 'active').length;

  return (
    <View className="bg-hbl-green rounded-2xl p-4 mx-4 mb-4">
      <Text className="text-sm text-white/80 mb-1">Total Balance</Text>
      <Text className="text-3xl font-bold text-white mb-2">
        {showBalance ? formatCurrency(totalBalance) : '••••••••'}
      </Text>
      <View className="flex-row justify-between">
        <View>
          <Text className="text-xs text-white/70">Available</Text>
          <Text className="text-sm font-medium text-white">
            {showBalance ? formatCurrency(totalAvailable) : '••••••••'}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-white/70">Active Accounts</Text>
          <Text className="text-sm font-medium text-white">{activeAccounts}</Text>
        </View>
      </View>
    </View>
  );
};

export default function AccountsScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<ApiAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);

  const fetchAccounts = useCallback(async () => {
    try {
      setError(null);
      const data = await accountService.getAccounts();
      setAccounts(data);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
      setError('Failed to load accounts. Pull to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAccounts();
  }, [fetchAccounts]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#006747" />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading accounts...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">My Accounts</Text>
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => setShowBalance(!showBalance)}>
            <Ionicons
              name={showBalance ? 'eye-outline' : 'eye-off-outline'}
              size={24}
              color="#6B7280"
            />
          </Pressable>
          <Pressable
            onPress={() => router.push('/(customer)/add-account' as never)}
            className="flex-row items-center bg-hbl-green px-3 py-2 rounded-lg"
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text className="text-sm font-medium text-white ml-1">Add</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#006747" />
        }
      >
        {/* Summary */}
        <View className="pt-4">
          <SummaryCard accounts={accounts} showBalance={showBalance} />
        </View>

        {/* Error Message */}
        {error && (
          <View className="mx-4 mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}

        {/* Accounts List */}
        <View className="px-4">
          <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
            {accounts.length} Account{accounts.length !== 1 ? 's' : ''}
          </Text>

          {accounts.length === 0 ? (
            <View className="bg-white dark:bg-surface-dark rounded-xl p-8 items-center">
              <Ionicons name="wallet-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-900 dark:text-white font-semibold mt-4">
                No Accounts Found
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mt-2">
                You don&apos;t have any accounts yet. Add your first account to get started.
              </Text>
              <Pressable
                onPress={() => router.push('/(customer)/add-account' as never)}
                className="mt-4 bg-hbl-green px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold">Add Account</Text>
              </Pressable>
            </View>
          ) : (
            accounts.map((account) => (
              <AccountCard
                key={account._id}
                account={account}
                showBalance={showBalance}
                onPress={() =>
                  router.push({
                    pathname: '/(customer)/account-details' as never,
                    params: { id: account._id },
                  })
                }
              />
            ))
          )}
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
