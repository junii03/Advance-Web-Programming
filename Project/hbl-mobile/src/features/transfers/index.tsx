import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/src/components/ui/button';
import { accountService, transactionService, dashboardService } from '@/src/services';
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

type TransferType = 'own' | 'other';
type Step = 'form' | 'confirm' | 'success';

interface TransferForm {
  transferType: TransferType;
  fromAccountId: string;
  toAccountId: string;
  toAccountNumber: string;
  toAccountTitle: string;
  amount: string;
  description: string;
}

export default function TransfersScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<ApiAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState<string | null>(null);
  const [transactionResult, setTransactionResult] = useState<{
    referenceNumber: string;
    amount: number;
  } | null>(null);

  const [form, setForm] = useState<TransferForm>({
    transferType: 'own',
    fromAccountId: '',
    toAccountId: '',
    toAccountNumber: '',
    toAccountTitle: '',
    amount: '',
    description: '',
  });

  const [accountLookup, setAccountLookup] = useState<{
    loading: boolean;
    verified: boolean;
    accountInfo: { accountTitle: string } | null;
    error: string;
  }>({
    loading: false,
    verified: false,
    accountInfo: null,
    error: '',
  });

  const [selectedFromAccount, setSelectedFromAccount] = useState<ApiAccount | null>(null);
  const [selectedToAccount, setSelectedToAccount] = useState<ApiAccount | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await accountService.getAccounts();
      const activeAccounts = data.filter((acc) => acc.status === 'active');
      setAccounts(activeAccounts);

      if (activeAccounts.length > 0) {
        setForm((prev) => ({ ...prev, fromAccountId: activeAccounts[0]._id }));
        setSelectedFromAccount(activeAccounts[0]);
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Account lookup for external transfers
  useEffect(() => {
    const lookupAccount = async () => {
      if (form.transferType === 'other' && form.toAccountNumber.length >= 10) {
        setAccountLookup((prev) => ({ ...prev, loading: true, error: '' }));

        try {
          const result = await dashboardService.lookupAccount(form.toAccountNumber);
          setAccountLookup({
            loading: false,
            verified: true,
            accountInfo: result,
            error: '',
          });

          if (!form.toAccountTitle && result.accountTitle) {
            setForm((prev) => ({ ...prev, toAccountTitle: result.accountTitle }));
          }
        } catch {
          setAccountLookup({
            loading: false,
            verified: false,
            accountInfo: null,
            error: 'Account not found',
          });
        }
      } else {
        setAccountLookup({ loading: false, verified: false, accountInfo: null, error: '' });
      }
    };

    const timeoutId = setTimeout(lookupAccount, 500);
    return () => clearTimeout(timeoutId);
  }, [form.toAccountNumber, form.transferType]);

  const handleFormChange = (field: keyof TransferForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);

    if (field === 'fromAccountId') {
      const account = accounts.find((acc) => acc._id === value);
      setSelectedFromAccount(account || null);
    }

    if (field === 'toAccountId' && form.transferType === 'own') {
      const account = accounts.find((acc) => acc._id === value);
      setSelectedToAccount(account || null);
    }

    if (field === 'transferType') {
      setForm((prev) => ({
        ...prev,
        toAccountId: '',
        toAccountNumber: '',
        toAccountTitle: '',
      }));
      setSelectedToAccount(null);
    }
  };

  const validateForm = (): boolean => {
    if (!form.fromAccountId) {
      setError('Please select a source account');
      return false;
    }

    if (form.transferType === 'own' && !form.toAccountId) {
      setError('Please select a destination account');
      return false;
    }

    if (form.transferType === 'other') {
      if (!form.toAccountNumber) {
        setError('Please enter destination account number');
        return false;
      }
      if (!form.toAccountTitle) {
        setError('Please enter account holder name');
        return false;
      }
    }

    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (selectedFromAccount && amount > selectedFromAccount.availableBalance) {
      setError('Insufficient balance');
      return false;
    }

    if (!form.description.trim()) {
      setError('Please enter a description');
      return false;
    }

    if (form.transferType === 'own' && form.fromAccountId === form.toAccountId) {
      setError('Source and destination accounts cannot be the same');
      return false;
    }

    return true;
  };

  const handleContinue = () => {
    if (validateForm()) {
      setStep('confirm');
    }
  };

  const handleTransfer = async () => {
    setSubmitting(true);
    setError(null);

    try {
      let result;
      const amount = parseFloat(form.amount);

      if (form.transferType === 'own') {
        result = await transactionService.transferBetweenAccounts(
          form.fromAccountId,
          form.toAccountId,
          amount,
          form.description
        );
      } else {
        result = await transactionService.transferToExternal(
          form.fromAccountId,
          amount,
          form.description,
          {
            name: form.toAccountTitle,
            bank: 'External Bank',
            accountNumber: form.toAccountNumber,
          }
        );
      }

      setTransactionResult({
        referenceNumber: result.referenceNumber,
        amount: result.amount,
      });
      setStep('success');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Transfer failed. Please try again.';
      setError(errorMessage);
      Alert.alert('Transfer Failed', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      transferType: 'own',
      fromAccountId: accounts[0]?._id || '',
      toAccountId: '',
      toAccountNumber: '',
      toAccountTitle: '',
      amount: '',
      description: '',
    });
    setSelectedFromAccount(accounts[0] || null);
    setSelectedToAccount(null);
    setStep('form');
    setError(null);
    setTransactionResult(null);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#006747" />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading...</Text>
      </SafeAreaView>
    );
  }

  // Success Screen
  if (step === 'success' && transactionResult) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={64} color="#10B981" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Transfer Successful!
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
            Your transfer has been processed successfully.
          </Text>

          <View className="bg-white dark:bg-surface-dark rounded-xl p-4 w-full mb-6">
            <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <Text className="text-gray-500">Amount</Text>
              <Text className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(transactionResult.amount)}
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-500">Reference</Text>
              <Text className="font-mono text-gray-900 dark:text-white">
                {transactionResult.referenceNumber}
              </Text>
            </View>
          </View>

          <Button title="Make Another Transfer" onPress={resetForm} size="lg" className="w-full mb-3" />
          <Pressable onPress={() => router.push('/(tabs)' as never)}>
            <Text className="text-hbl-green font-medium">Back to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Confirmation Screen
  if (step === 'confirm') {
    const amount = parseFloat(form.amount);
    const fee = form.transferType === 'other' ? 50 : 0;
    const total = amount + fee;

    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
        <View className="flex-row items-center px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
          <Pressable onPress={() => setStep('form')} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">Confirm Transfer</Text>
        </View>

        <ScrollView className="flex-1 px-4 pt-4">
          {/* Amount */}
          <View className="bg-hbl-green rounded-xl p-6 mb-4 items-center">
            <Text className="text-white/80 text-sm mb-1">Transfer Amount</Text>
            <Text className="text-3xl font-bold text-white">{formatCurrency(amount)}</Text>
          </View>

          {/* Transfer Details */}
          <View className="bg-white dark:bg-surface-dark rounded-xl p-4 mb-4">
            <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Transfer Details
            </Text>

            <View className="space-y-3">
              <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <Text className="text-gray-500">From</Text>
                <Text className="font-medium text-gray-900 dark:text-white text-right flex-1 ml-4" numberOfLines={1}>
                  {selectedFromAccount?.accountTitle}
                </Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <Text className="text-gray-500">To</Text>
                <Text className="font-medium text-gray-900 dark:text-white text-right flex-1 ml-4" numberOfLines={1}>
                  {form.transferType === 'own'
                    ? selectedToAccount?.accountTitle
                    : form.toAccountTitle}
                </Text>
              </View>

              {form.transferType === 'other' && (
                <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <Text className="text-gray-500">Account No.</Text>
                  <Text className="font-mono text-gray-900 dark:text-white">
                    {form.toAccountNumber}
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <Text className="text-gray-500">Description</Text>
                <Text className="font-medium text-gray-900 dark:text-white text-right flex-1 ml-4" numberOfLines={2}>
                  {form.description}
                </Text>
              </View>

              {fee > 0 && (
                <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <Text className="text-gray-500">Transfer Fee</Text>
                  <Text className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(fee)}
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between py-2">
                <Text className="font-semibold text-gray-900 dark:text-white">Total</Text>
                <Text className="font-bold text-hbl-green text-lg">{formatCurrency(total)}</Text>
              </View>
            </View>
          </View>

          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}
        </ScrollView>

        <View className="px-4 py-4 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800">
          <Button
            title="Confirm Transfer"
            onPress={handleTransfer}
            loading={submitting}
            disabled={submitting}
            size="lg"
          />
        </View>
      </SafeAreaView>
    );
  }

  // Form Screen
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">Transfer Money</Text>
        </View>

        <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
          {/* Transfer Type Selection */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transfer Type
            </Text>
            <View className="flex-row gap-3">
              {[
                { type: 'own' as const, label: 'Own Accounts', icon: 'swap-horizontal' },
                { type: 'other' as const, label: 'Other Account', icon: 'person' },
              ].map((item) => (
                <Pressable
                  key={item.type}
                  onPress={() => handleFormChange('transferType', item.type)}
                  className={`flex-1 flex-row items-center justify-center p-4 rounded-xl border ${
                    form.transferType === item.type
                      ? 'bg-hbl-green/10 border-hbl-green'
                      : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Ionicons
                    name={item.icon as never}
                    size={20}
                    color={form.transferType === item.type ? '#006747' : '#6B7280'}
                  />
                  <Text
                    className={`ml-2 font-medium ${
                      form.transferType === item.type
                        ? 'text-hbl-green'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* From Account */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Account
            </Text>
            <Pressable
              onPress={() => setShowFromPicker(!showFromPicker)}
              className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl p-4"
            >
              {selectedFromAccount ? (
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900 dark:text-white">
                      {selectedFromAccount.accountTitle}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      {selectedFromAccount.accountNumber} • {formatCurrency(selectedFromAccount.availableBalance)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </View>
              ) : (
                <Text className="text-gray-400">Select account</Text>
              )}
            </Pressable>

            {showFromPicker && (
              <View className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl mt-2 overflow-hidden">
                {accounts.map((account) => (
                  <Pressable
                    key={account._id}
                    onPress={() => {
                      handleFormChange('fromAccountId', account._id);
                      setShowFromPicker(false);
                    }}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 ${
                      form.fromAccountId === account._id ? 'bg-hbl-green/10' : ''
                    }`}
                  >
                    <Text className="font-medium text-gray-900 dark:text-white">
                      {account.accountTitle}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {account.accountNumber} • {formatCurrency(account.availableBalance)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* To Account - Own Accounts */}
          {form.transferType === 'own' && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To Account
              </Text>
              <Pressable
                onPress={() => setShowToPicker(!showToPicker)}
                className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl p-4"
              >
                {selectedToAccount ? (
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900 dark:text-white">
                        {selectedToAccount.accountTitle}
                      </Text>
                      <Text className="text-sm text-gray-500 mt-1">
                        {selectedToAccount.accountNumber}
                      </Text>
                    </View>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </View>
                ) : (
                  <Text className="text-gray-400">Select destination account</Text>
                )}
              </Pressable>

              {showToPicker && (
                <View className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl mt-2 overflow-hidden">
                  {accounts
                    .filter((acc) => acc._id !== form.fromAccountId)
                    .map((account) => (
                      <Pressable
                        key={account._id}
                        onPress={() => {
                          handleFormChange('toAccountId', account._id);
                          setShowToPicker(false);
                        }}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 ${
                          form.toAccountId === account._id ? 'bg-hbl-green/10' : ''
                        }`}
                      >
                        <Text className="font-medium text-gray-900 dark:text-white">
                          {account.accountTitle}
                        </Text>
                        <Text className="text-sm text-gray-500">{account.accountNumber}</Text>
                      </Pressable>
                    ))}
                </View>
              )}
            </View>
          )}

          {/* To Account - External */}
          {form.transferType === 'other' && (
            <>
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Number
                </Text>
                <View className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 flex-row items-center">
                  <TextInput
                    value={form.toAccountNumber}
                    onChangeText={(text) => handleFormChange('toAccountNumber', text)}
                    placeholder="Enter account number"
                    keyboardType="numeric"
                    className="flex-1 text-gray-900 dark:text-white"
                    placeholderTextColor="#9CA3AF"
                  />
                  {accountLookup.loading && <ActivityIndicator size="small" color="#006747" />}
                  {accountLookup.verified && (
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  )}
                </View>
                {accountLookup.error && (
                  <Text className="text-red-500 text-xs mt-1">{accountLookup.error}</Text>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Holder Name
                </Text>
                <View className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
                  <TextInput
                    value={form.toAccountTitle}
                    onChangeText={(text) => handleFormChange('toAccountTitle', text)}
                    placeholder="Enter account holder name"
                    className="text-gray-900 dark:text-white"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </>
          )}

          {/* Amount */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (PKR)
            </Text>
            <View className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
              <TextInput
                value={form.amount}
                onChangeText={(text) => handleFormChange('amount', text.replace(/[^0-9]/g, ''))}
                placeholder="0"
                keyboardType="numeric"
                className="text-2xl font-bold text-gray-900 dark:text-white"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            {form.transferType === 'other' && (
              <Text className="text-xs text-gray-500 mt-1">Transfer fee: PKR 50</Text>
            )}
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </Text>
            <View className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
              <TextInput
                value={form.description}
                onChangeText={(text) => handleFormChange('description', text)}
                placeholder="Enter transfer description"
                multiline
                numberOfLines={2}
                className="text-gray-900 dark:text-white"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}

          <View className="h-4" />
        </ScrollView>

        <View className="px-4 py-4 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800">
          <Button title="Continue" onPress={handleContinue} size="lg" />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
