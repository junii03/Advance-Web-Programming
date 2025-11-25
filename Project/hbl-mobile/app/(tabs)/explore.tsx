import { Card } from '@/components/ui/card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const services = [
    {
      id: 1,
      title: 'Investment Options',
      description: 'Explore mutual funds and investment plans',
      icon: 'trending-up',
      color: colors.success,
    },
    {
      id: 2,
      title: 'Insurance Products',
      description: 'Life, health, and property insurance plans',
      icon: 'shield-checkmark',
      color: colors.warning,
    },
    {
      id: 3,
      title: 'Loan Products',
      description: 'Personal, auto, and home loan options',
      icon: 'file-document',
      color: colors.info,
    },
    {
      id: 4,
      title: 'Credit Cards',
      description: 'Various credit card offers and benefits',
      icon: 'credit-card',
      color: colors.primary,
    },
    {
      id: 5,
      title: 'Savings Accounts',
      description: 'High-yield savings and deposit options',
      icon: 'piggy-bank',
      color: colors.error,
    },
    {
      id: 6,
      title: 'Forex Services',
      description: 'Currency exchange and international transfers',
      icon: 'globe',
      color: colors.primary,
    },
  ];

  const featuredOffers = [
    {
      id: 1,
      title: 'Personal Loan Special',
      subtitle: 'Get up to PKR 5 Million at low interest rates',
      badge: 'Limited Time',
    },
    {
      id: 2,
      title: 'Credit Card Cashback',
      subtitle: '2% cashback on all credit card purchases',
      badge: 'Ongoing',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 20,
            paddingBottom: 24,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 }}>
            Explore Services
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
            Discover financial solutions tailored for you
          </Text>
        </View>

        <View style={{ padding: 16 }}>
          {/* Featured Offers */}
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Featured Offers
          </Text>
          {featuredOffers.map((offer) => (
            <Pressable key={offer.id} style={{ marginBottom: 12 }}>
              <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    backgroundColor: colors.info,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <MaterialCommunityIcons name="star" size={24} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                      {offer.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '600',
                        color: colors.warning,
                        backgroundColor: `${colors.warning}20`,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}
                    >
                      {offer.badge}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>
                    {offer.subtitle}
                  </Text>
                </View>
              </Card>
            </Pressable>
          ))}

          {/* Services Grid */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 12,
              marginTop: 24,
            }}
          >
            Our Services
          </Text>
          <View style={{ gap: 12 }}>
            {services.map((service) => (
              <Pressable key={service.id}>
                <Card
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    paddingVertical: 14,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: `${service.color}20`,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}
                  >
                    <MaterialCommunityIcons name={service.icon as any} size={20} color={service.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                      {service.title}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                      {service.description}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                </Card>
              </Pressable>
            ))}
          </View>

          {/* Info Section */}
          <View
            style={{
              backgroundColor: `${colors.primary}15`,
              borderRadius: 12,
              padding: 16,
              marginTop: 24,
              marginBottom: 24,
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <MaterialCommunityIcons name="information" size={20} color={colors.primary} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                  Need Help?
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}>
                  Contact our customer service team for more information about any of our services and special offers.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
