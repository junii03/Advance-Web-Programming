import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { Card } from '@/src/components/ui/card';
import { useAuth } from '@/src/contexts/auth';
import { dashboardService, DashboardData } from '@/src/services';
import { ApiTransaction } from '@/src/types/api';
import { getProfileImageUrl } from '@/src/utils/helper';

// Format currency in PKR
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get transaction icon and color based on type
const getTransactionStyle = (transaction: ApiTransaction) => {
  // Credit types: deposit, interest
  // Debit types: withdrawal, transfer, payment
  const isCredit = transaction.type === 'deposit' || transaction.type === 'interest';

  return {
    icon: isCredit ? 'arrow-bottom-left' : 'arrow-top-right',
    iconFamily: 'MaterialCommunityIcons',
    color: isCredit ? '#10B981' : '#EF4444',
    bgColor: isCredit ? 'bg-green-100' : 'bg-red-100',
    prefix: isCredit ? '+' : '-',
  };
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const data = await dashboardService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard. Pull to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const quickActions = [
    {
      id: 1,
      label: 'Transfer',
      icon: 'swap-horizontal',
      color: '#3B82F6',
      route: '/(tabs)/transfers',
    },
    {
      id: 2,
      label: 'Accounts',
      icon: 'wallet',
      color: '#8B5CF6',
      route: '/(tabs)/accounts',
    },
    {
      id: 3,
      label: 'Cards',
      icon: 'card',
      color: '#006747',
      route: '/(tabs)/cards',
    },
    {
      id: 4,
      label: 'Loans',
      icon: 'document-text',
      color: '#F59E0B',
      route: '/(customer)/loans',
    },
  ];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#006747" />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  const totalBalance = dashboardData?.summary?.totalBalance ?? 0;
  const totalAvailable = dashboardData?.summary?.totalAvailableBalance ?? 0;
  const accountCount = dashboardData?.summary?.accountCount ?? 0;
  const activeCards = dashboardData?.summary?.activeCards ?? 0;
  const recentTransactions = dashboardData?.recentTransactions ?? [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#006747" />
        }
      >
        {/* Header Section */}
        <View className="bg-hbl-green px-4 pt-4 pb-8">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              {dashboardData?.user?.profilePicture ? (
                <Image
                  source={{ uri: getProfileImageUrl(dashboardData.user.profilePicture) || '' }}
                  className="w-12 h-12 rounded-full mr-3"
                />
              ) : (
                <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mr-3">
                  <Ionicons name="person" size={24} color="#FFFFFF" />
                </View>
              )}
              <View>
                <Text className="text-xs text-white/80">Welcome Back</Text>
                <Text className="text-lg font-bold text-white">
                  {user?.firstName || dashboardData?.user?.firstName || 'User'}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => router.push('/(customer)/notifications' as never)}
                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
              >
                <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
              </Pressable>
              <Pressable
                onPress={() => router.push('/(account)/profile' as never)}
                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
              >
                <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          {/* Total Balance Card */}
          <View className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-white/80">Total Balance</Text>
              <Pressable onPress={() => setShowBalance(!showBalance)}>
                <Ionicons
                  name={showBalance ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="rgba(255,255,255,0.8)"
                />
              </Pressable>
            </View>
            <Text className="text-3xl font-bold text-white mb-1">
              {showBalance ? formatCurrency(totalBalance) : '••••••••'}
            </Text>
            <Text className="text-xs text-white/70">
              Available: {showBalance ? formatCurrency(totalAvailable) : '••••••••'}
            </Text>
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View className="mx-4 mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}

        {/* Quick Actions */}
        <View className="px-4 -mt-4">
          <View className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm">
            <View className="flex-row justify-between">
              {quickActions.map((action) => (
                <Pressable
                  key={action.id}
                  onPress={() => router.push(action.route as never)}
                  className="items-center flex-1"
                >
                  <View
                    className="w-14 h-14 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: `${action.color}15` }}
                  >
                    <Ionicons name={action.icon as never} size={24} color={action.color} />
                  </View>
                  <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {action.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Account Summary */}
        <View className="px-4 mt-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              Account Summary
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/accounts' as never)}>
              <Text className="text-sm font-medium text-hbl-green">View All</Text>
            </Pressable>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm">
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mb-2">
                <Ionicons name="wallet" size={20} color="#3B82F6" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                {accountCount}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">Accounts</Text>
            </View>
            <View className="flex-1 bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm">
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mb-2">
                <Ionicons name="card" size={20} color="#10B981" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeCards}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">Active Cards</Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View className="px-4 mt-6 mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              Recent Transactions
            </Text>
            <Pressable onPress={() => router.push('/(customer)/transactions' as never)}>
              <Text className="text-sm font-medium text-hbl-green">View All</Text>
            </Pressable>
          </View>

          <View className="bg-white dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden">
            {recentTransactions.length === 0 ? (
              <View className="p-6 items-center">
                <Ionicons name="receipt-outline" size={40} color="#9CA3AF" />
                <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center">
                  No recent transactions
                </Text>
              </View>
            ) : (
              recentTransactions.slice(0, 5).map((transaction, index) => {
                const style = getTransactionStyle(transaction);
                return (
                  <View
                    key={transaction._id}
                    className={`flex-row items-center p-4 ${
                      index < Math.min(recentTransactions.length, 5) - 1
                        ? 'border-b border-gray-100 dark:border-gray-700'
                        : ''
                    }`}
                  >
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${style.bgColor}`}
                    >
                      {style.iconFamily === 'MaterialCommunityIcons' ? (
                        <MaterialCommunityIcons name={style.icon as never} size={20} color={style.color} />
                      ) : (
                        <Ionicons name={style.icon as never} size={20} color={style.color} />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-sm font-medium text-gray-900 dark:text-white"
                        numberOfLines={1}
                      >
                        {transaction.description ||
                          `${transaction.type} Transaction`}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatDate(transaction.createdAt)}
                      </Text>
                    </View>
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: style.color }}
                    >
                      {style.prefix}
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
