import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { transactionService } from '@/src/services';
import { ApiTransaction, TransactionType as ApiTransactionType, TransactionStatus as ApiTransactionStatus } from '@/src/types/api';

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
    year: 'numeric',
  });
};

const formatTime = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get transaction icon and color
const getTransactionStyle = (transaction: ApiTransaction) => {
  // Determine if credit based on type
  const isCredit = transaction.type === 'deposit' || transaction.type === 'interest';

  let icon: keyof typeof Ionicons.glyphMap = 'swap-horizontal';
  let bgColor = '#3B82F6';

  switch (transaction.type) {
    case 'deposit':
      icon = 'arrow-down';
      bgColor = '#10B981';
      break;
    case 'withdrawal':
      icon = 'arrow-up';
      bgColor = '#EF4444';
      break;
    case 'transfer':
      icon = 'swap-horizontal';
      bgColor = '#3B82F6';
      break;
    case 'payment':
      icon = 'receipt';
      bgColor = '#F59E0B';
      break;
    case 'fee':
      icon = 'cash';
      bgColor = '#6B7280';
      break;
    case 'interest':
      icon = 'trending-up';
      bgColor = '#8B5CF6';
      break;
    default:
      icon = 'swap-horizontal';
      bgColor = '#3B82F6';
  }

  return {
    icon,
    bgColor,
    textColor: isCredit ? '#10B981' : '#EF4444',
    prefix: isCredit ? '+' : '-',
  };
};

// Get status style
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'completed':
      return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'pending':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
    case 'failed':
      return { bg: 'bg-red-100', text: 'text-red-700' };
    case 'cancelled':
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
    case 'reversed':
      return { bg: 'bg-purple-100', text: 'text-purple-700' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
};

// Transaction Item Component
const TransactionItem = ({
  transaction,
  onPress,
}: {
  transaction: ApiTransaction;
  onPress: () => void;
}) => {
  const style = getTransactionStyle(transaction);
  const statusStyle = getStatusStyle(transaction.status);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-4 px-4 bg-white dark:bg-surface-dark active:bg-gray-50 dark:active:bg-gray-800"
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: `${style.bgColor}20` }}
      >
        <Ionicons name={style.icon} size={20} color={style.bgColor} />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text
            className="text-sm font-medium text-gray-900 dark:text-white flex-1 mr-2"
            numberOfLines={1}
          >
            {transaction.description || `${transaction.type} Transaction`}
          </Text>
          <Text className="text-sm font-semibold" style={{ color: style.textColor }}>
            {style.prefix}
            {formatCurrency(transaction.amount)}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-1">
          <View className="flex-row items-center">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(transaction.createdAt)} • {formatTime(transaction.createdAt)}
            </Text>
          </View>
          <View className={`px-2 py-0.5 rounded-full ${statusStyle.bg}`}>
            <Text className={`text-xs capitalize ${statusStyle.text}`}>
              {transaction.status}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

// Filter Types
type TransactionTypeFilter = '' | ApiTransactionType;
type TransactionStatusFilter = '' | ApiTransactionStatus;

export default function TransactionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ accountId?: string }>();

  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatusFilter>('');
  const [accountFilter] = useState(params.accountId || '');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTransactions = useCallback(
    async (reset = false) => {
      try {
        setError(null);
        const currentPage = reset ? 1 : page;

        const result = await transactionService.getTransactions({
          page: currentPage,
          limit: 20,
          type: typeFilter || undefined,
          status: statusFilter || undefined,
          accountId: accountFilter || undefined,
        });

        const newTransactions = result.transactions;

        if (reset) {
          setTransactions(newTransactions);
          setPage(1);
        } else {
          setTransactions((prev) => [...prev, ...newTransactions]);
        }

        setHasMore(newTransactions.length === 20);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, typeFilter, statusFilter, accountFilter]
  );

  useEffect(() => {
    fetchTransactions(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter, accountFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions(true);
  }, [fetchTransactions]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((p) => p + 1);
      fetchTransactions(false);
    }
  };

  // Filter transactions by search
  const filteredTransactions = transactions.filter((t) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      t.description?.toLowerCase().includes(searchLower) ||
      t.referenceNumber?.toLowerCase().includes(searchLower) ||
      t.type.toLowerCase().includes(searchLower)
    );
  });

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce(
    (groups, transaction) => {
      const date = formatDate(transaction.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    },
    {} as Record<string, ApiTransaction[]>
  );

  if (loading && transactions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#006747" />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading transactions...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <View className="bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row items-center px-4 py-3">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900 dark:text-white flex-1">
            Transactions
          </Text>
          <Pressable
            onPress={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg ${showFilters ? 'bg-hbl-green/10' : ''}`}
          >
            <Ionicons
              name="filter"
              size={22}
              color={showFilters ? '#006747' : '#6B7280'}
            />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View className="px-4 pb-3">
          <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search transactions..."
              className="flex-1 ml-2 text-gray-900 dark:text-white"
              placeholderTextColor="#9CA3AF"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Filters */}
        {showFilters && (
          <View className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3">
            {/* Type Filter */}
            <Text className="text-xs font-medium text-gray-500 mb-2">Transaction Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              <View className="flex-row gap-2">
                {[
                  { value: '', label: 'All' },
                  { value: 'transfer', label: 'Transfer' },
                  { value: 'payment', label: 'Payment' },
                  { value: 'deposit', label: 'Deposit' },
                  { value: 'withdrawal', label: 'Withdrawal' },
                ].map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => setTypeFilter(option.value as TransactionTypeFilter)}
                    className={`px-3 py-1.5 rounded-full ${
                      typeFilter === option.value
                        ? 'bg-hbl-green'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        typeFilter === option.value
                          ? 'text-white font-medium'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Status Filter */}
            <Text className="text-xs font-medium text-gray-500 mb-2">Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {[
                  { value: '', label: 'All' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'failed', label: 'Failed' },
                ].map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => setStatusFilter(option.value as TransactionStatusFilter)}
                    className={`px-3 py-1.5 rounded-full ${
                      statusFilter === option.value
                        ? 'bg-hbl-green'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        statusFilter === option.value
                          ? 'text-white font-medium'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View className="mx-4 mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      )}

      {/* Transactions List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#006747" />
        }
        onMomentumScrollEnd={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isEndReached =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isEndReached) {
            loadMore();
          }
        }}
      >
        {filteredTransactions.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-900 dark:text-white font-semibold mt-4">
              No Transactions Found
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mt-2 px-8">
              {search || typeFilter || statusFilter
                ? 'Try adjusting your filters'
                : 'Your transactions will appear here'}
            </Text>
          </View>
        ) : (
          Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
            <View key={date}>
              <View className="px-4 py-2 bg-gray-100 dark:bg-gray-800">
                <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {date}
                </Text>
              </View>
              {dateTransactions.map((transaction, index) => (
                <View key={transaction._id}>
                  <TransactionItem
                    transaction={transaction}
                    onPress={() =>
                      router.push({
                        pathname: '/(customer)/transaction-details' as never,
                        params: { id: transaction._id },
                      })
                    }
                  />
                  {index < dateTransactions.length - 1 && (
                    <View className="h-px bg-gray-100 dark:bg-gray-700 ml-16" />
                  )}
                </View>
              ))}
            </View>
          ))
        )}

        {loading && transactions.length > 0 && (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color="#006747" />
          </View>
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
