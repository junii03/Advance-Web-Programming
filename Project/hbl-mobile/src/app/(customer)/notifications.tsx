import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

// Notification type
interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'transaction' | 'account' | 'card' | 'loan' | 'security' | 'promo' | 'system';
  isRead: boolean;
  createdAt: string;
  data?: {
    transactionId?: string;
    accountId?: string;
    cardId?: string;
    loanId?: string;
  };
}

// Get icon based on notification type
const getNotificationIcon = (type: Notification['type']): { name: keyof typeof Ionicons.glyphMap; color: string; bg: string } => {
  switch (type) {
    case 'transaction':
      return { name: 'swap-horizontal', color: '#3B82F6', bg: 'bg-blue-100' };
    case 'account':
      return { name: 'wallet', color: '#10B981', bg: 'bg-green-100' };
    case 'card':
      return { name: 'card', color: '#8B5CF6', bg: 'bg-purple-100' };
    case 'loan':
      return { name: 'cash', color: '#F59E0B', bg: 'bg-amber-100' };
    case 'security':
      return { name: 'shield-checkmark', color: '#EF4444', bg: 'bg-red-100' };
    case 'promo':
      return { name: 'gift', color: '#EC4899', bg: 'bg-pink-100' };
    case 'system':
    default:
      return { name: 'information-circle', color: '#6B7280', bg: 'bg-gray-100' };
  }
};

// Format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-PK', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

// Mock notifications data (since backend might not have notifications endpoint)
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    _id: '1',
    title: 'Money Received',
    message: 'You received PKR 50,000 from AHMED RAZA via bank transfer.',
    type: 'transaction',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    data: { transactionId: 'txn1' },
  },
  {
    _id: '2',
    title: 'Bill Payment Successful',
    message: 'Your electricity bill of PKR 5,230 has been paid successfully.',
    type: 'transaction',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    data: { transactionId: 'txn2' },
  },
  {
    _id: '3',
    title: 'Card Activated',
    message: 'Your new debit card ending with 4589 has been activated.',
    type: 'card',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    data: { cardId: 'card1' },
  },
  {
    _id: '4',
    title: 'Loan Application Update',
    message: 'Your personal loan application is under review. We will update you soon.',
    type: 'loan',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    data: { loanId: 'loan1' },
  },
  {
    _id: '5',
    title: 'Security Alert',
    message: 'A new device was used to access your account. If this was not you, please contact us.',
    type: 'security',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    _id: '6',
    title: 'Special Offer',
    message: 'Get 10% cashback on all online shopping with your HBL credit card. Valid till Dec 31.',
    type: 'promo',
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    _id: '7',
    title: 'Account Statement Ready',
    message: 'Your November 2024 account statement is ready for download.',
    type: 'account',
    isRead: true,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    data: { accountId: 'acc1' },
  },
  {
    _id: '8',
    title: 'System Maintenance',
    message: 'HBL Mobile Banking will be under maintenance on Dec 1st from 2:00 AM to 4:00 AM.',
    type: 'system',
    isRead: true,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      // In real app, call notificationService.getNotifications()
      // For now, using mock data
      await new Promise((resolve) => setTimeout(resolve, 500));
      setNotifications(MOCK_NOTIFICATIONS);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification._id);

    // Navigate based on notification type
    if (notification.type === 'transaction' && notification.data?.transactionId) {
      router.push('/(customer)/transactions' as never);
    } else if (notification.type === 'loan' && notification.data?.loanId) {
      router.push('/(customer)/loans' as never);
    } else if (notification.type === 'card' && notification.data?.cardId) {
      router.push('/(tabs)/cards' as never);
    } else if (notification.type === 'account' && notification.data?.accountId) {
      router.push('/(tabs)/accounts' as never);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#006747" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <View>
            <Text className="text-xl font-bold text-gray-900 dark:text-white">Notifications</Text>
            {unreadCount > 0 && (
              <Text className="text-sm text-gray-500">{unreadCount} unread</Text>
            )}
          </View>
        </View>
        {unreadCount > 0 && (
          <Pressable onPress={markAllAsRead}>
            <Text className="text-hbl-green font-medium">Mark all read</Text>
          </Pressable>
        )}
      </View>

      {notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
            <Ionicons name="notifications-off" size={40} color="#9CA3AF" />
          </View>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Notifications
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center">
            You&apos;re all caught up! We&apos;ll notify you when there&apos;s something new.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#006747" />
          }
        >
          {/* Group by date */}
          {(() => {
            const today: Notification[] = [];
            const yesterday: Notification[] = [];
            const earlier: Notification[] = [];

            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const yesterdayStart = new Date(todayStart.getTime() - 86400000);

            notifications.forEach((n) => {
              const nDate = new Date(n.createdAt);
              if (nDate >= todayStart) {
                today.push(n);
              } else if (nDate >= yesterdayStart) {
                yesterday.push(n);
              } else {
                earlier.push(n);
              }
            });

            return (
              <>
                {today.length > 0 && (
                  <View>
                    <Text className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-background-dark">
                      Today
                    </Text>
                    {today.map((notification) => {
                      const icon = getNotificationIcon(notification.type);
                      return (
                        <Pressable
                          key={notification._id}
                          onPress={() => handleNotificationPress(notification)}
                          className={`px-4 py-4 border-b border-gray-100 dark:border-gray-800 ${
                            !notification.isRead ? 'bg-hbl-green/5' : 'bg-white dark:bg-surface-dark'
                          } active:opacity-80`}
                        >
                          <View className="flex-row">
                            <View
                              className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${icon.bg}`}
                            >
                              <Ionicons name={icon.name} size={20} color={icon.color} />
                            </View>
                            <View className="flex-1">
                              <View className="flex-row items-center justify-between mb-1">
                                <Text
                                  className={`font-semibold ${
                                    !notification.isRead
                                      ? 'text-gray-900 dark:text-white'
                                      : 'text-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  {notification.title}
                                </Text>
                                {!notification.isRead && (
                                  <View className="w-2 h-2 rounded-full bg-hbl-green" />
                                )}
                              </View>
                              <Text className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                                {notification.message}
                              </Text>
                              <Text className="text-xs text-gray-400">
                                {formatRelativeTime(notification.createdAt)}
                              </Text>
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                )}

                {yesterday.length > 0 && (
                  <View>
                    <Text className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-background-dark">
                      Yesterday
                    </Text>
                    {yesterday.map((notification) => {
                      const icon = getNotificationIcon(notification.type);
                      return (
                        <Pressable
                          key={notification._id}
                          onPress={() => handleNotificationPress(notification)}
                          className={`px-4 py-4 border-b border-gray-100 dark:border-gray-800 ${
                            !notification.isRead ? 'bg-hbl-green/5' : 'bg-white dark:bg-surface-dark'
                          } active:opacity-80`}
                        >
                          <View className="flex-row">
                            <View
                              className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${icon.bg}`}
                            >
                              <Ionicons name={icon.name} size={20} color={icon.color} />
                            </View>
                            <View className="flex-1">
                              <View className="flex-row items-center justify-between mb-1">
                                <Text
                                  className={`font-semibold ${
                                    !notification.isRead
                                      ? 'text-gray-900 dark:text-white'
                                      : 'text-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  {notification.title}
                                </Text>
                                {!notification.isRead && (
                                  <View className="w-2 h-2 rounded-full bg-hbl-green" />
                                )}
                              </View>
                              <Text className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                                {notification.message}
                              </Text>
                              <Text className="text-xs text-gray-400">
                                {formatRelativeTime(notification.createdAt)}
                              </Text>
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                )}

                {earlier.length > 0 && (
                  <View>
                    <Text className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-background-dark">
                      Earlier
                    </Text>
                    {earlier.map((notification) => {
                      const icon = getNotificationIcon(notification.type);
                      return (
                        <Pressable
                          key={notification._id}
                          onPress={() => handleNotificationPress(notification)}
                          className={`px-4 py-4 border-b border-gray-100 dark:border-gray-800 ${
                            !notification.isRead ? 'bg-hbl-green/5' : 'bg-white dark:bg-surface-dark'
                          } active:opacity-80`}
                        >
                          <View className="flex-row">
                            <View
                              className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${icon.bg}`}
                            >
                              <Ionicons name={icon.name} size={20} color={icon.color} />
                            </View>
                            <View className="flex-1">
                              <View className="flex-row items-center justify-between mb-1">
                                <Text
                                  className={`font-semibold ${
                                    !notification.isRead
                                      ? 'text-gray-900 dark:text-white'
                                      : 'text-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  {notification.title}
                                </Text>
                                {!notification.isRead && (
                                  <View className="w-2 h-2 rounded-full bg-hbl-green" />
                                )}
                              </View>
                              <Text className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                                {notification.message}
                              </Text>
                              <Text className="text-xs text-gray-400">
                                {formatRelativeTime(notification.createdAt)}
                              </Text>
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </>
            );
          })()}

          <View className="h-6" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
