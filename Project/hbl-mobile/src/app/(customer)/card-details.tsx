import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
      return { color: '#10B981', icon: 'checkmark-circle' as const, bg: 'bg-green-100' };
    case 'blocked':
      return { color: '#EF4444', icon: 'close-circle' as const, bg: 'bg-red-100' };
    case 'pending':
      return { color: '#F59E0B', icon: 'time' as const, bg: 'bg-yellow-100' };
    case 'expired':
      return { color: '#6B7280', icon: 'alert-circle' as const, bg: 'bg-gray-100' };
    default:
      return { color: '#6B7280', icon: 'help-circle' as const, bg: 'bg-gray-100' };
  }
};

// Action Item Component
const ActionItem = ({
  icon,
  label,
  onPress,
  destructive = false,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) => {
  const textColor = destructive ? 'text-red-600' : 'text-gray-900 dark:text-white';
  const bgColor = destructive ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800';
  const borderColor = destructive ? 'border-red-200' : 'border-gray-200 dark:border-gray-700';

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center justify-between p-4 ${bgColor} rounded-lg mb-2 border ${borderColor}`}
    >
      <View className="flex-row items-center">
        <MaterialCommunityIcons
          name={icon as any}
          size={24}
          color={destructive ? '#EF4444' : '#6B7280'}
        />
        <Text className={`ml-3 text-base font-medium ${textColor}`}>{label}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
    </Pressable>
  );
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
            {showDetails && card.cvv ? card.cvv : '•••'}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default function CardDetailsScreen() {
  const router = useRouter();
  const { id, cardData: cardDataParam } = useLocalSearchParams<{ id: string; cardData?: string }>();
  const [card, setCard] = useState<ApiCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCard = useCallback(async () => {
    try {
      setError(null);
      
      // First try to use passed card data
      if (cardDataParam) {
        try {
          const parsedCard = JSON.parse(cardDataParam);
          setCard(parsedCard);
          setLoading(false);
          return;
        } catch (parseErr) {
          console.log('Failed to parse card data from params, fetching...');
        }
      }
      
      // Fallback: fetch by ID
      if (id) {
        const data = await cardService.getCard(id);
        setCard(data);
      } else {
        setError('Card information not found. Please go back and try again.');
      }
    } catch (err) {
      console.error('Failed to fetch card:', err);
      setError('Failed to load card details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id, cardDataParam]);

  useEffect(() => {
    fetchCard();
  }, [fetchCard]);

  const handleBlockCard = () => {
    if (!card) return;

    Alert.alert('Block Card', 'Are you sure you want to block this card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(true);
            await cardService.blockCard(card._id, 'User blocked');
            setCard((prev) => (prev ? { ...prev, cardStatus: 'blocked' } : null));
            Alert.alert('Success', 'Card blocked successfully');
          } catch (err) {
            Alert.alert('Error', 'Failed to block card. Please try again.');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleUnblockCard = () => {
    if (!card) return;

    Alert.alert('Unblock Card', 'Are you sure you want to unblock this card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unblock',
        style: 'default',
        onPress: async () => {
          try {
            setActionLoading(true);
            await cardService.unblockCard(card._id);
            setCard((prev) => (prev ? { ...prev, cardStatus: 'active' } : null));
            Alert.alert('Success', 'Card unblocked successfully');
          } catch (err) {
            Alert.alert('Error', 'Failed to unblock card. Please try again.');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#006747" />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading card details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !card) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="chevron-back" size={28} color="#006747" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">Card Details</Text>
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="text-gray-900 dark:text-white font-semibold mt-4 text-center">
            {error || 'Card not found'}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 bg-hbl-green px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusStyle(card.cardStatus);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Ionicons name="chevron-back" size={28} color="#006747" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900 dark:text-white flex-1">
          Card Details
        </Text>
        <Pressable onPress={() => setShowDetails(!showDetails)}>
          <Ionicons
            name={showDetails ? 'eye-outline' : 'eye-off-outline'}
            size={24}
            color="#6B7280"
          />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Card Visual */}
        <View className="px-4 pt-6 pb-4">
          <CardVisual card={card} showDetails={showDetails} />
        </View>

        {/* Card Info */}
        <View className="px-4 pb-4">
          <View className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm">
            {/* Card Name */}
            <View className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">Card Name</Text>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                {card.cardName}
              </Text>
            </View>

            {/* Status */}
            <View className={`mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 flex-row items-center ${statusStyle.bg} px-3 py-2 rounded-lg`}>
              <Ionicons name={statusStyle.icon} size={20} color={statusStyle.color} />
              <Text
                className="ml-2 text-sm font-medium capitalize"
                style={{ color: statusStyle.color }}
              >
                {card.cardStatus}
              </Text>
            </View>

            {/* Limits */}
            <View className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-xs text-gray-500 dark:text-gray-400 mb-3 uppercase font-medium">
                Card Limits
              </Text>
              <View className="flex-row justify-between mb-3">
                <View>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Daily Limit
                  </Text>
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(card.dailyLimit)}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Monthly Limit
                  </Text>
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(card.monthlyLimit)}
                  </Text>
                </View>
              </View>

              {card.cardType === 'credit' && (
                <View className="pt-3">
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Credit Limit
                      </Text>
                      <Text className="text-base font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(card.cardLimit || 0)}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Available Credit
                      </Text>
                      <Text className="text-base font-semibold text-green-600">
                        {formatCurrency(card.availableLimit || 0)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Account */}
            <View className="pb-4 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Associated Account
              </Text>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                {card.accountId || 'Not specified'}
              </Text>
            </View>

            {/* Issued Date */}
            <View>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expiry Date</Text>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                {formatExpiryDate(card.expiryDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="px-4 pb-8">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Quick Actions
          </Text>

          {card.cardStatus === 'active' ? (
            <ActionItem
              icon="lock-outline"
              label="Block Card"
              onPress={handleBlockCard}
              destructive
            />
          ) : card.cardStatus === 'blocked' ? (
            <ActionItem
              icon="lock-open-outline"
              label="Unblock Card"
              onPress={handleUnblockCard}
            />
          ) : null}

          <ActionItem
            icon="pencil-outline"
            label="Change Card Limits"
            onPress={() => Alert.alert('Coming Soon', 'Limit modification feature will be available soon on the backend')}
          />

          <ActionItem
            icon="alert-outline"
            label="Report Card Issue"
            onPress={() =>
              Alert.alert('Coming Soon', 'Card issue reporting feature coming soon')
            }
          />

          <ActionItem
            icon="history"
            label="View Transactions"
            onPress={() =>
              Alert.alert('Coming Soon', 'Card transaction history feature coming soon')
            }
          />
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {actionLoading && (
        <View className="absolute inset-0 bg-black/40 items-center justify-center rounded-lg">
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </SafeAreaView>
  );
}
