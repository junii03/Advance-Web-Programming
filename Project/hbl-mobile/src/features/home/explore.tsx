import { Card } from '@/src/components/ui/card';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function ExploreScreen() {
  const services = [
    {
      id: 1,
      title: 'Investment Options',
      description: 'Explore mutual funds and investment plans',
      icon: 'trending-up',
      color: 'bg-success',
    },
    {
      id: 2,
      title: 'Insurance Products',
      description: 'Life, health, and property insurance plans',
      icon: 'shield-checkmark',
      color: 'bg-warning',
    },
    {
      id: 3,
      title: 'Loan Products',
      description: 'Personal, auto, and home loan options',
      icon: 'file-document',
      color: 'bg-info',
    },
    {
      id: 4,
      title: 'Credit Cards',
      description: 'Various credit card offers and benefits',
      icon: 'credit-card',
      color: 'bg-hbl-red',
    },
    {
      id: 5,
      title: 'Savings Accounts',
      description: 'High-yield savings and deposit options',
      icon: 'piggy-bank',
      color: 'bg-error',
    },
    {
      id: 6,
      title: 'Forex Services',
      description: 'Currency exchange and international transfers',
      icon: 'globe',
      color: 'bg-hbl-red',
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
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-hbl-red px-4 py-5 pb-6">
          <Text className="text-2xl font-bold text-white mb-2">Explore Services</Text>
          <Text className="text-sm text-white/80">
            Discover financial solutions tailored for you
          </Text>
        </View>

        <View className="p-4">
          {/* Featured Offers */}
          <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Featured Offers
          </Text>
          {featuredOffers.map((offer) => (
            <Pressable key={offer.id} className="mb-3">
              <Card className="flex-row items-center">
                <View className="h-12 w-12 rounded-lg bg-info flex-center mr-3">
                  <MaterialCommunityIcons name="star" size={24} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                      {offer.title}
                    </Text>
                    <Text className="text-xs font-semibold text-warning bg-warning/20 px-2 py-0.5 rounded">
                      {offer.badge}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {offer.subtitle}
                  </Text>
                </View>
              </Card>
            </Pressable>
          ))}

          {/* Services Grid */}
          <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3 mt-6">
            Our Services
          </Text>
          <View className="gap-3">
            {services.map((service) => {
              // Map color classes to icon colors
              const colorMap: { [key: string]: string } = {
                'bg-success': '#10b981',
                'bg-warning': '#f59e0b',
                'bg-info': '#0ea5e9',
                'bg-hbl-red': '#DC143C',
                'bg-error': '#ef4444',
              };
              const iconColor = colorMap[service.color] || '#DC143C';

              return (
                <Pressable key={service.id}>
                  <Card className="flex-row items-center px-3 py-3.5">
                    <View className={`h-11 w-11 rounded-full ${service.color}/20 flex-center mr-3`}>
                      <MaterialCommunityIcons
                        name={service.icon as any}
                        size={20}
                        color={iconColor}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                        {service.title}
                      </Text>
                      <Text className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {service.description}
                      </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                  </Card>
                </Pressable>
              );
            })}
          </View>

          {/* Info Section */}
          <View className="bg-hbl-red/15 rounded-lg p-4 mt-6 mb-6 border-l-4 border-hbl-red">
            <View className="flex-row items-start">
              <MaterialCommunityIcons name="information" size={20} color="#DC143C" className="mr-3" />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Need Help?
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400 leading-[18px]">
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
