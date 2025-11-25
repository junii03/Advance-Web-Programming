import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { Card } from '@/src/components/ui/card';
import { Colors } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/auth';
import { useColorScheme } from '@/src/hooks/use-color-scheme';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const quickActions = [
    { id: 1, label: 'Transfer', icon: 'send', color: colors.info },
    { id: 2, label: 'Pay Bills', icon: 'receipt', color: colors.warning },
    { id: 3, label: 'Cards', icon: 'credit-card', color: colors.primary },
    { id: 4, label: 'Loans', icon: 'file-document', color: colors.success },
  ];

  const accountSummary = [
    { label: 'Total Accounts', value: '3', icon: 'bank' },
    { label: 'Total Balance', value: 'PKR 250,000', icon: 'cash-multiple' },
    { label: 'Pending', value: '1', icon: 'clock-outline' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 20,
            paddingBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <View>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Welcome Back</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginTop: 4 }}>
                {user?.name || 'User'}
              </Text>
            </View>
            <Pressable onPress={() => router.push('/profile')}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <MaterialCommunityIcons name="account-circle" size={24} color="#FFFFFF" />
              </View>
            </Pressable>
          </View>

          {/* Account Balance Card */}
          <Card
            style={{
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderColor: 'rgba(255,255,255,0.2)',
              borderWidth: 1,
            }}
          >
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>
              Total Balance
            </Text>
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#FFFFFF' }}>PKR 250,000</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
              Account • 0910-460815
            </Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Quick Actions</Text>
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            {quickActions.map((action) => (
              <Pressable
                key={action.id}
                onPress={() => {
                  if (action.label === 'Transfer') router.push('/transfer');
                  if (action.label === 'Cards') router.push('/cards');
                }}
                style={{
                  flex: 1,
                  minWidth: '48%',
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  backgroundColor: colors.surface,
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: action.color,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <MaterialCommunityIcons name={action.icon as any} size={20} color="#FFFFFF" />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Account Summary */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Account Summary
          </Text>
          <Card>
            {accountSummary.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: index < accountSummary.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: colors.surfaceAlt,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <MaterialCommunityIcons name={item.icon as any} size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>{item.label}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 2 }}>
                    {item.value}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Recent Transactions */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
              Recent Transactions
            </Text>
            <Text
              style={{ fontSize: 12, fontWeight: '600', color: colors.primary }}
              onPress={() => router.push('/transactions')}
            >
              View All
            </Text>
          </View>

          <Card>
            {[1, 2, 3].map((item) => (
              <View
                key={item}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: item < 3 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: colors.info,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text }}>
                    Transfer to Account
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                    Today at 2:30 PM
                  </Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.error }}>
                  -PKR 5,000
                </Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
