// Re-export User and SignupData from auth context for backward compatibility
// These are now defined in contexts/auth.tsx with enhanced properties
export type { User, SignupData } from '@/src/contexts/auth';

// Legacy User type - kept for reference
// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   customerId: string;
//   profileImage?: string;
// }

// Legacy SignupData type - kept for reference
// export interface SignupData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   cnic: string;
//   dateOfBirth: string;
//   gender: string;
//   address: string;
//   city: string;
//   state: string;
//   password: string;
// }

export interface Card {
  id: string;
  cardNumber: string;
  holderName: string;
  expiryDate: string;
  balance: number;
  type: 'debit' | 'credit';
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'debit' | 'credit';
  status: 'pending' | 'completed' | 'failed';
}

export interface Transfer {
  id: string;
  recipientName: string;
  recipientAccount: string;
  amount: number;
  description: string;
  date: string;
}
