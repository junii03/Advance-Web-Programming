/**
 * Loan Service
 * Handles all loan-related API calls
 */

import { api } from '../lib/apiClient';
import {
  ApiLoan,
  LoanCalculation,
  LoanType,
  GetLoansResponse,
  GetLoanResponse,
  ApplyLoanRequest,
  ApplyLoanResponse,
  CalculateLoanRequest,
  CalculateLoanResponse,
} from '../types/api';

class LoanService {
  /**
   * Get all loans for the authenticated user
   * GET /api/loans
   */
  async getLoans(): Promise<ApiLoan[]> {
    const response = await api.get<GetLoansResponse>('/loans');
    return response.data;
  }

  /**
   * Get a single loan by ID
   * GET /api/loans/:id
   */
  async getLoan(loanId: string): Promise<ApiLoan> {
    const response = await api.get<GetLoanResponse>(`/loans/${loanId}`);
    return response.data;
  }

  /**
   * Apply for a new loan
   * POST /api/loans
   */
  async applyForLoan(data: ApplyLoanRequest): Promise<ApiLoan> {
    const response = await api.post<ApplyLoanResponse>('/loans', data);
    return response.data;
  }

  /**
   * Calculate loan EMI and details
   * POST /api/loans/calculate
   */
  async calculateLoan(data: CalculateLoanRequest): Promise<LoanCalculation> {
    const response = await api.post<CalculateLoanResponse>(
      '/loans/calculate',
      data
    );
    return response.data;
  }

  /**
   * Get active loans only
   */
  async getActiveLoans(): Promise<ApiLoan[]> {
    const loans = await this.getLoans();
    return loans.filter((loan) => loan.status === 'active');
  }

  /**
   * Get pending loan applications
   */
  async getPendingLoans(): Promise<ApiLoan[]> {
    const loans = await this.getLoans();
    return loans.filter((loan) => loan.status === 'pending');
  }

  /**
   * Get loans by type
   */
  async getLoansByType(type: LoanType): Promise<ApiLoan[]> {
    const loans = await this.getLoans();
    return loans.filter((loan) => loan.loanType === type);
  }

  /**
   * Get total outstanding amount across all active loans
   */
  async getTotalOutstanding(): Promise<number> {
    const activeLoans = await this.getActiveLoans();
    return activeLoans.reduce((total, loan) => total + loan.outstandingAmount, 0);
  }

  /**
   * Calculate EMI for a quick estimate
   * Uses standard EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
   */
  calculateEMI(
    principal: number,
    annualInterestRate: number,
    tenureMonths: number
  ): number {
    const monthlyRate = annualInterestRate / 12 / 100;
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return Math.round(emi * 100) / 100;
  }
}

// Export singleton instance
export const loanService = new LoanService();

// Export class for testing
export { LoanService };
