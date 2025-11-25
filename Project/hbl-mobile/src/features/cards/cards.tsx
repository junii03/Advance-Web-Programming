import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { Card } from '@/src/components/ui/card';
import { Header } from '@/src/components/ui/header';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/use-color-scheme';

interface BankCard {
  id: string;
  lastFour: string;
  holderName: string;
  expiryDate: string;
  type: 'credit' | 'debit';
  status: 'active' | 'blocked' | 'expired';
  balance?: string;
}

export default function CardsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const cards: BankCard[] = [
    {
      id: '1',
      lastFour: '8090',
      holderName: 'Muhammad Junaid',
      expiryDate: '06/27',
      type: 'credit',
      status: 'active',
      balance: 'PKR 25,000',
    },
    {
      id: '2',
      lastFour: '9896',
      holderName: 'Muhammad Junaid',
      expiryDate: '06/27',
      type: 'debit',
      status: 'active',
      balance: 'PKR 50,000',
    },
    {
      id: '3',
      lastFour: '1234',
      holderName: 'Ahmed Ali',
      expiryDate: '06/27',
      type: 'credit',
      status: 'active',
      balance: 'PKR 100,000',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'blocked':
        return colors.error;
      case 'expired':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="My Cards"
        onBackPress={() => router.back()}
        rightAction={{
          icon: 'plus',
          onPress: () => {},
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 16 }}>
        <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 16 }}>
          Manage and monitor all your cards
        </Text>

        {cards.map((card, index) => (
          <Card key={card.id} style={{ marginBottom: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                {/* Card Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialCommunityIcons
                      name="credit-card"
                      size={20}
                      color={card.type === 'credit' ? colors.primary : colors.info}
                    />
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, textTransform: 'capitalize' }}>
                      {card.type} Card
                    </Text>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                      backgroundColor: `${getStatusColor(card.status)}20`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '600',
                        color: getStatusColor(card.status),
                        textTransform: 'capitalize',
                      }}
                    >
                      {card.status}
                    </Text>
                  </View>
                </View>

                {/* Card Number */}
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2 }}>
                    Card Number
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                    4532 •••• •••• {card.lastFour}
                  </Text>
                </View>

                {/* Card Holder & Expiry */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 2 }}>
                      Cardholder
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>
                      {card.holderName}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 2 }}>
                      Expires
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>
                      {card.expiryDate}
                    </Text>
                  </View>
                </View>

                {/* Balance */}
                {card.balance && (
                  <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 2 }}>
                      Available Balance
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>
                      {card.balance}
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Menu */}
              <Pressable style={{ marginLeft: 12 }}>
                <MaterialCommunityIcons name="dots-vertical" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </Card>
        ))}

        {/* Card Services */}
        <View style={{ marginTop: 24, marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Card Services
          </Text>

          <Card style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            {[
              { icon: 'lock', label: 'Block Card', color: colors.error },
              { icon: 'reload', label: 'Replace Card', color: colors.warning },
              { icon: 'cog', label: 'Card Settings', color: colors.info },
            ].map((service, index) => (
              <Pressable
                key={service.label}
                onPress={() => {}}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: index < 2 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: `${service.color}20`,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <MaterialCommunityIcons name={service.icon as any} size={18} color={service.color} />
                </View>
                <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: colors.text }}>
                  {service.label}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
              </Pressable>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
