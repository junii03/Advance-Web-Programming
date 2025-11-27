/**
 * Card Service
 * Handles all card-related API calls
 */

import { api } from '../lib/apiClient';
import {
  ApiCard,
  GetCardsResponse,
  GetCardResponse,
  RequestCardRequest,
  RequestCardResponse,
  BlockCardRequest,
  BlockCardResponse,
  UpdateCardLimitRequest,
  UpdateCardLimitResponse,
} from '../types/api';

class CardService {
  /**
   * Get all cards for the authenticated user
   * GET /api/cards
   */
  async getCards(): Promise<ApiCard[]> {
    const response = await api.get<GetCardsResponse>('/cards');
    return response.data;
  }

  /**
   * Get a single card by ID
   * GET /api/cards/:id
   */
  async getCard(cardId: string): Promise<ApiCard> {
    const response = await api.get<GetCardResponse>(`/cards/${cardId}`);
    return response.data;
  }

  /**
   * Request a new card
   * POST /api/cards
   */
  async requestCard(data: RequestCardRequest): Promise<ApiCard> {
    const response = await api.post<RequestCardResponse>('/cards', data);
    return response.data;
  }

  /**
   * Block a card
   * PUT /api/cards/:id/block
   */
  async blockCard(cardId: string, reason?: string): Promise<ApiCard> {
    const response = await api.put<BlockCardResponse>(`/cards/${cardId}/block`, {
      blocked: true,
      reason,
    } as BlockCardRequest);
    return response.data;
  }

  /**
   * Unblock a card
   * PUT /api/cards/:id/block
   */
  async unblockCard(cardId: string): Promise<ApiCard> {
    const response = await api.put<BlockCardResponse>(`/cards/${cardId}/block`, {
      blocked: false,
    } as BlockCardRequest);
    return response.data;
  }

  /**
   * Update card limits
   * PUT /api/cards/:id/limit
   */
  async updateCardLimits(
    cardId: string,
    limits: UpdateCardLimitRequest
  ): Promise<ApiCard> {
    const response = await api.put<UpdateCardLimitResponse>(
      `/cards/${cardId}/limit`,
      limits
    );
    return response.data;
  }

  /**
   * Get active cards only
   */
  async getActiveCards(): Promise<ApiCard[]> {
    const cards = await this.getCards();
    return cards.filter((card) => card.cardStatus === 'active');
  }

  /**
   * Get cards by type
   */
  async getCardsByType(type: 'debit' | 'credit'): Promise<ApiCard[]> {
    const cards = await this.getCards();
    return cards.filter((card) => card.cardType === type);
  }
}

// Export singleton instance
export const cardService = new CardService();

// Export class for testing
export { CardService };
