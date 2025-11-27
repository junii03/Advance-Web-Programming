/**
 * Services Index
 * Re-exports all service modules
 */

export { authService, AuthService } from './auth.service';
export { accountService, AccountService } from './account.service';
export { transactionService, TransactionService } from './transaction.service';
export { cardService, CardService } from './card.service';
export { loanService, LoanService } from './loan.service';
export { dashboardService, DashboardService } from './dashboard.service';

// Export types from dashboard service
export type {
  DashboardData,
  Analytics,
  AccountsSummary,
  Beneficiary,
  AccountLookupResult,
} from './dashboard.service';
