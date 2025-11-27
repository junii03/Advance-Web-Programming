/**
 * Loan API Types
 * Based on backend /api/loans endpoints
 */

// ============================================
// Loan Types
// ============================================

/**
 * Loan type enum
 */
export type LoanType = 'personal' | 'home' | 'car' | 'business';

/**
 * Loan status enum
 */
export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'closed';

/**
 * Loan object from API
 */
export interface ApiLoan {
  _id: string;
  userId: string;
  loanType: LoanType;
  amount: number;
  tenure: number; // months
  interestRate: number;
  monthlyInstallment: number;
  totalPayable: number;
  outstandingAmount: number;
  paidAmount: number;
  status: LoanStatus;
  purpose: string;
  collateral?: string;
  applicationDate: string;
  approvedDate?: string;
  disbursedDate?: string;
  nextPaymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Loan calculation result
 */
export interface LoanCalculation {
  principal: number;
  tenure: number;
  interestRate: number;
  monthlyInstallment: number;
  totalPayable: number;
  totalInterest: number;
}

// ============================================
// Request Types
// ============================================

/**
 * Apply for loan request
 * POST /api/loans
 */
export interface ApplyLoanRequest {
  loanType: LoanType;
  amount: number;
  tenure: number; // months
  purpose: string;
  collateral?: string;
}

/**
 * Calculate loan request
 * POST /api/loans/calculate
 */
export interface CalculateLoanRequest {
  loanType: LoanType;
  amount: number;
  tenure: number; // months
}

// ============================================
// Response Types
// ============================================

/**
 * Get loans list response
 * GET /api/loans
 */
export interface GetLoansResponse {
  success: boolean;
  count: number;
  data: ApiLoan[];
}

/**
 * Get single loan response
 * GET /api/loans/:id
 */
export interface GetLoanResponse {
  success: boolean;
  data: ApiLoan;
}

/**
 * Apply for loan response
 * POST /api/loans
 */
export interface ApplyLoanResponse {
  success: boolean;
  data: ApiLoan;
}

/**
 * Calculate loan response
 * POST /api/loans/calculate
 */
export interface CalculateLoanResponse {
  success: boolean;
  data: LoanCalculation;
}
