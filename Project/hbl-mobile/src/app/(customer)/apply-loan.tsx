import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { loanService } from '@/src/services';
import { LoanType } from '@/src/types/api';

// Format currency in PKR
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Loan types configuration - Only types supported by backend API
const LOAN_TYPES: { type: LoanType; label: string; icon: keyof typeof Ionicons.glyphMap; color: string; minAmount: number; maxAmount: number; minTenure: number; maxTenure: number; rate: number }[] = [
  { type: 'personal', label: 'Personal Loan', icon: 'person', color: '#3B82F6', minAmount: 50000, maxAmount: 3000000, minTenure: 12, maxTenure: 60, rate: 15 },
  { type: 'home', label: 'Home Loan', icon: 'home', color: '#10B981', minAmount: 500000, maxAmount: 50000000, minTenure: 36, maxTenure: 240, rate: 10 },
  { type: 'car', label: 'Car Loan', icon: 'car', color: '#F59E0B', minAmount: 200000, maxAmount: 10000000, minTenure: 12, maxTenure: 84, rate: 12 },
  { type: 'business', label: 'Business Loan', icon: 'briefcase', color: '#EF4444', minAmount: 100000, maxAmount: 10000000, minTenure: 12, maxTenure: 60, rate: 14 },
];

type Step = 'type' | 'details' | 'review' | 'success';

interface LoanForm {
  loanType: LoanType | '';
  amount: string;
  tenure: string;
  purpose: string;
  collateral: string;
}

export default function ApplyLoanScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('type');
  const [loading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<LoanForm>({
    loanType: '',
    amount: '',
    tenure: '',
    purpose: '',
    collateral: '',
  });

  const [calculation, setCalculation] = useState<{
    emi: number;
    totalInterest: number;
    totalAmount: number;
  } | null>(null);

  const selectedLoanConfig = LOAN_TYPES.find((l) => l.type === form.loanType);

  // Calculate EMI when amount or tenure changes
  useEffect(() => {
    if (form.amount && form.tenure && selectedLoanConfig) {
      const principal = parseFloat(form.amount);
      const tenure = parseInt(form.tenure, 10);
      const annualRate = selectedLoanConfig.rate;

      if (principal > 0 && tenure > 0) {
        const monthlyRate = annualRate / 12 / 100;
        const emi =
          (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
          (Math.pow(1 + monthlyRate, tenure) - 1);
        const totalAmount = emi * tenure;
        const totalInterest = totalAmount - principal;

        setCalculation({
          emi: Math.round(emi),
          totalInterest: Math.round(totalInterest),
          totalAmount: Math.round(totalAmount),
        });
      }
    } else {
      setCalculation(null);
    }
  }, [form.amount, form.tenure, selectedLoanConfig]);

  const handleFormChange = (field: keyof LoanForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateDetails = (): boolean => {
    if (!form.amount) {
      setError('Please enter loan amount');
      return false;
    }

    const amount = parseFloat(form.amount);
    if (selectedLoanConfig) {
      if (amount < selectedLoanConfig.minAmount) {
        setError(`Minimum amount is ${formatCurrency(selectedLoanConfig.minAmount)}`);
        return false;
      }
      if (amount > selectedLoanConfig.maxAmount) {
        setError(`Maximum amount is ${formatCurrency(selectedLoanConfig.maxAmount)}`);
        return false;
      }
    }

    if (!form.tenure) {
      setError('Please select loan tenure');
      return false;
    }

    const tenure = parseInt(form.tenure, 10);
    if (selectedLoanConfig) {
      if (tenure < selectedLoanConfig.minTenure) {
        setError(`Minimum tenure is ${selectedLoanConfig.minTenure} months`);
        return false;
      }
      if (tenure > selectedLoanConfig.maxTenure) {
        setError(`Maximum tenure is ${selectedLoanConfig.maxTenure} months`);
        return false;
      }
    }

    if (!form.purpose.trim()) {
      setError('Please enter loan purpose');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await loanService.applyForLoan({
        loanType: form.loanType as LoanType,
        amount: parseFloat(form.amount),
        tenure: parseInt(form.tenure, 10),
        purpose: form.purpose,
        collateral: form.collateral || undefined,
      });

      setStep('success');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit application';
      setError(errorMessage);
      Alert.alert('Application Failed', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#006747" />
      </SafeAreaView>
    );
  }

  // Success Screen
  if (step === 'success') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={64} color="#10B981" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Application Submitted!
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
            Your loan application has been submitted successfully. We will review and get back to you soon.
          </Text>

          <View className="bg-white dark:bg-surface-dark rounded-xl p-4 w-full mb-6">
            <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <Text className="text-gray-500">Loan Type</Text>
              <Text className="font-medium text-gray-900 dark:text-white capitalize">
                {form.loanType} Loan
              </Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <Text className="text-gray-500">Amount</Text>
              <Text className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(parseFloat(form.amount))}
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-500">Monthly EMI</Text>
              <Text className="font-semibold text-hbl-green">
                {calculation ? formatCurrency(calculation.emi) : '-'}
              </Text>
            </View>
          </View>

          <Button
            title="View My Loans"
            onPress={() => router.replace('/(customer)/loans' as never)}
            size="lg"
            className="w-full mb-3"
          />
          <Pressable onPress={() => router.push('/(tabs)' as never)}>
            <Text className="text-hbl-green font-medium">Back to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
          <Pressable
            onPress={() => {
              if (step === 'type') router.back();
              else if (step === 'details') setStep('type');
              else if (step === 'review') setStep('details');
            }}
            className="mr-3"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">Apply for Loan</Text>
        </View>

        {/* Progress Indicator */}
        <View className="flex-row px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
          {['type', 'details', 'review'].map((s, index) => (
            <View key={s} className="flex-1 flex-row items-center">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  step === s || ['details', 'review'].indexOf(step) > ['type', 'details', 'review'].indexOf(s)
                    ? 'bg-hbl-green'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text className="text-white font-semibold">{index + 1}</Text>
              </View>
              {index < 2 && (
                <View
                  className={`flex-1 h-1 mx-2 ${
                    ['details', 'review'].indexOf(step) > index
                      ? 'bg-hbl-green'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </View>
          ))}
        </View>

        <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
          {/* Step 1: Select Loan Type */}
          {step === 'type' && (
            <View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Select Loan Type
              </Text>

              {LOAN_TYPES.map((loanType) => (
                <Pressable
                  key={loanType.type}
                  onPress={() => {
                    handleFormChange('loanType', loanType.type);
                    setStep('details');
                  }}
                  className="flex-row items-center bg-white dark:bg-surface-dark rounded-xl p-4 mb-3 active:opacity-90"
                >
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: `${loanType.color}20` }}
                  >
                    <Ionicons name={loanType.icon} size={24} color={loanType.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white">
                      {loanType.label}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      Up to {formatCurrency(loanType.maxAmount)} • {loanType.rate}% p.a.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </Pressable>
              ))}
            </View>
          )}

          {/* Step 2: Loan Details */}
          {step === 'details' && selectedLoanConfig && (
            <View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {selectedLoanConfig.label} Details
              </Text>

              {/* Amount */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Loan Amount (PKR)
                </Text>
                <View className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
                  <TextInput
                    value={form.amount}
                    onChangeText={(text) => handleFormChange('amount', text.replace(/[^0-9]/g, ''))}
                    placeholder={`${formatCurrency(selectedLoanConfig.minAmount)} - ${formatCurrency(selectedLoanConfig.maxAmount)}`}
                    keyboardType="numeric"
                    className="text-lg font-medium text-gray-900 dark:text-white"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Tenure */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tenure (Months)
                </Text>
                <View className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
                  <TextInput
                    value={form.tenure}
                    onChangeText={(text) => handleFormChange('tenure', text.replace(/[^0-9]/g, ''))}
                    placeholder={`${selectedLoanConfig.minTenure} - ${selectedLoanConfig.maxTenure} months`}
                    keyboardType="numeric"
                    className="text-lg font-medium text-gray-900 dark:text-white"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* EMI Calculator */}
              {calculation && (
                <View className="bg-hbl-green/10 rounded-xl p-4 mb-4">
                  <Text className="text-sm font-medium text-hbl-green mb-2">EMI Calculator</Text>
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-xs text-gray-600">Monthly EMI</Text>
                      <Text className="text-lg font-bold text-hbl-green">
                        {formatCurrency(calculation.emi)}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-xs text-gray-600">Total Interest</Text>
                      <Text className="text-base font-semibold text-gray-900">
                        {formatCurrency(calculation.totalInterest)}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-xs text-gray-600">Total Payable</Text>
                      <Text className="text-base font-semibold text-gray-900">
                        {formatCurrency(calculation.totalAmount)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Purpose */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Loan Purpose
                </Text>
                <View className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
                  <TextInput
                    value={form.purpose}
                    onChangeText={(text) => handleFormChange('purpose', text)}
                    placeholder="Enter the purpose of the loan"
                    multiline
                    numberOfLines={3}
                    className="text-gray-900 dark:text-white"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Collateral (Optional) */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Collateral (Optional)
                </Text>
                <View className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
                  <TextInput
                    value={form.collateral}
                    onChangeText={(text) => handleFormChange('collateral', text)}
                    placeholder="Enter collateral details if any"
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
            </View>
          )}

          {/* Step 3: Review */}
          {step === 'review' && selectedLoanConfig && (
            <View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Review Application
              </Text>

              <View className="bg-white dark:bg-surface-dark rounded-xl p-4 mb-4">
                {[
                  { label: 'Loan Type', value: `${selectedLoanConfig.label}` },
                  { label: 'Loan Amount', value: formatCurrency(parseFloat(form.amount)) },
                  { label: 'Tenure', value: `${form.tenure} months` },
                  { label: 'Interest Rate', value: `${selectedLoanConfig.rate}% p.a.` },
                  { label: 'Monthly EMI', value: calculation ? formatCurrency(calculation.emi) : '-', highlight: true },
                  { label: 'Total Interest', value: calculation ? formatCurrency(calculation.totalInterest) : '-' },
                  { label: 'Total Payable', value: calculation ? formatCurrency(calculation.totalAmount) : '-' },
                  { label: 'Purpose', value: form.purpose },
                  ...(form.collateral ? [{ label: 'Collateral', value: form.collateral }] : []),
                ].map((item, index) => (
                  <View
                    key={item.label}
                    className={`flex-row justify-between py-3 ${
                      index < 7 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                    }`}
                  >
                    <Text className="text-gray-500 dark:text-gray-400">{item.label}</Text>
                    <Text
                      className={`font-medium text-right flex-1 ml-4 ${
                        item.highlight ? 'text-hbl-green text-lg' : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Terms */}
              <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-4">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  By submitting this application, you agree to the terms and conditions of HBL loan services.
                  Interest rates and approval are subject to credit assessment.
                </Text>
              </View>

              {error && (
                <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <Text className="text-red-600 text-sm">{error}</Text>
                </View>
              )}
            </View>
          )}

          <View className="h-4" />
        </ScrollView>

        {/* Bottom Actions */}
        {step !== 'type' && (
          <View className="px-4 py-4 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800">
            {step === 'details' && (
              <Button
                title="Review Application"
                onPress={() => {
                  if (validateDetails()) setStep('review');
                }}
                size="lg"
              />
            )}
            {step === 'review' && (
              <Button
                title="Submit Application"
                onPress={handleSubmit}
                loading={submitting}
                disabled={submitting}
                size="lg"
              />
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
