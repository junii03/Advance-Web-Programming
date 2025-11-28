import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { transactionService } from '@/src/services';
import { ApiTransaction } from '@/src/types/api';

// Format currency in PKR
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date
const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format time
const formatTime = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// Get transaction type style
const getTransactionStyle = (transaction: ApiTransaction) => {
  const isCredit = transaction.type === 'deposit' || transaction.type === 'interest';

  let icon: keyof typeof Ionicons.glyphMap = 'swap-horizontal';
  let bgColor = '#3B82F6';
  let label = 'Transaction';

  switch (transaction.type) {
    case 'deposit':
      icon = 'arrow-down-circle';
      bgColor = '#10B981';
      label = 'Deposit';
      break;
    case 'withdrawal':
      icon = 'arrow-up-circle';
      bgColor = '#EF4444';
      label = 'Withdrawal';
      break;
    case 'transfer':
      icon = 'swap-horizontal';
      bgColor = '#3B82F6';
      label = 'Transfer';
      break;
    case 'payment':
      icon = 'receipt';
      bgColor = '#F59E0B';
      label = 'Payment';
      break;
    case 'fee':
      icon = 'cash';
      bgColor = '#6B7280';
      label = 'Fee';
      break;
    case 'interest':
      icon = 'trending-up';
      bgColor = '#8B5CF6';
      label = 'Interest';
      break;
    default:
      icon = 'swap-horizontal';
      bgColor = '#3B82F6';
      label = transaction.type;
  }

  return {
    icon,
    bgColor,
    textColor: isCredit ? '#10B981' : '#EF4444',
    prefix: isCredit ? '+' : '-',
    label,
  };
};

// Get status style
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'completed':
      return { color: '#10B981', bg: 'bg-green-100 dark:bg-green-900/30', icon: 'checkmark-circle' as const };
    case 'pending':
      return { color: '#F59E0B', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'time' as const };
    case 'failed':
      return { color: '#EF4444', bg: 'bg-red-100 dark:bg-red-900/30', icon: 'close-circle' as const };
    case 'cancelled':
      return { color: '#6B7280', bg: 'bg-gray-100 dark:bg-gray-900/30', icon: 'ban' as const };
    case 'reversed':
      return { color: '#8B5CF6', bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'arrow-undo' as const };
    default:
      return { color: '#6B7280', bg: 'bg-gray-100 dark:bg-gray-900/30', icon: 'help-circle' as const };
  }
};

// Detail Row Component
const DetailRow = ({
  label,
  value,
  valueColor,
  copyable,
}: {
  label: string;
  value: string;
  valueColor?: string;
  copyable?: boolean;
}) => (
  <View className="flex-row justify-between items-start py-3 border-b border-gray-100 dark:border-gray-800">
    <Text className="text-sm text-gray-500 dark:text-gray-400 flex-1">{label}</Text>
    <View className="flex-row items-center ml-4">
      <Text
        className="text-sm font-medium text-gray-900 dark:text-white text-right"
        style={valueColor ? { color: valueColor } : undefined}
        selectable={copyable}
      >
        {value}
      </Text>
      {copyable && (
        <Ionicons name="copy-outline" size={14} color="#9CA3AF" style={{ marginLeft: 4 }} />
      )}
    </View>
  </View>
);

export default function TransactionDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [transaction, setTransaction] = useState<ApiTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransaction = useCallback(async () => {
    if (!id) {
      setError('Transaction ID not found');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await transactionService.getTransaction(id);
      setTransaction(data);
    } catch (err) {
      console.error('Failed to fetch transaction:', err);
      setError('Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  const handleShare = async () => {
    if (!transaction) return;

    const style = getTransactionStyle(transaction);
    const message = `
Transaction Receipt
-------------------
Type: ${style.label}
Amount: ${style.prefix}${formatCurrency(transaction.amount)}
Status: ${transaction.status}
Date: ${formatDate(transaction.createdAt)}
Reference: ${transaction.referenceNumber || transaction._id}
${transaction.description ? `Description: ${transaction.description}` : ''}
-------------------
HBL Mobile Banking
    `.trim();

    try {
      await Share.share({ message });
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#006747" />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading transaction...</Text>
      </SafeAreaView>
    );
  }

  if (error || !transaction) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="chevron-back" size={28} color="#006747" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Transaction Details
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="text-gray-900 dark:text-white font-semibold mt-4 text-center">
            {error || 'Transaction not found'}
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

  const style = getTransactionStyle(transaction);
  const statusStyle = getStatusStyle(transaction.status);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Ionicons name="chevron-back" size={28} color="#006747" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900 dark:text-white flex-1">
          Transaction Details
        </Text>
        <Pressable onPress={handleShare} className="p-2">
          <Ionicons name="share-outline" size={24} color="#006747" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Amount Header */}
        <View className="bg-white dark:bg-surface-dark p-6 items-center">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: `${style.bgColor}20` }}
          >
            <Ionicons name={style.icon} size={32} color={style.bgColor} />
          </View>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {style.label}
          </Text>
          <Text
            className="text-3xl font-bold"
            style={{ color: style.textColor }}
          >
            {style.prefix}
            {formatCurrency(transaction.amount)}
          </Text>
          <View
            className={`flex-row items-center mt-3 px-3 py-1.5 rounded-full ${statusStyle.bg}`}
          >
            <Ionicons name={statusStyle.icon} size={16} color={statusStyle.color} />
            <Text
              className="text-sm font-medium capitalize ml-1"
              style={{ color: statusStyle.color }}
            >
              {transaction.status}
            </Text>
          </View>
        </View>

        {/* Transaction Details */}
        <View className="px-4 py-4">
          <View className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Transaction Information
            </Text>

            {transaction.referenceNumber && (
              <DetailRow
                label="Reference Number"
                value={transaction.referenceNumber}
                copyable
              />
            )}

            <DetailRow label="Transaction ID" value={transaction._id} copyable />

            <DetailRow label="Type" value={style.label} />

            <DetailRow label="Date" value={formatDate(transaction.createdAt)} />

            <DetailRow label="Time" value={formatTime(transaction.createdAt)} />

            <DetailRow label="Currency" value={transaction.currency || 'PKR'} />

            {transaction.description && (
              <DetailRow label="Description" value={transaction.description} />
            )}

            {transaction.channel && (
              <DetailRow
                label="Channel"
                value={transaction.channel.charAt(0).toUpperCase() + transaction.channel.slice(1)}
              />
            )}
          </View>
        </View>

        {/* Account Details */}
        <View className="px-4 pb-4">
          <View className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Account Details
            </Text>

            {transaction.fromAccount && (
              <DetailRow
                label="From Account"
                value={
                  typeof transaction.fromAccount === 'string'
                    ? transaction.fromAccount
                    : (transaction.fromAccount as any)?.accountNumber || 'N/A'
                }
              />
            )}

            {transaction.toAccount && (
              <DetailRow
                label="To Account"
                value={
                  typeof transaction.toAccount === 'string'
                    ? transaction.toAccount
                    : (transaction.toAccount as any)?.accountNumber || 'N/A'
                }
              />
            )}

            {/* Third Party Details */}
            {transaction.thirdParty && (
              <>
                <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <Text className="text-xs font-medium text-gray-500 uppercase mb-2">
                    Recipient Details
                  </Text>
                  {transaction.thirdParty.name && (
                    <DetailRow label="Name" value={transaction.thirdParty.name} />
                  )}
                  {transaction.thirdParty.bank && (
                    <DetailRow label="Bank" value={transaction.thirdParty.bank} />
                  )}
                  {transaction.thirdParty.accountNumber && (
                    <DetailRow
                      label="Account Number"
                      value={transaction.thirdParty.accountNumber}
                    />
                  )}
                </View>
              </>
            )}

            {/* Bill Payment Details */}
            {transaction.billPayment && (
              <>
                <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <Text className="text-xs font-medium text-gray-500 uppercase mb-2">
                    Bill Details
                  </Text>
                  {transaction.billPayment.billerName && (
                    <DetailRow label="Biller" value={transaction.billPayment.billerName} />
                  )}
                  {transaction.billPayment.consumerNumber && (
                    <DetailRow
                      label="Consumer Number"
                      value={transaction.billPayment.consumerNumber}
                    />
                  )}
                  {transaction.billPayment.billType && (
                    <DetailRow label="Bill Type" value={transaction.billPayment.billType} />
                  )}
                </View>
              </>
            )}
          </View>
        </View>

        {/* Actions */}
        {transaction.status === 'completed' && (
          <View className="px-4 pb-6">
            <Pressable
              onPress={handleShare}
              className="flex-row items-center justify-center bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <Ionicons name="download-outline" size={20} color="#006747" />
              <Text className="text-hbl-green font-semibold ml-2">
                Download Receipt
              </Text>
            </Pressable>
          </View>
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
