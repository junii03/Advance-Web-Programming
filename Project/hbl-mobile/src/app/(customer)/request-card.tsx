import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { Button } from '@/src/components/ui/button';
import { accountService, cardService } from '@/src/services';
import { ApiAccount, CardType } from '@/src/types/api';

// Card type configurations
const CARD_TYPES: { type: CardType; label: string; description: string; color1: string; color2: string }[] = [
  {
    type: 'debit',
    label: 'Debit Card',
    description: 'Linked to your bank account for direct transactions',
    color1: '#006747',
    color2: '#00875A',
  },
  {
    type: 'credit',
    label: 'Credit Card',
    description: 'Line of credit with monthly billing cycle',
    color1: '#1E3A8A',
    color2: '#3B82F6',
  },
];

type Step = 'type' | 'account' | 'details' | 'success';

interface CardForm {
  cardType: CardType | '';
  accountId: string;
  cardName: string;
}

export default function RequestCardScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('type');
  const [accounts, setAccounts] = useState<ApiAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardResult, setCardResult] = useState<{ _id: string; cardNumber: string } | null>(null);

  const [form, setForm] = useState<CardForm>({
    cardType: '',
    accountId: '',
    cardName: '',
  });

  const selectedAccount = accounts.find((a) => a._id === form.accountId);
  const selectedCardType = CARD_TYPES.find((c) => c.type === form.cardType);

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await accountService.getAccounts();
      const activeAccounts = data.filter((acc) => acc.status === 'active');
      setAccounts(activeAccounts);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleFormChange = (field: keyof CardForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateAccount = (): boolean => {
    if (!form.accountId) {
      setError('Please select an account');
      return false;
    }
    return true;
  };

  const validateDetails = (): boolean => {
    // Card name is optional but if provided, validate it
    if (form.cardName && (form.cardName.length < 2 || form.cardName.length > 50)) {
      setError('Card name must be between 2 and 50 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const result = await cardService.requestCard({
        cardType: form.cardType as CardType,
        accountId: form.accountId,
        cardName: form.cardName || undefined,
      });

      setCardResult({ _id: result._id, cardNumber: result.cardNumber });
      setStep('success');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request card';
      setError(errorMessage);
      Alert.alert('Request Failed', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Mask card number helper
  const maskCardNumber = (num: string | undefined): string => {
    if (!num) return '**** **** **** ****';
    return `${num.slice(0, 4)} **** **** ${num.slice(-4)}`;
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
            Card Requested Successfully!
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
            Your card request has been submitted. You will receive your card within 7-10 business days.
          </Text>

          {/* Card Preview */}
          {selectedCardType && (
            <LinearGradient
              colors={[selectedCardType.color1, selectedCardType.color2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 16, padding: 24, width: '100%', marginBottom: 24 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>HBL</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, textTransform: 'uppercase' }}>{form.cardType}</Text>
              </View>
              <Text style={{ color: 'white', fontSize: 18, fontFamily: 'monospace', letterSpacing: 4, marginBottom: 16 }}>
                {maskCardNumber(cardResult?.cardNumber)}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <View>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginBottom: 4 }}>CARD HOLDER</Text>
                  <Text style={{ color: 'white', fontWeight: '600', textTransform: 'uppercase' }}>
                    {form.cardName || selectedAccount?.accountTitle || 'Card Holder'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginBottom: 4 }}>STATUS</Text>
                  <Text style={{ color: '#FCD34D', fontWeight: '600' }}>PENDING</Text>
                </View>
              </View>
            </LinearGradient>
          )}

          <Button
            title="View My Cards"
            onPress={() => router.replace('/(tabs)/cards' as never)}
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
              else if (step === 'account') setStep('type');
              else if (step === 'details') setStep('account');
            }}
            className="mr-3"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">Request New Card</Text>
        </View>

        {/* Progress Indicator */}
        <View className="flex-row px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
          {['type', 'account', 'details'].map((s, index) => {
            const steps = ['type', 'account', 'details'];
            const currentIndex = steps.indexOf(step);
            const stepIndex = steps.indexOf(s);
            return (
              <View key={s} className="flex-1 flex-row items-center">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    currentIndex >= stepIndex ? 'bg-hbl-green' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text className="text-white font-semibold">{index + 1}</Text>
                </View>
                {index < 2 && (
                  <View
                    className={`flex-1 h-1 mx-2 ${
                      currentIndex > stepIndex ? 'bg-hbl-green' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </View>
            );
          })}
        </View>

        <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
          {/* Step 1: Select Card Type */}
          {step === 'type' && (
            <View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Select Card Type
              </Text>

              {CARD_TYPES.map((cardType) => (
                <Pressable
                  key={cardType.type}
                  onPress={() => {
                    handleFormChange('cardType', cardType.type);
                    setStep('account');
                  }}
                  className="bg-white dark:bg-surface-dark rounded-xl overflow-hidden mb-4 active:opacity-90"
                >
                  <LinearGradient
                    colors={[cardType.color1, cardType.color2]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ padding: 20 }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>HBL</Text>
                      <Ionicons
                        name={cardType.type === 'debit' ? 'card' : 'card-outline'}
                        size={28}
                        color="white"
                      />
                    </View>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: '700', marginBottom: 8 }}>{cardType.label}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)' }}>{cardType.description}</Text>
                  </LinearGradient>
                  <View className="px-5 py-4 flex-row items-center justify-between">
                    <Text className="text-gray-600 dark:text-gray-400">
                      {cardType.type === 'debit'
                        ? 'No annual fee • Instant activation'
                        : 'Reward points • Cash back offers'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {/* Step 2: Select Account */}
          {step === 'account' && (
            <View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {form.cardType === 'debit' ? 'Link to Account' : 'Primary Account'}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 mb-4">
                {form.cardType === 'debit'
                  ? 'Select the account to link with your debit card'
                  : 'Select the account for your credit card payments'}
              </Text>

              {accounts.length === 0 ? (
                <View className="bg-amber-50 rounded-xl p-4">
                  <Text className="text-amber-800 text-center">
                    No active accounts found. Please open an account first.
                  </Text>
                </View>
              ) : (
                accounts.map((account) => (
                  <Pressable
                    key={account._id}
                    onPress={() => {
                      handleFormChange('accountId', account._id);
                    }}
                    className={`bg-white dark:bg-surface-dark rounded-xl p-4 mb-3 border-2 ${
                      form.accountId === account._id
                        ? 'border-hbl-green'
                        : 'border-transparent'
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View className="w-12 h-12 rounded-full bg-hbl-green/10 items-center justify-center mr-4">
                        <Ionicons
                          name={
                            account.accountType === 'savings'
                              ? 'wallet'
                              : account.accountType === 'current'
                                ? 'briefcase'
                                : 'cash'
                          }
                          size={24}
                          color="#006747"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900 dark:text-white">
                          {account.accountTitle}
                        </Text>
                        <Text className="text-sm text-gray-500 mt-0.5">
                          {account.accountNumber}
                        </Text>
                        <Text className="text-xs text-gray-400 mt-0.5 capitalize">
                          {account.accountType} Account
                        </Text>
                      </View>
                      {form.accountId === account._id && (
                        <Ionicons name="checkmark-circle" size={24} color="#006747" />
                      )}
                    </View>
                  </Pressable>
                ))
              )}

              {error && (
                <View className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <Text className="text-red-600 text-sm">{error}</Text>
                </View>
              )}
            </View>
          )}

          {/* Step 3: Card Details & Review */}
          {step === 'details' && selectedCardType && (
            <View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Card Details
              </Text>

              {/* Card Name (Optional) */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Card Name (Optional)
                </Text>
                <View className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
                  <TextInput
                    value={form.cardName}
                    onChangeText={(text) => handleFormChange('cardName', text)}
                    placeholder="Give your card a nickname"
                    maxLength={50}
                    className="text-gray-900 dark:text-white"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <Text className="text-xs text-gray-400 mt-1">
                  e.g., &quot;My Shopping Card&quot;, &quot;Travel Card&quot;
                </Text>
              </View>

              {/* Card Preview */}
              <View className="mt-4 mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Card Preview
                </Text>
                <LinearGradient
                  colors={[selectedCardType.color1, selectedCardType.color2]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 16, padding: 20 }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>HBL</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, textTransform: 'uppercase' }}>{form.cardType}</Text>
                  </View>
                  <Text style={{ color: 'white', fontSize: 18, fontFamily: 'monospace', letterSpacing: 4, marginBottom: 16 }}>
                    **** **** **** ****
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <View>
                      <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginBottom: 4 }}>CARD NAME</Text>
                      <Text style={{ color: 'white', fontWeight: '600' }}>
                        {form.cardName || selectedCardType.label}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginBottom: 4 }}>VALID THRU</Text>
                      <Text style={{ color: 'white', fontWeight: '600' }}>--/--</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              {/* Summary */}
              <View className="bg-white dark:bg-surface-dark rounded-xl p-4 mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Request Summary</Text>
                {[
                  { label: 'Card Type', value: selectedCardType.label },
                  { label: 'Linked Account', value: selectedAccount?.accountTitle || '-' },
                  { label: 'Account Number', value: selectedAccount?.accountNumber || '-' },
                  { label: 'Card Name', value: form.cardName || 'Not specified' },
                ].map((item, index, arr) => (
                  <View
                    key={item.label}
                    className={`flex-row justify-between py-2 ${
                      index < arr.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                    }`}
                  >
                    <Text className="text-gray-500 dark:text-gray-400">{item.label}</Text>
                    <Text className="font-medium text-gray-900 dark:text-white text-right flex-1 ml-4">
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Terms */}
              <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-4">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  By submitting this request, you agree to the terms and conditions of HBL card
                  services. Card delivery typically takes 7-10 business days.
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
            {step === 'account' && (
              <Button
                title="Continue"
                onPress={() => {
                  if (validateAccount()) setStep('details');
                }}
                disabled={!form.accountId}
                size="lg"
              />
            )}
            {step === 'details' && (
              <Button
                title="Submit Request"
                onPress={() => {
                  if (validateDetails()) handleSubmit();
                }}
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
