/**
 * Card API Types
 * Based on backend /api/cards endpoints
 */

// ============================================
// Card Types
// ============================================

/**
 * Card type enum
 */
export type CardType = 'debit' | 'credit';

/**
 * Card status enum
 */
export type CardStatus = 'active' | 'blocked' | 'pending' | 'expired' | 'cancelled';

/**
 * Card object from API
 */
export interface ApiCard {
  _id: string;
  userId: string;
  accountId: string;
  cardNumber: string; // Masked: 4532-****-****-1234
  cardType: CardType;
  cardName: string;
  cardHolderName: string;
  expiryDate: string;
  cvv?: string; // Usually not returned
  cardStatus: CardStatus;
  isContactless: boolean;
  cardLimit: number;
  availableLimit: number;
  dailyLimit: number;
  monthlyLimit: number;
  internationalEnabled: boolean;
  onlineTransactionsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Request Types
// ============================================

/**
 * Request new card
 * POST /api/cards
 */
export interface RequestCardRequest {
  accountId: string;
  cardType: CardType;
  cardName?: string;
}

/**
 * Block/Unblock card request
 * PUT /api/cards/:id/block
 */
export interface BlockCardRequest {
  blocked: boolean;
  reason?: string;
}

/**
 * Update card limit request
 * PUT /api/cards/:id/limit
 */
export interface UpdateCardLimitRequest {
  cardLimit?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
}

// ============================================
// Response Types
// ============================================

/**
 * Get cards list response
 * GET /api/cards
 */
export interface GetCardsResponse {
  success: boolean;
  count: number;
  data: ApiCard[];
}

/**
 * Get single card response
 * GET /api/cards/:id
 */
export interface GetCardResponse {
  success: boolean;
  data: ApiCard;
}

/**
 * Request card response
 * POST /api/cards
 */
export interface RequestCardResponse {
  success: boolean;
  data: ApiCard;
}

/**
 * Block card response
 * PUT /api/cards/:id/block
 */
export interface BlockCardResponse {
  success: boolean;
  data: ApiCard;
}

/**
 * Update card limit response
 * PUT /api/cards/:id/limit
 */
export interface UpdateCardLimitResponse {
  success: boolean;
  data: ApiCard;
}
