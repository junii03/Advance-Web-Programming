import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { Card } from '@/src/components/ui/card';
import { useAuth } from '@/src/contexts/auth';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const quickActions = [
    { id: 1, label: 'Transfer', icon: 'send', color: 'bg-info' },
    { id: 2, label: 'Pay Bills', icon: 'receipt', color: 'bg-warning' },
    { id: 3, label: 'Cards', icon: 'credit-card', color: 'bg-hbl-red' },
    { id: 4, label: 'Loans', icon: 'file-document', color: 'bg-success' },
  ];

  const accountSummary = [
    { label: 'Total Accounts', value: '3', icon: 'bank' },
    { label: 'Total Balance', value: 'PKR 250,000', icon: 'cash-multiple' },
    { label: 'Pending', value: '1', icon: 'clock-outline' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="bg-hbl-red px-4 py-5 pb-6">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-xs text-white/80">Welcome Back</Text>
              <Text className="text-lg font-bold text-white mt-1">
                {user?.name || 'User'}
              </Text>
            </View>
            <Pressable onPress={() => router.push('/(account)/profile')}>
              <View className="h-11 w-11 rounded-full bg-white/30 flex-center">
                <MaterialCommunityIcons name="account-circle" size={24} color="#FFFFFF" />
              </View>
            </Pressable>
          </View>

          {/* Account Balance Card */}
          <Card className="bg-black/20 border-white/20">
            <Text className="text-xs text-white/80 mb-1">Total Balance</Text>
            <Text className="text-2xl font-bold text-white">PKR 250,000</Text>
            <Text className="text-xs text-white/70 mt-2">Account • 0910-460815</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <View className="p-4">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Quick Actions
          </Text>
          <View className="flex-row gap-3 flex-wrap">
            {quickActions.map((action) => (
              <Pressable
                key={action.id}
                onPress={() => {
                  if (action.label === 'Transfer') router.push('/(transactions)/transfer');
                  if (action.label === 'Cards') router.push('/(account)/cards');
                }}
                className="flex-1 min-w-[48%] py-4 px-3 rounded-lg bg-surface-light dark:bg-surface-dark items-center gap-2"
              >
                <View className={`h-11 w-11 rounded-full flex-center ${action.color}`}>
                  <MaterialCommunityIcons name={action.icon as any} size={20} color="#FFFFFF" />
                </View>
                <Text className="text-xs font-semibold text-gray-900 dark:text-white">
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Account Summary */}
        <View className="px-4 mb-4">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Account Summary
          </Text>
          <Card>
            {accountSummary.map((item, index) => (
              <View
                key={index}
                className={`flex-row items-center py-3 ${
                  index < accountSummary.length - 1
                    ? 'border-b border-gray-200 dark:border-gray-700'
                    : ''
                }`}
              >
                <View className="h-9 w-9 rounded-full bg-gray-100 dark:bg-surface-alt-dark flex-center mr-3">
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={18}
                    color="#DC143C"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-600 dark:text-gray-400">
                    {item.label}
                  </Text>
                  <Text className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                    {item.value}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Recent Transactions */}
        <View className="px-4 mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm font-semibold text-gray-900 dark:text-white">
              Recent Transactions
            </Text>
            <Text
              className="text-xs font-semibold text-hbl-red active:opacity-70"
              onPress={() => router.push('/(transactions)/history')}
            >
              View All
            </Text>
          </View>

          <Card>
            {[1, 2, 3].map((item) => (
              <View
                key={item}
                className={`flex-row items-center py-3 ${
                  item < 3 ? 'border-b border-gray-200 dark:border-gray-700' : ''
                }`}
              >
                <View className="h-9 w-9 rounded-full bg-info flex-center mr-3">
                  <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                    Transfer to Account
                  </Text>
                  <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Today at 2:30 PM
                  </Text>
                </View>
                <Text className="text-sm font-semibold text-error">-PKR 5,000</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
