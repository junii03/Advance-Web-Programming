/**
 * Card Service
 * Handles all card-related API calls
 * 
 * NOTE: Backend limitations:
 * - GET /api/cards/:id doesn't exist (use getCards() and filter instead)
 * - PUT /api/cards/:id/block doesn't exist (use blockCard() with /status endpoint)
 * - PUT /api/cards/:id/limit doesn't exist (feature coming in backend)
 */

import { api } from '../lib/apiClient';
import { mapBackendCardsToApiCards } from '../lib/mappers';
import {
  ApiCard,
  GetCardsResponse,
  RequestCardRequest,
  RequestCardResponse,
} from '../types/api';

class CardService {
  /**
   * Get all cards for the authenticated user
   * GET /api/cards
   */
  async getCards(): Promise<ApiCard[]> {
    const response = await api.get<any>('/cards');
    
    // Transform backend cards to ApiCard format
    const backendCards = response.data || [];
    return mapBackendCardsToApiCards(backendCards);
  }

  /**
   * Get a single card by ID
   * 
   * NOTE: Backend doesn't have GET /api/cards/:id endpoint
   * This method now fetches all cards and filters locally
   * 
   * @deprecated - Use getCards() and filter manually for better performance
   */
  async getCard(cardId: string): Promise<ApiCard> {
    // Get all cards
    const cards = await this.getCards();
    
    // Find the card with matching ID
    const card = cards.find(c => c._id === cardId || c._id.includes(cardId));
    
    if (!card) {
      throw new Error(`Card with ID ${cardId} not found`);
    }
    
    return card;
  }

  /**
   * Request a new card
   * POST /api/cards
   */
  async requestCard(data: RequestCardRequest): Promise<ApiCard> {
    const response = await api.post<any>('/cards', data);
    const backendCards = Array.isArray(response.data) ? response.data : [response.data];
    const apiCards = mapBackendCardsToApiCards(backendCards);
    return apiCards[0];
  }

  /**
   * Block a card
   * PUT /api/cards/:id/status
   * 
   * NOTE: Backend uses /status endpoint, not /block
   */
  async blockCard(cardId: string, reason?: string): Promise<ApiCard> {
    const response = await api.put<any>(`/cards/${cardId}/status`, {
      status: 'blocked',
      reason,
    });
    
    const backendCards = Array.isArray(response.data) ? response.data : [response.data];
    const apiCards = mapBackendCardsToApiCards(backendCards);
    return apiCards[0];
  }

  /**
   * Unblock a card
   * PUT /api/cards/:id/status
   * 
   * NOTE: Backend uses /status endpoint, not /block
   */
  async unblockCard(cardId: string): Promise<ApiCard> {
    const response = await api.put<any>(`/cards/${cardId}/status`, {
      status: 'active',
    });
    
    const backendCards = Array.isArray(response.data) ? response.data : [response.data];
    const apiCards = mapBackendCardsToApiCards(backendCards);
    return apiCards[0];
  }

  /**
   * Update card limits
   * 
   * NOTE: Backend doesn't have PUT /api/cards/:id/limit endpoint yet
   * This method is stubbed for future use
   * 
   * @throws Not implemented - feature coming in backend
   */
  async updateCardLimits(
    cardId: string,
    limits: {
      cardLimit?: number;
      dailyLimit?: number;
      monthlyLimit?: number;
    }
  ): Promise<ApiCard> {
    throw new Error(
      'Update card limits feature is not yet available on the backend. ' +
      'Please contact support or try again later.'
    );
    
    // Future implementation:
    // const response = await api.put<any>(
    //   `/cards/${cardId}/limit`,
    //   limits
    // );
    // const backendCards = Array.isArray(response.data) ? response.data : [response.data];
    // const apiCards = mapBackendCardsToApiCards(backendCards);
    // return apiCards[0];
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

  /**
   * Get card transactions
   * GET /api/cards/:id/transactions
   */
  async getCardTransactions(cardId: string, limit = 20, page = 1): Promise<any[]> {
    const response = await api.get<any>(`/cards/${cardId}/transactions`, {
      limit,
      page,
    });
    return response.data || [];
  }
}

// Export singleton instance
export const cardService = new CardService();

// Export class for testing
export { CardService };
