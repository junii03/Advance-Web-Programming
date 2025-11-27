/**
 * Transaction Service
 * Handles all transaction-related API calls
 */

import { api } from '../lib/apiClient';
import {
  ApiTransaction,
  GetTransactionsResponse,
  GetTransactionResponse,
  GetTransactionsParams,
  CreateTransactionRequest,
  CreateTransactionResponse,
} from '../types/api';

class TransactionService {
  /**
   * Get all transactions with optional filters
   * GET /api/transactions
   */
  async getTransactions(params?: GetTransactionsParams): Promise<{
    transactions: ApiTransaction[];
    count: number;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const queryParams: Record<string, unknown> = {};

    if (params) {
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      if (params.type) queryParams.type = params.type;
      if (params.status) queryParams.status = params.status;
      if (params.fromDate) queryParams.fromDate = params.fromDate;
      if (params.toDate) queryParams.toDate = params.toDate;
      if (params.accountId) queryParams.accountId = params.accountId;
      if (params.sort) queryParams.sort = params.sort;
    }

    const response = await api.get<GetTransactionsResponse>(
      '/transactions',
      queryParams
    );

    return {
      transactions: response.data,
      count: response.count,
      pagination: response.pagination,
    };
  }

  /**
   * Get recent transactions (last 10)
   * GET /api/transactions?limit=10&sort=-createdAt
   */
  async getRecentTransactions(limit = 10): Promise<ApiTransaction[]> {
    const result = await this.getTransactions({
      limit,
      sort: '-createdAt',
    });
    return result.transactions;
  }

  /**
   * Get a single transaction by ID
   * GET /api/transactions/:id
   */
  async getTransaction(transactionId: string): Promise<ApiTransaction> {
    const response = await api.get<GetTransactionResponse>(
      `/transactions/${transactionId}`
    );
    return response.data;
  }

  /**
   * Create a new transaction (transfer/payment)
   * POST /api/transactions
   */
  async createTransaction(data: CreateTransactionRequest): Promise<ApiTransaction> {
    const response = await api.post<CreateTransactionResponse>(
      '/transactions',
      data
    );
    return response.data;
  }

  /**
   * Transfer money between own accounts
   */
  async transferBetweenAccounts(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string
  ): Promise<ApiTransaction> {
    return this.createTransaction({
      type: 'transfer',
      fromAccountId,
      toAccountId,
      amount,
      description,
      channel: 'mobile',
    });
  }

  /**
   * Transfer to another person/bank
   */
  async transferToExternal(
    fromAccountId: string,
    amount: number,
    description: string,
    recipient: {
      name: string;
      bank: string;
      accountNumber: string;
    }
  ): Promise<ApiTransaction> {
    return this.createTransaction({
      type: 'transfer',
      fromAccountId,
      amount,
      description,
      channel: 'mobile',
      thirdParty: recipient,
    });
  }

  /**
   * Pay a bill
   */
  async payBill(
    fromAccountId: string,
    amount: number,
    billerName: string,
    consumerNumber: string,
    billType: string
  ): Promise<ApiTransaction> {
    return this.createTransaction({
      type: 'payment',
      fromAccountId,
      amount,
      description: `Bill payment - ${billerName}`,
      channel: 'mobile',
      billPayment: {
        billerName,
        consumerNumber,
        billType,
      },
    });
  }

  /**
   * Get transactions for a specific account
   */
  async getAccountTransactions(
    accountId: string,
    params?: Omit<GetTransactionsParams, 'accountId'>
  ): Promise<ApiTransaction[]> {
    const result = await this.getTransactions({
      ...params,
      accountId,
    });
    return result.transactions;
  }

  /**
   * Get transactions within a date range
   */
  async getTransactionsByDateRange(
    fromDate: string,
    toDate: string,
    params?: Omit<GetTransactionsParams, 'fromDate' | 'toDate'>
  ): Promise<ApiTransaction[]> {
    const result = await this.getTransactions({
      ...params,
      fromDate,
      toDate,
    });
    return result.transactions;
  }
}

// Export singleton instance
export const transactionService = new TransactionService();

// Export class for testing
export { TransactionService };
