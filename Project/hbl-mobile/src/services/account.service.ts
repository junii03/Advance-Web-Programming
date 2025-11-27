/**
 * Account Service
 * Handles all account-related API calls
 */

import { api } from '../lib/apiClient';
import {
  ApiAccount,
  GetAccountsResponse,
  GetAccountResponse,
  CreateAccountRequest,
  CreateAccountResponse,
} from '../types/api';

class AccountService {
  /**
   * Get all accounts for the authenticated user
   * GET /api/accounts
   */
  async getAccounts(): Promise<ApiAccount[]> {
    const response = await api.get<GetAccountsResponse>('/accounts');
    return response.data;
  }

  /**
   * Get a single account by ID
   * GET /api/accounts/:id
   */
  async getAccount(accountId: string): Promise<ApiAccount> {
    const response = await api.get<GetAccountResponse>(`/accounts/${accountId}`);
    return response.data;
  }

  /**
   * Get account balance
   * GET /api/accounts/:id (returns balance in account data)
   */
  async getAccountBalance(accountId: string): Promise<{
    balance: number;
    availableBalance: number;
  }> {
    const account = await this.getAccount(accountId);
    return {
      balance: account.balance,
      availableBalance: account.availableBalance,
    };
  }

  /**
   * Create a new account
   * POST /api/accounts
   */
  async createAccount(data: CreateAccountRequest): Promise<ApiAccount> {
    const response = await api.post<CreateAccountResponse>('/accounts', data);
    return response.data;
  }

  /**
   * Get total balance across all accounts
   */
  async getTotalBalance(): Promise<{
    totalBalance: number;
    totalAvailableBalance: number;
    accountCount: number;
  }> {
    const accounts = await this.getAccounts();

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalAvailableBalance = accounts.reduce(
      (sum, acc) => sum + acc.availableBalance,
      0
    );

    return {
      totalBalance,
      totalAvailableBalance,
      accountCount: accounts.length,
    };
  }

  /**
   * Get primary account (first active account)
   */
  async getPrimaryAccount(): Promise<ApiAccount | null> {
    const accounts = await this.getAccounts();
    return accounts.find((acc) => acc.status === 'active') || accounts[0] || null;
  }
}

// Export singleton instance
export const accountService = new AccountService();

// Export class for testing
export { AccountService };
