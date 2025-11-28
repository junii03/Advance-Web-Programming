import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { accountService, dashboardService } from '@/src/services';
import { AccountType } from '@/src/types/api/account';

// Account types configuration
const ACCOUNT_TYPES = [
  {
    value: 'savings',
    label: 'Savings Account',
    description: 'Standard savings account with 7.5% interest rate',
    icon: 'trending-up',
    color: '#3B82F6',
    minDeposit: 1000,
  },
  {
    value: 'current',
    label: 'Current Account',
    description: 'For daily transactions with higher limits',
    icon: 'cash',
    color: '#10B981',
    minDeposit: 5000,
  },
  {
    value: 'fixed_deposit',
    label: 'Fixed Deposit',
    description: '12.5% interest rate with fixed tenure',
    icon: 'calendar',
    color: '#8B5CF6',
    minDeposit: 50000,
  },
  {
    value: 'islamic_savings',
    label: 'Islamic Savings',
    description: 'Shariah-compliant savings account',
    icon: 'shield-checkmark',
    color: '#14B8A6',
    minDeposit: 1000,
  },
  {
    value: 'salary',
    label: 'Salary Account',
    description: 'For salary deposits with no minimum balance',
    icon: 'briefcase',
    color: '#F59E0B',
    minDeposit: 0,
  },
];

// Branch type
interface Branch {
  _id: string;
  branchCode: string;
  name: string;
  city: string;
  address: string;
}

// Account Type Selection Component
const AccountTypeCard = ({
  type,
  isSelected,
  onSelect,
}: {
  type: (typeof ACCOUNT_TYPES)[0];
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <Pressable
    onPress={onSelect}
    className={`p-4 rounded-xl border-2 mb-3 ${
      isSelected
        ? 'border-hbl-green bg-green-50 dark:bg-green-900/20'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark'
    }`}
  >
    <View className="flex-row items-center">
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: `${type.color}20` }}
      >
        <Ionicons name={type.icon as any} size={24} color={type.color} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900 dark:text-white">
          {type.label}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {type.description}
        </Text>
        {type.minDeposit > 0 && (
          <Text className="text-xs text-hbl-green mt-1">
            Min. deposit: PKR {type.minDeposit.toLocaleString()}
          </Text>
        )}
      </View>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={24} color="#006747" />
      )}
    </View>
  </Pressable>
);

// Branch Selection Component
const BranchSelector = ({
  branches,
  selectedBranch,
  onSelect,
}: {
  branches: Branch[];
  selectedBranch: Branch | null;
  onSelect: (branch: Branch) => void;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <View>
      <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
        Select Branch
      </Text>
      <Pressable
        onPress={() => setShowDropdown(!showDropdown)}
        className="flex-row items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark"
      >
        <Text
          className={`text-base ${
            selectedBranch
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {selectedBranch
            ? `${selectedBranch.name} (${selectedBranch.branchCode})`
            : 'Select a branch'}
        </Text>
        <Ionicons
          name={showDropdown ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#6B7280"
        />
      </Pressable>

      {showDropdown && (
        <View className="mt-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark max-h-64 overflow-hidden">
          <ScrollView showsVerticalScrollIndicator={false}>
            {branches.map((branch) => (
              <Pressable
                key={branch._id}
                onPress={() => {
                  onSelect(branch);
                  setShowDropdown(false);
                }}
                className={`p-4 border-b border-gray-100 dark:border-gray-800 ${
                  selectedBranch?._id === branch._id
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : ''
                }`}
              >
                <Text className="text-sm font-medium text-gray-900 dark:text-white">
                  {branch.name}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {branch.city} • Code: {branch.branchCode}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default function AddAccountScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Form state
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [accountTitle, setAccountTitle] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [initialDeposit, setInitialDeposit] = useState('');

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await dashboardService.getBranches();
        setBranches(data);
      } catch (err) {
        console.error('Failed to fetch branches:', err);
      } finally {
        setBranchesLoading(false);
      }
    };
    fetchBranches();
  }, []);

  const selectedTypeConfig = ACCOUNT_TYPES.find((t) => t.value === selectedType);

  const validateStep1 = () => {
    if (!selectedType) {
      Alert.alert('Required', 'Please select an account type');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!accountTitle.trim()) {
      Alert.alert('Required', 'Please enter an account title');
      return false;
    }
    if (!selectedBranch) {
      Alert.alert('Required', 'Please select a branch');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const minDeposit = selectedTypeConfig?.minDeposit || 0;
    const deposit = parseFloat(initialDeposit) || 0;

    if (minDeposit > 0 && deposit < minDeposit) {
      Alert.alert(
        'Invalid Deposit',
        `Minimum initial deposit for ${selectedTypeConfig?.label} is PKR ${minDeposit.toLocaleString()}`
      );
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    try {
      setLoading(true);

      const data = {
        accountType: selectedType as AccountType,
        accountTitle: accountTitle.trim(),
        currency: 'PKR',
      };

      await accountService.createAccount(data);

      Alert.alert(
        'Success',
        'Your account has been created successfully!',
        [
          {
            text: 'View Accounts',
            onPress: () => router.replace('/(tabs)/accounts'),
          },
        ]
      );
    } catch (err: any) {
      console.error('Failed to create account:', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
        <Pressable onPress={handleBack} className="mr-3">
          <Ionicons name="chevron-back" size={28} color="#006747" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900 dark:text-white flex-1">
          Open New Account
        </Text>
        <Text className="text-sm text-gray-500">Step {step}/3</Text>
      </View>

      {/* Progress Bar */}
      <View className="flex-row px-4 py-3 bg-white dark:bg-surface-dark">
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            className={`flex-1 h-1 rounded-full mx-1 ${
              s <= step ? 'bg-hbl-green' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Step 1: Select Account Type */}
        {step === 1 && (
          <View>
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Choose Account Type
            </Text>
            {ACCOUNT_TYPES.map((type) => (
              <AccountTypeCard
                key={type.value}
                type={type}
                isSelected={selectedType === type.value}
                onSelect={() => setSelectedType(type.value)}
              />
            ))}
          </View>
        )}

        {/* Step 2: Account Details */}
        {step === 2 && (
          <View>
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Account Details
            </Text>

            {/* Selected Type Badge */}
            {selectedTypeConfig && (
              <View className="flex-row items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 mb-4">
                <Ionicons
                  name={selectedTypeConfig.icon as any}
                  size={20}
                  color={selectedTypeConfig.color}
                />
                <Text className="text-sm font-medium text-hbl-green ml-2">
                  {selectedTypeConfig.label}
                </Text>
              </View>
            )}

            {/* Account Title */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Account Title
              </Text>
              <TextInput
                value={accountTitle}
                onChangeText={setAccountTitle}
                placeholder="e.g., My Savings Account"
                placeholderTextColor="#9CA3AF"
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-gray-900 dark:text-white"
                maxLength={100}
              />
            </View>

            {/* Branch Selection */}
            {branchesLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="small" color="#006747" />
                <Text className="text-gray-500 mt-2">Loading branches...</Text>
              </View>
            ) : (
              <BranchSelector
                branches={branches}
                selectedBranch={selectedBranch}
                onSelect={setSelectedBranch}
              />
            )}
          </View>
        )}

        {/* Step 3: Initial Deposit */}
        {step === 3 && (
          <View>
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Initial Deposit
            </Text>

            {/* Summary */}
            <View className="bg-white dark:bg-surface-dark rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-700">
              <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Account Summary
              </Text>
              <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <Text className="text-sm text-gray-500">Type</Text>
                <Text className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedTypeConfig?.label}
                </Text>
              </View>
              <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <Text className="text-sm text-gray-500">Title</Text>
                <Text className="text-sm font-medium text-gray-900 dark:text-white">
                  {accountTitle}
                </Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-sm text-gray-500">Branch</Text>
                <Text className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedBranch?.name}
                </Text>
              </View>
            </View>

            {/* Deposit Amount */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Initial Deposit Amount (PKR)
              </Text>
              <TextInput
                value={initialDeposit}
                onChangeText={(text) =>
                  setInitialDeposit(text.replace(/[^0-9]/g, ''))
                }
                placeholder={`Minimum: PKR ${(
                  selectedTypeConfig?.minDeposit || 0
                ).toLocaleString()}`}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-gray-900 dark:text-white text-lg"
              />
              {selectedTypeConfig?.minDeposit === 0 && (
                <Text className="text-xs text-gray-500 mt-2">
                  Initial deposit is optional for this account type
                </Text>
              )}
            </View>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-4 py-4 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800">
        {step < 3 ? (
          <Pressable
            onPress={handleNext}
            disabled={loading}
            className="bg-hbl-green py-4 rounded-xl items-center"
          >
            <Text className="text-white font-semibold text-base">Continue</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            className="bg-hbl-green py-4 rounded-xl items-center flex-row justify-center"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text className="text-white font-semibold text-base">
                  Create Account
                </Text>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" className="ml-2" />
              </>
            )}
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
