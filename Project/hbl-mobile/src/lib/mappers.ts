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
 */
export const normalizeDashboardResponse = (response: any): any => {
  // Handle wrapped response format { success: true, data: {...} }
  if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    response = response.data;
  }

  // Ensure response has expected structure
  const normalized: any = {
    user: response.user || {},
    accounts: response.accounts || [],
    cards: [],
    transactions: response.transactions || [],
    loans: response.loans || [],
  };

  // Transform cards if present
  if (response.cards && Array.isArray(response.cards)) {
    normalized.cards = mapBackendCardsToApiCards(response.cards);
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
