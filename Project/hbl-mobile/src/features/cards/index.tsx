import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { cardService } from '@/src/services';
import { ApiCard } from '@/src/types/api';

// Format currency in PKR
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format card number (mask middle digits)
const formatCardNumber = (cardNumber: string, showFull: boolean): string => {
  if (showFull) return cardNumber.replace(/(.{4})/g, '$1 ').trim();
  const last4 = cardNumber.slice(-4);
  return `•••• •••• •••• ${last4}`;
};

// Format expiry date
const formatExpiryDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' });
};

// Get card gradient colors
const getCardGradient = (type: string): [string, string] => {
  switch (type) {
    case 'credit':
      return ['#7C3AED', '#4C1D95'];
    case 'debit':
      return ['#006747', '#004D35'];
    default:
      return ['#6B7280', '#374151'];
  }
};

// Get status style
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'active':
      return { color: '#10B981', icon: 'checkmark-circle' as const };
    case 'blocked':
      return { color: '#EF4444', icon: 'close-circle' as const };
    case 'pending':
      return { color: '#F59E0B', icon: 'time' as const };
    case 'expired':
      return { color: '#6B7280', icon: 'alert-circle' as const };
    default:
      return { color: '#6B7280', icon: 'help-circle' as const };
  }
};

// Card Visual Component
const CardVisual = ({
  card,
  showDetails,
}: {
  card: ApiCard;
  showDetails: boolean;
}) => {
  const gradient = getCardGradient(card.cardType);

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-2xl p-5 h-48"
    >
      {/* Card Header */}
      <View className="flex-row justify-between items-start mb-6">
        <View>
          <Text className="text-xs text-white/70 uppercase">{card.cardType} Card</Text>
          <Text className="text-lg font-bold text-white mt-1">{card.cardName}</Text>
        </View>
        <Ionicons
          name={card.cardType === 'credit' ? 'shield' : 'card'}
          size={32}
          color="rgba(255,255,255,0.8)"
        />
      </View>

      {/* Card Number */}
      <Text className="text-xl font-mono text-white tracking-widest mb-4">
        {formatCardNumber(card.cardNumber, showDetails)}
      </Text>

      {/* Card Footer */}
      <View className="flex-row justify-between items-end">
        <View>
          <Text className="text-xs text-white/70">Card Holder</Text>
          <Text className="text-sm font-medium text-white">
            {showDetails ? card.cardHolderName : '•••• ••••'}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-white/70">Expires</Text>
          <Text className="text-sm font-medium text-white">
            {formatExpiryDate(card.expiryDate)}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-white/70">CVV</Text>
          <Text className="text-sm font-medium text-white">
            {showDetails ? card.cvv : '•••'}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

// Card Item Component
const CardItem = ({
  card,
  showDetails,
  onPress,
}: {
  card: ApiCard;
  showDetails: boolean;
  onPress: () => void;
}) => {
  const statusStyle = getStatusStyle(card.cardStatus);

  return (
    <Pressable onPress={onPress} className="mb-4 active:opacity-90">
      {/* Card Visual */}
      <CardVisual card={card} showDetails={showDetails} />

      {/* Card Info */}
      <View className="bg-white dark:bg-surface-dark rounded-xl p-4 -mt-4 mx-2 shadow-sm">
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <Ionicons name={statusStyle.icon} size={18} color={statusStyle.color} />
            <Text className="text-sm font-medium capitalize ml-1" style={{ color: statusStyle.color }}>
              {card.cardStatus}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </View>
        </View>

        <View className="flex-row justify-between">
          <View>
            <Text className="text-xs text-gray-500 dark:text-gray-400">Daily Limit</Text>
            <Text className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatCurrency(card.dailyLimit)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-gray-500 dark:text-gray-400">Monthly Limit</Text>
            <Text className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatCurrency(card.monthlyLimit)}
            </Text>
          </View>
        </View>

        {card.cardType === 'credit' && (
          <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <View className="flex-row justify-between">
              <View>
                <Text className="text-xs text-gray-500 dark:text-gray-400">Credit Limit</Text>
                <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(card.cardLimit || 0)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-gray-500 dark:text-gray-400">Available</Text>
                <Text className="text-sm font-semibold text-green-600">
                  {formatCurrency(card.availableLimit || 0)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
};

// Summary Stats Component
const CardStats = ({ cards }: { cards: ApiCard[] }) => {
  const stats = {
    total: cards.length,
    active: cards.filter((c) => c.cardStatus === 'active').length,
    credit: cards.filter((c) => c.cardType === 'credit').length,
    debit: cards.filter((c) => c.cardType === 'debit').length,
  };

  return (
    <View className="flex-row gap-3 px-4 mb-4">
      {[
        { label: 'Total', value: stats.total, color: '#3B82F6' },
        { label: 'Active', value: stats.active, color: '#10B981' },
        { label: 'Credit', value: stats.credit, color: '#7C3AED' },
        { label: 'Debit', value: stats.debit, color: '#006747' },
      ].map((stat) => (
        <View
          key={stat.label}
          className="flex-1 bg-white dark:bg-surface-dark rounded-lg p-3 items-center"
        >
          <Text className="text-lg font-bold" style={{ color: stat.color }}>
            {stat.value}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

export default function CardsScreen() {
  const router = useRouter();
  const [cards, setCards] = useState<ApiCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const fetchCards = useCallback(async () => {
    try {
      setError(null);
      const data = await cardService.getCards();
      setCards(data);
    } catch (err) {
      console.error('Failed to fetch cards:', err);
      setError('Failed to load cards. Pull to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCards();
  }, [fetchCards]);

  const filteredCards = cards.filter((card) => {
    if (filter === 'all') return true;
    return card.cardType === filter;
  });

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#006747" />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading cards...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">My Cards</Text>
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => setShowDetails(!showDetails)}>
            <Ionicons
              name={showDetails ? 'eye-outline' : 'eye-off-outline'}
              size={24}
              color="#6B7280"
            />
          </Pressable>
          <Pressable
            onPress={() => router.push('/(customer)/request-card' as never)}
            className="flex-row items-center bg-hbl-green px-3 py-2 rounded-lg"
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text className="text-sm font-medium text-white ml-1">Request</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#006747" />
        }
        ListHeaderComponent={
          <>
            {/* Stats */}
            <View className="pt-4">
              <CardStats cards={cards} />
            </View>

            {/* Filter Tabs */}
            <View className="flex-row px-4 mb-4 gap-2">
              {(['all', 'credit', 'debit'] as const).map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full ${
                    filter === f
                      ? 'bg-hbl-green'
                      : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium capitalize ${
                      filter === f ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {f}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Error Message */}
            {error && (
              <View className="mx-4 mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <Text className="text-red-600 text-sm">{error}</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item: card }) => (
          <View className="px-4">
            <CardItem
              key={card._id}
              card={card}
              showDetails={showDetails}
              onPress={() => {
                // Pass card data as JSON string to optimize - only fetch if not available
                const cardDataJson = JSON.stringify(card);
                router.push({
                  pathname: '/(customer)/card-details' as never,
                  params: {
                    id: card._id,
                    cardData: cardDataJson,
                  },
                });
              }}
            />
          </View>
        )}
        ListEmptyComponent={
          <View className="bg-white dark:bg-surface-dark rounded-xl p-8 items-center mx-4 mt-4">
            <Ionicons name="card-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-900 dark:text-white font-semibold mt-4">
              No Cards Found
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mt-2">
              {filter === 'all'
                ? "You don't have any cards yet. Request a new card to get started."
                : `No ${filter} cards found.`}
            </Text>
            {filter === 'all' && (
              <Pressable
                onPress={() => router.push('/(customer)/request-card' as never)}
                className="mt-4 bg-hbl-green px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold">Request Card</Text>
              </Pressable>
            )}
          </View>
        }
        ListFooterComponent={<View className="h-6" />}
        contentContainerStyle={{ paddingHorizontal: 0 }}
      />
    </SafeAreaView>
  );
}
