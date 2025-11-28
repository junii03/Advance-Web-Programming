import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

import { loanService } from '@/src/services';
import { ApiLoan } from '@/src/types/api';

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
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Get status style
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'pending':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'time' as const };
    case 'approved':
      return { bg: 'bg-green-100', text: 'text-green-700', icon: 'checkmark-circle' as const };
    case 'rejected':
      return { bg: 'bg-red-100', text: 'text-red-700', icon: 'close-circle' as const };
    case 'active':
      return { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'pulse' as const };
    case 'closed':
      return { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'lock-closed' as const };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'help-circle' as const };
  }
};

// Get loan type icon and color
const getLoanTypeStyle = (type: string) => {
  switch (type) {
    case 'personal':
      return { icon: 'person' as const, color: '#3B82F6' };
    case 'home':
      return { icon: 'home' as const, color: '#10B981' };
    case 'car':
      return { icon: 'car' as const, color: '#F59E0B' };
    case 'education':
      return { icon: 'school' as const, color: '#8B5CF6' };
    case 'business':
      return { icon: 'briefcase' as const, color: '#EF4444' };
    default:
      return { icon: 'document-text' as const, color: '#6B7280' };
  }
};

// Loan Card Component
const LoanCard = ({ loan, onPress }: { loan: ApiLoan; onPress: () => void }) => {
  const statusStyle = getStatusStyle(loan.status);
  const typeStyle = getLoanTypeStyle(loan.loanType);
  const progress = loan.amount > 0 ? ((loan.amount - loan.outstandingAmount) / loan.amount) * 100 : 0;

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
            style={{ backgroundColor: `${typeStyle.color}20` }}
          >
            <Ionicons name={typeStyle.icon} size={24} color={typeStyle.color} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900 dark:text-white capitalize">
              {loan.loanType} Loan
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Applied: {formatDate(loan.applicationDate)}
            </Text>
          </View>
        </View>
        <View className={`flex-row items-center px-2 py-1 rounded-full ${statusStyle.bg}`}>
          <Ionicons name={statusStyle.icon} size={12} color={statusStyle.text.replace('text-', '').replace('-700', '')} />
          <Text className={`text-xs font-medium capitalize ml-1 ${statusStyle.text}`}>
            {loan.status}
          </Text>
        </View>
      </View>

      {/* Loan Details */}
      <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
        <View className="flex-row justify-between mb-2">
          <View>
            <Text className="text-xs text-gray-500 dark:text-gray-400">Loan Amount</Text>
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(loan.amount)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-gray-500 dark:text-gray-400">Monthly EMI</Text>
            <Text className="text-lg font-bold text-hbl-green">
              {formatCurrency(loan.monthlyInstallment)}
            </Text>
          </View>
        </View>

        {/* Progress Bar (for active loans) */}
        {loan.status === 'active' && (
          <View className="mt-2">
            <View className="flex-row justify-between mb-1">
              <Text className="text-xs text-gray-500">Repaid</Text>
              <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {progress.toFixed(0)}%
              </Text>
            </View>
            <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <View
                className="h-full bg-hbl-green rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>
        )}
      </View>

      {/* Additional Details */}
      <View className="flex-row justify-between">
        <View className="flex-1">
          <Text className="text-xs text-gray-500 dark:text-gray-400">Tenure</Text>
          <Text className="text-sm font-medium text-gray-900 dark:text-white">
            {loan.tenure} months
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-gray-500 dark:text-gray-400">Interest Rate</Text>
          <Text className="text-sm font-medium text-gray-900 dark:text-white">
            {loan.interestRate}% p.a.
          </Text>
        </View>
        <View className="flex-1 items-end">
          <Text className="text-xs text-gray-500 dark:text-gray-400">Outstanding</Text>
          <Text className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(loan.outstandingAmount)}
          </Text>
        </View>
      </View>

      {/* Purpose */}
      {loan.purpose && (
        <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <Text className="text-xs text-gray-500 dark:text-gray-400">Purpose</Text>
          <Text className="text-sm text-gray-900 dark:text-white mt-0.5" numberOfLines={2}>
            {loan.purpose}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

// Summary Component
const LoansSummary = ({ loans }: { loans: ApiLoan[] }) => {
  const activeLoans = loans.filter((l) => l.status === 'active');
  const pendingLoans = loans.filter((l) => l.status === 'pending');
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.outstandingAmount, 0);
  const totalMonthlyEMI = activeLoans.reduce((sum, l) => sum + l.monthlyInstallment, 0);

  return (
    <View className="mx-4 mb-4">
      <View className="bg-hbl-green rounded-2xl p-4">
        <Text className="text-sm text-white/80 mb-1">Total Outstanding</Text>
        <Text className="text-3xl font-bold text-white mb-3">
          {formatCurrency(totalOutstanding)}
        </Text>
        <View className="flex-row justify-between">
          <View>
            <Text className="text-xs text-white/70">Monthly EMI</Text>
            <Text className="text-sm font-medium text-white">{formatCurrency(totalMonthlyEMI)}</Text>
          </View>
          <View>
            <Text className="text-xs text-white/70">Active Loans</Text>
            <Text className="text-sm font-medium text-white">{activeLoans.length}</Text>
          </View>
          <View>
            <Text className="text-xs text-white/70">Pending</Text>
            <Text className="text-sm font-medium text-white">{pendingLoans.length}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function LoansScreen() {
  const router = useRouter();
  const [loans, setLoans] = useState<ApiLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'closed'>('all');

  const fetchLoans = useCallback(async () => {
    try {
      setError(null);
      const data = await loanService.getLoans();
      setLoans(data);
    } catch (err) {
      console.error('Failed to fetch loans:', err);
      setError('Failed to load loans');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLoans();
  }, [fetchLoans]);

  const filteredLoans = loans.filter((loan) => {
    if (filter === 'all') return true;
    if (filter === 'active') return loan.status === 'active' || loan.status === 'approved';
    if (filter === 'pending') return loan.status === 'pending';
    if (filter === 'closed') return loan.status === 'closed' || loan.status === 'rejected';
    return true;
  });

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#006747" />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading loans...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">My Loans</Text>
        </View>
        <Pressable
          onPress={() => router.push('/(customer)/apply-loan' as never)}
          className="flex-row items-center bg-hbl-green px-3 py-2 rounded-lg"
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text className="text-sm font-medium text-white ml-1">Apply</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#006747" />
        }
      >
        {/* Summary */}
        <View className="pt-4">
          <LoansSummary loans={loans} />
        </View>

        {/* Filter Tabs */}
        <View className="flex-row px-4 mb-4 gap-2">
          {(['all', 'active', 'pending', 'closed'] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              className={`px-4 py-2 rounded-full ${
                filter === f
                  ? 'bg-hbl-green'
                  : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Text
                className={`text-sm font-medium capitalize ${
                  filter === f ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Error Message */}
        {error && (
          <View className="mx-4 mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}

        {/* Loans List */}
        <View className="px-4">
          {filteredLoans.length === 0 ? (
            <View className="bg-white dark:bg-surface-dark rounded-xl p-8 items-center">
              <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-900 dark:text-white font-semibold mt-4">
                No Loans Found
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mt-2">
                {filter === 'all'
                  ? 'You haven\'t applied for any loans yet.'
                  : `No ${filter} loans found.`}
              </Text>
              {filter === 'all' && (
                <Pressable
                  onPress={() => router.push('/(customer)/apply-loan' as never)}
                  className="mt-4 bg-hbl-green px-6 py-3 rounded-lg"
                >
                  <Text className="text-white font-semibold">Apply for Loan</Text>
                </Pressable>
              )}
            </View>
          ) : (
            filteredLoans.map((loan) => (
              <LoanCard
                key={loan._id}
                loan={loan}
                onPress={() =>
                  router.push({
                    pathname: '/(customer)/loan-details' as never,
                    params: { id: loan._id },
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
