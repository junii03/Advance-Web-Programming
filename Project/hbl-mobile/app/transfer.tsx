import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TransferScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
    transferType: 'own-account',
  });

  const handleTransfer = () => {
    alert('Transfer initiated!');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Money Transfer"
        subtitle="Send money instantly"
        onBackPress={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 16 }}>
        <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 16 }}>
          Transfer money between accounts or to other users
        </Text>

        {/* Transfer Type Selection */}
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
          Transfer Type
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          {[
            { id: 'own-account', label: 'Own Account' },
            { id: 'other-account', label: 'Other Account' },
          ].map((type) => (
            <Card
              key={type.id}
              style={{
                flex: 1,
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderWidth: 2,
                borderColor:
                  formData.transferType === type.id ? colors.primary : colors.border,
                backgroundColor:
                  formData.transferType === type.id
                    ? `${colors.primary}10`
                    : colors.surface,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: colors.text,
                  textAlign: 'center',
                }}
              >
                {type.label}
              </Text>
            </Card>
          ))}
        </View>

        {/* Form Fields */}
        <Input
          label="From Account"
          placeholder="Select account"
          value={formData.fromAccount}
          onChangeText={(text) => setFormData({ ...formData, fromAccount: text })}
        />

        <Input
          label="To Account"
          placeholder="Recipient account"
          value={formData.toAccount}
          onChangeText={(text) => setFormData({ ...formData, toAccount: text })}
        />

        <Input
          label="Amount (PKR)"
          placeholder="Enter amount"
          value={formData.amount}
          onChangeText={(text) => setFormData({ ...formData, amount: text })}
          keyboardType="numeric"
        />

        {/* Fee Information */}
        <Card style={{ marginVertical: 20 }}>
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Estimated Fee</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 2 }}>
              Free
            </Text>
          </View>
          <View style={{ paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Total Amount</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary, marginTop: 2 }}>
              PKR {formData.amount || '0'}
            </Text>
          </View>
        </Card>

        <Button
          title="Proceed Transfer"
          onPress={handleTransfer}
          size="lg"
          style={{ marginBottom: 24 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
