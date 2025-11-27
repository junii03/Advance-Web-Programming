/**
 * Transaction API Types
 * Based on backend /api/transactions endpoints
 */

// ============================================
// Transaction Types
// ============================================

/**
 * Transaction type enum
 */
export type TransactionType =
  | 'transfer'
  | 'deposit'
  | 'withdrawal'
  | 'payment'
  | 'fee'
  | 'interest'
  | 'reversal'
  | 'adjustment';

/**
 * Transaction status enum
 */
export type TransactionStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'reversed';

/**
 * Transaction channel enum
 */
export type TransactionChannel =
  | 'mobile'
  | 'web'
  | 'atm'
  | 'branch'
  | 'pos'
  | 'other';

/**
 * Transaction object from API
 */
export interface ApiTransaction {
  _id: string;
  transactionId: string;
  referenceNumber: string;
  type: TransactionType;
  subType?: string;
  fromAccount: string | {
    _id: string;
    accountNumber: string;
    accountTitle: string;
  };
  toAccount?: string | {
    _id: string;
    accountNumber: string;
    accountTitle: string;
  };
  amount: number;
  currency: string;
  description: string;
  status: TransactionStatus;
  channel: TransactionChannel;
  fee?: number;
  balanceAfter?: number;
  thirdParty?: {
    name: string;
    bank?: string;
    accountNumber?: string;
  };
  billPayment?: {
    billerName: string;
    consumerNumber: string;
    billType: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Request Types
// ============================================

/**
 * Create transaction request
 * POST /api/transactions
 */
export interface CreateTransactionRequest {
  type: TransactionType;
  fromAccountId: string;
  toAccountId?: string;
  amount: number;
  description: string;
  channel?: TransactionChannel;
  // For external transfers
  thirdParty?: {
    name: string;
    bank?: string;
    accountNumber?: string;
  };
  // For bill payments
  billPayment?: {
    billerName: string;
    consumerNumber: string;
    billType: string;
  };
}

/**
 * Get transactions query params
 * GET /api/transactions
 */
export interface GetTransactionsParams {
  page?: number;
  limit?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  fromDate?: string;
  toDate?: string;
  accountId?: string;
  sort?: string;
}

// ============================================
// Response Types
// ============================================

/**
 * Get transactions list response
 * GET /api/transactions
 */
export interface GetTransactionsResponse {
  success: boolean;
  count: number;
  data: ApiTransaction[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Get single transaction response
 * GET /api/transactions/:id
 */
export interface GetTransactionResponse {
  success: boolean;
  data: ApiTransaction;
}

/**
 * Create transaction response
 * POST /api/transactions
 */
export interface CreateTransactionResponse {
  success: boolean;
  data: ApiTransaction;
}
