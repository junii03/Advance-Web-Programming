/**
 * Data Mapper Module
 * Transforms backend API responses to match mobile app expectations
 * This layer handles differences between backend and mobile data structures
 */

import { ApiCard } from '@/src/types/api';

/**
 * Backend card response structure
 * Represents what the backend actually returns
 */
export interface BackendCard {
  _id: string;
  cardNumber: string;
  cardName: string;
  cardType: 'credit' | 'debit';
  cardStatus: 'active' | 'blocked' | 'pending' | 'expired' | 'cancelled';
  cardHolderName?: string;
  expiryDate: string;
  cvv?: string;
  dailyLimit?: number;
  monthlyLimit?: number;
  cardLimit?: number;
  availableLimit?: number;
  internationalEnabled?: boolean;
  onlineTransactionsEnabled?: boolean;
  accountId?: string;
  userId?: string;
  isContactless?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Maps a single backend card to the ApiCard format used by the mobile app
 * Handles missing fields by providing sensible defaults
 */
export const mapBackendCardToApiCard = (backendCard: BackendCard): ApiCard => {
  // Determine default limits based on card type
  const defaultDailyLimit = backendCard.cardType === 'credit' ? 200000 : 100000;
  const defaultMonthlyLimit = backendCard.cardType === 'credit' ? 1000000 : 500000;
  const defaultCardLimit = backendCard.cardType === 'credit' ? 500000 : 0;

  return {
    _id: backendCard._id || `card-${Date.now()}`,
    userId: backendCard.userId || 'unknown',
    accountId: backendCard.accountId || 'unknown',
    cardNumber: backendCard.cardNumber,
    cardName: backendCard.cardName,
    cardHolderName: backendCard.cardHolderName || 'Card Holder',
    cardType: backendCard.cardType,
    cardStatus: backendCard.cardStatus,
    expiryDate: backendCard.expiryDate || new Date().toISOString(),
    cvv: backendCard.cvv,
    dailyLimit: backendCard.dailyLimit ?? defaultDailyLimit,
    monthlyLimit: backendCard.monthlyLimit ?? defaultMonthlyLimit,
    cardLimit: backendCard.cardLimit ?? defaultCardLimit,
    availableLimit: backendCard.availableLimit ?? (backendCard.cardType === 'credit' ? defaultCardLimit : 0),
    internationalEnabled: backendCard.internationalEnabled ?? true,
    onlineTransactionsEnabled: backendCard.onlineTransactionsEnabled ?? true,
    isContactless: backendCard.isContactless ?? true,
    createdAt: backendCard.createdAt || new Date().toISOString(),
    updatedAt: backendCard.updatedAt || new Date().toISOString(),
  };
};

/**
 * Maps multiple backend cards to ApiCard format
 */
export const mapBackendCardsToApiCards = (backendCards: BackendCard[]): ApiCard[] => {
  return backendCards.map(mapBackendCardToApiCard);
};

/**
 * Normalizes dashboard response to ensure consistent structure
 * Handles both wrapped and unwrapped response formats
 *
 * Backend /api/users/dashboard returns:
 * {
 *   success: true,
 *   data: {
 *     user: { id, fullName, email, customerNumber, profilePicture, ... },
 *     accounts: [...],
 *     totalBalance: number,
 *     recentTransactions: [...],
 *     quickStats: { totalAccounts, activeAccounts, todayTransactions, pendingTransactions },
 *     summary: { totalAccounts, activeAccounts, recentTransactionsCount }
 *   }
 * }
 *
 * Mobile app expects:
 * {
 *   user: { _id, firstName, lastName, email, ... },
 *   accounts: [...],
 *   cards: [...],
 *   loans: [...],
 *   recentTransactions: [...],
 *   summary: { totalBalance, totalAvailableBalance, accountCount, activeCards, pendingLoans, activeLoans }
 * }
 */
export const normalizeDashboardResponse = (response: any): any => {
  // Handle wrapped response format { success: true, data: {...} }
  let data = response;
  if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    data = response.data;
  }

  // Parse user data - backend returns fullName, we need firstName/lastName
  const backendUser = data.user || {};
  const fullName = backendUser.fullName || '';
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Calculate total available balance from accounts
  const accounts = data.accounts || [];
  const totalAvailableBalance = accounts.reduce((sum: number, acc: any) => {
    // Backend may return balance or availableBalance
    return sum + (acc.availableBalance ?? acc.balance ?? 0);
  }, 0);

  // Get account count from quickStats or accounts array
  const accountCount = data.quickStats?.totalAccounts || data.summary?.totalAccounts || accounts.length;

  // Ensure response has expected structure
  const normalized: any = {
    user: {
      _id: backendUser.id || backendUser._id || '',
      firstName,
      lastName,
      email: backendUser.email || '',
      phone: backendUser.phone || '',
      profilePicture: backendUser.profilePicture,
      isEmailVerified: backendUser.isEmailVerified || false,
      isPhoneVerified: backendUser.isPhoneVerified || false,
      customerNumber: backendUser.customerNumber,
      role: backendUser.role,
    },
    accounts: accounts,
    cards: [], // Cards need to be fetched separately via /api/cards
    loans: [], // Loans need to be fetched separately via /api/loans
    recentTransactions: data.recentTransactions || [],
    summary: {
      totalBalance: data.totalBalance || 0,
      totalAvailableBalance: totalAvailableBalance,
      accountCount: accountCount,
      activeCards: 0, // Will be updated when cards are fetched
      pendingLoans: 0, // Will be updated when loans are fetched
      activeLoans: 0, // Will be updated when loans are fetched
    },
  };

  // Transform cards if present (in case dashboard starts returning them)
  if (data.cards && Array.isArray(data.cards)) {
    normalized.cards = mapBackendCardsToApiCards(data.cards);
    normalized.summary.activeCards = normalized.cards.filter((c: any) => c.cardStatus === 'active').length;
  }

  // Handle loans if present
  if (data.loans && Array.isArray(data.loans)) {
    normalized.loans = data.loans;
    normalized.summary.pendingLoans = data.loans.filter((l: any) => l.status === 'pending').length;
    normalized.summary.activeLoans = data.loans.filter((l: any) => l.status === 'active').length;
  }

  return normalized;
};

/**
 * Extracts and transforms cards from any response structure
 * Useful for handling different API response formats
 */
export const extractAndTransformCards = (data: any): ApiCard[] => {
  if (!data) return [];

  // Direct array of cards
  if (Array.isArray(data)) {
    return mapBackendCardsToApiCards(data);
  }

  // Cards nested in data property
  if (Array.isArray(data.data)) {
    return mapBackendCardsToApiCards(data.data);
  }

  // Cards nested in cards property
  if (Array.isArray(data.cards)) {
    return mapBackendCardsToApiCards(data.cards);
  }

  // Single card object
  if (typeof data === 'object' && data._id) {
    return [mapBackendCardToApiCard(data)];
  }

  return [];
};
