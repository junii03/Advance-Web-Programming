import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
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
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

// Get status style
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'pending':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', color: '#F59E0B', icon: 'time' as const };
    case 'approved':
      return { bg: 'bg-green-100', text: 'text-green-700', color: '#10B981', icon: 'checkmark-circle' as const };
    case 'rejected':
      return { bg: 'bg-red-100', text: 'text-red-700', color: '#EF4444', icon: 'close-circle' as const };
    case 'active':
      return { bg: 'bg-blue-100', text: 'text-blue-700', color: '#3B82F6', icon: 'pulse' as const };
    case 'closed':
      return { bg: 'bg-gray-100', text: 'text-gray-700', color: '#6B7280', icon: 'lock-closed' as const };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', color: '#6B7280', icon: 'help-circle' as const };
  }
};

// Get loan type style
const getLoanTypeStyle = (type: string) => {
  switch (type) {
    case 'personal':
      return { icon: 'person' as const, color: '#3B82F6', label: 'Personal Loan' };
    case 'home':
      return { icon: 'home' as const, color: '#10B981', label: 'Home Loan' };
    case 'car':
      return { icon: 'car' as const, color: '#F59E0B', label: 'Car Loan' };
    case 'education':
      return { icon: 'school' as const, color: '#8B5CF6', label: 'Education Loan' };
    case 'business':
      return { icon: 'briefcase' as const, color: '#EF4444', label: 'Business Loan' };
    default:
      return { icon: 'document-text' as const, color: '#6B7280', label: 'Loan' };
  }
};

// Info Row Component
const InfoRow = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
  <View className="flex-row justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
    <Text className="text-sm text-gray-500 dark:text-gray-400">{label}</Text>
    <Text
      className="text-sm font-medium text-gray-900 dark:text-white"
      style={valueColor ? { color: valueColor } : undefined}
    >
      {value}
    </Text>
  </View>
);

export default function LoanDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loan, setLoan] = useState<ApiLoan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoan = useCallback(async () => {
    try {
      setError(null);
      if (id) {
        const data = await loanService.getLoan(id);
        setLoan(data);
      } else {
        setError('Loan ID not provided');
      }
    } catch (err) {
      console.error('Failed to fetch loan:', err);
      setError('Failed to load loan details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLoan();
  }, [fetchLoan]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#006747" />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading loan details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !loan) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
        <View className="flex-row items-center px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="chevron-back" size={28} color="#006747" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">Loan Details</Text>
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="text-gray-900 dark:text-white font-semibold mt-4 text-center">
            {error || 'Loan not found'}
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

  const statusStyle = getStatusStyle(loan.status);
  const typeStyle = getLoanTypeStyle(loan.loanType);

  // Calculate outstanding - use outstandingAmount if available, otherwise use amount
  const outstanding = loan.outstandingAmount > 0 ? loan.outstandingAmount : loan.amount;
  const paidAmount = loan.amount - outstanding;
  const progress = loan.amount > 0 ? (paidAmount / loan.amount) * 100 : 0;
  const totalPayable = loan.monthlyInstallment * loan.tenure;
  const totalInterest = totalPayable - loan.amount;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
        <Pressable onPress={() => router.back()} className="mr-3">
           <Ionicons name="chevron-back" size={28} color="#006747" />
        </Pressable>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Loan Details</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Loan Type Header */}
        <View className="bg-white dark:bg-surface-dark px-4 py-6 mb-4">
          <View className="flex-row items-center mb-4">
            <View
              className="w-14 h-14 rounded-xl items-center justify-center mr-4"
              style={{ backgroundColor: `${typeStyle.color}20` }}
            >
              <Ionicons name={typeStyle.icon} size={28} color={typeStyle.color} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                {typeStyle.label}
              </Text>
              <View className={`flex-row items-center px-2 py-1 rounded-full ${statusStyle.bg} self-start mt-1`}>
                <Ionicons name={statusStyle.icon} size={14} color={statusStyle.color} />
                <Text className={`text-xs font-medium capitalize ml-1 ${statusStyle.text}`}>
                  {loan.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Loan Amount */}
          <View className="bg-hbl-green rounded-xl p-4">
            <Text className="text-sm text-white/80">Loan Amount</Text>
            <Text className="text-3xl font-bold text-white mt-1">
              {formatCurrency(loan.amount)}
            </Text>
            <View className="flex-row mt-3">
              <View className="flex-1">
                <Text className="text-xs text-white/70">Monthly EMI</Text>
                <Text className="text-base font-semibold text-white">
                  {formatCurrency(loan.monthlyInstallment || 0)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-white/70">Interest Rate</Text>
                <Text className="text-base font-semibold text-white">
                  {loan.interestRate}% p.a.
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-white/70">Tenure</Text>
                <Text className="text-base font-semibold text-white">
                  {loan.tenure} months
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Repayment Progress (for active/approved loans) */}
        {(loan.status === 'active' || loan.status === 'approved') && (
          <View className="bg-white dark:bg-surface-dark px-4 py-4 mb-4">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Repayment Progress
            </Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Paid: {formatCurrency(paidAmount)}
              </Text>
              <Text className="text-sm font-medium text-hbl-green">
                {progress.toFixed(1)}%
              </Text>
            </View>
            <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <View
                className="h-full bg-hbl-green rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Outstanding: {formatCurrency(outstanding)}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Total: {formatCurrency(loan.amount)}
              </Text>
            </View>
          </View>
        )}

        {/* Loan Details */}
        <View className="bg-white dark:bg-surface-dark px-4 py-4 mb-4">
          <Text className="text-base font-semibold text-gray-900 dark:text-white mb-2">
            Loan Information
          </Text>

          <InfoRow label="Application Date" value={formatDate(loan.applicationDate)} />

          {loan.approvedDate && (
            <InfoRow label="Approved Date" value={formatDate(loan.approvedDate)} valueColor="#10B981" />
          )}

          {loan.disbursedDate && (
            <InfoRow label="Disbursed Date" value={formatDate(loan.disbursedDate)} />
          )}

          <InfoRow label="Total Payable" value={formatCurrency(totalPayable)} />
          <InfoRow label="Total Interest" value={formatCurrency(totalInterest)} valueColor="#F59E0B" />
          <InfoRow label="Outstanding Amount" value={formatCurrency(outstanding)} valueColor="#EF4444" />

          {loan.nextPaymentDate && (
            <InfoRow label="Next Payment Date" value={formatDate(loan.nextPaymentDate)} valueColor="#3B82F6" />
          )}
        </View>

        {/* Purpose */}
        {loan.purpose && (
          <View className="bg-white dark:bg-surface-dark px-4 py-4 mb-4">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Purpose
            </Text>
            <Text className="text-sm text-gray-700 dark:text-gray-300">
              {loan.purpose}
            </Text>
          </View>
        )}

        {/* Collateral */}
        {loan.collateral && (
          <View className="bg-white dark:bg-surface-dark px-4 py-4 mb-4">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Collateral
            </Text>
            <Text className="text-sm text-gray-700 dark:text-gray-300">
              {loan.collateral}
            </Text>
          </View>
        )}

        {/* EMI Schedule Info */}
        <View className="bg-white dark:bg-surface-dark px-4 py-4 mb-4">
          <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
            EMI Schedule
          </Text>
          <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <View className="flex-row justify-between items-center mb-3">
              <View>
                <Text className="text-xs text-gray-500 dark:text-gray-400">Monthly EMI</Text>
                <Text className="text-xl font-bold text-hbl-green">
                  {formatCurrency(loan.monthlyInstallment || 0)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-gray-500 dark:text-gray-400">Total Installments</Text>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  {loan.tenure}
                </Text>
              </View>
            </View>
            <View className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <Text className="text-xs text-gray-500 dark:text-gray-400 text-center">
                EMI is due on the same date every month
              </Text>
            </View>
          </View>
        </View>

        {/* Status-specific messages */}
        {loan.status === 'pending' && (
          <View className="mx-4 mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <View className="flex-row items-center">
              <Ionicons name="time" size={20} color="#F59E0B" />
              <Text className="ml-2 text-sm font-medium text-yellow-700 dark:text-yellow-400">
                Application Under Review
              </Text>
            </View>
            <Text className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
              Your loan application is being reviewed. We&apos;ll notify you once a decision is made.
            </Text>
          </View>
        )}

        {loan.status === 'rejected' && (
          <View className="mx-4 mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <View className="flex-row items-center">
              <Ionicons name="close-circle" size={20} color="#EF4444" />
              <Text className="ml-2 text-sm font-medium text-red-700 dark:text-red-400">
                Application Rejected
              </Text>
            </View>
            <Text className="text-xs text-red-600 dark:text-red-500 mt-2">
              Unfortunately, your loan application was not approved. Please contact customer support for more information.
            </Text>
          </View>
        )}

        {loan.status === 'closed' && (
          <View className="mx-4 mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text className="ml-2 text-sm font-medium text-green-700 dark:text-green-400">
                Loan Fully Repaid
              </Text>
            </View>
            <Text className="text-xs text-green-600 dark:text-green-500 mt-2">
              Congratulations! This loan has been fully repaid. Thank you for banking with us.
            </Text>
          </View>
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
