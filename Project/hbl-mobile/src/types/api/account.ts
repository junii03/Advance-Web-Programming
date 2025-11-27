/**
 * Account API Types
 * Based on backend /api/accounts endpoints
 */

// ============================================
// Account Types
// ============================================

/**
 * Account type enum
 */
export type AccountType =
  | 'savings'
  | 'current'
  | 'fixed_deposit'
  | 'islamic_savings'
  | 'salary';

/**
 * Account status enum
 */
export type AccountStatus = 'active' | 'inactive' | 'frozen' | 'closed';

/**
 * Account object from API
 */
export interface ApiAccount {
  _id: string;
  accountNumber: string;
  iban: string;
  userId: string;
  accountType: AccountType;
  accountTitle: string;
  balance: number;
  availableBalance: number;
  currency: string;
  dailyTransactionLimit: number;
  monthlyTransactionLimit: number;
  minimumBalance: number;
  status: AccountStatus;
  isJointAccount: boolean;
  jointHolders: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Request Types
// ============================================

/**
 * Create account request
 * POST /api/accounts
 */
export interface CreateAccountRequest {
  accountType: AccountType;
  accountTitle: string;
  currency?: string;
}

// ============================================
// Response Types
// ============================================

/**
 * Get accounts list response
 * GET /api/accounts
 */
export interface GetAccountsResponse {
  success: boolean;
  count: number;
  data: ApiAccount[];
}

/**
 * Get single account response
 * GET /api/accounts/:id
 */
export interface GetAccountResponse {
  success: boolean;
  data: ApiAccount;
}

/**
 * Create account response
 * POST /api/accounts
 */
export interface CreateAccountResponse {
  success: boolean;
  data: ApiAccount;
}
