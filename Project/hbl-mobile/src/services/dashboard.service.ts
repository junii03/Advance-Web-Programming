/**
 * Dashboard Service
 * Handles dashboard-related API calls including analytics and summaries
 */

import { api } from '../lib/apiClient';
import { normalizeDashboardResponse } from '../lib/mappers';
import { ApiAccount, ApiTransaction, ApiCard, ApiLoan, ProfilePicture } from '../types/api';

// Dashboard data types
export interface DashboardData {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profilePicture?: ProfilePicture | string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
  };
  accounts: ApiAccount[];
  cards: ApiCard[];
  loans: ApiLoan[];
  recentTransactions: ApiTransaction[];
  summary: {
    totalBalance: number;
    totalAvailableBalance: number;
    accountCount: number;
    activeCards: number;
    pendingLoans: number;
    activeLoans: number;
  };
}

export interface Analytics {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  monthlyData: {
    month: string;
    income: number;
    expenses: number;
  }[];
}

export interface AccountsSummary {
  totalBalance: number;
  totalAvailableBalance: number;
  accountCount: number;
  accounts: {
    id: string;
    type: string;
    balance: number;
    availableBalance: number;
  }[];
}

export interface Beneficiary {
  _id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  accountTitle: string;
  isFavorite: boolean;
}

export interface AccountLookupResult {
  accountNumber: string;
  accountTitle: string;
  bankName: string;
  isValid: boolean;
}

class DashboardService {
  /**
   * Get full dashboard data
   * GET /api/users/dashboard
   * 
   * Handles both response formats and normalizes data structure
   * Maps backend card format to ApiCard format with defaults
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await api.get<any>('/users/dashboard');
      
      // Normalize the response - handles different response structures
      const normalized = normalizeDashboardResponse(response);
      
      return {
        user: normalized.user,
        accounts: normalized.accounts,
        cards: normalized.cards,
        loans: normalized.loans,
        recentTransactions: normalized.recentTransactions,
        summary: normalized.summary,
      };
    } catch (error) {
      console.error('Dashboard API error:', error);
      throw error;
    }
  }

  /**
   * Get analytics data
   * GET /api/users/analytics
   */
  async getAnalytics(period = '6months'): Promise<Analytics> {
    const response = await api.get<{ success: boolean; data: Analytics }>(
      '/users/analytics',
      { period }
    );
    return response.data;
  }

  /**
   * Get accounts summary
   * GET /api/users/accounts-summary
   */
  async getAccountsSummary(): Promise<AccountsSummary> {
    const response = await api.get<{ success: boolean; data: AccountsSummary }>(
      '/users/accounts-summary'
    );
    return response.data;
  }

  /**
   * Get beneficiaries
   * GET /api/users/beneficiaries
   */
  async getBeneficiaries(): Promise<Beneficiary[]> {
    const response = await api.get<{ success: boolean; data: Beneficiary[] }>(
      '/users/beneficiaries'
    );
    return response.data;
  }

  /**
   * Lookup account by account number
   * GET /api/accounts/lookup/:accountNumber
   */
  async lookupAccount(accountNumber: string): Promise<AccountLookupResult> {
    const response = await api.get<{ success: boolean; data: AccountLookupResult }>(
      `/accounts/lookup/${accountNumber}`
    );
    return response.data;
  }

  /**
   * Get user profile
   * GET /api/users/profile
   */
  async getUserProfile(): Promise<DashboardData['user']> {
    const response = await api.get<{ success: boolean; data: DashboardData['user'] }>(
      '/users/profile'
    );
    return response.data;
  }

  /**
   * Get branches
   * GET /api/branches
   */
  async getBranches(): Promise<
    {
      _id: string;
      branchCode: string;
      name: string;
      city: string;
      address: string;
    }[]
  > {
    const response = await api.get<{
      success: boolean;
      data: {
        _id: string;
        branchCode: string;
        name: string;
        city: string;
        address: string;
      }[];
    }>('/branches');
    return response.data;
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();

// Export class for testing
export { DashboardService };
