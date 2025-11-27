/**
 * Authentication API Types
 * Based on backend /api/auth endpoints
 */

// ============================================
// Request Types
// ============================================

/**
 * Login request payload
 * POST /api/auth/login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request payload
 * POST /api/auth/register (multipart/form-data)
 */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  cnic: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

/**
 * Update password request payload
 * PUT /api/auth/updatepassword
 */
export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Update profile details request payload
 * PUT /api/auth/updatedetails
 */
export interface UpdateDetailsRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

// ============================================
// Response Types
// ============================================

/**
 * Profile picture object with URL and metadata
 */
export interface ProfilePicture {
  url: string;
  publicId: string;
  uploadedAt: string;
}

/**
 * User object returned from API
 */
export interface ApiUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cnic: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  role: 'customer' | 'employee' | 'manager' | 'admin';
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profilePicture?: ProfilePicture | string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Login response
 * POST /api/auth/login
 */
export interface LoginResponse {
  success: boolean;
  token: string;
  user: ApiUser;
}

/**
 * Register response
 * POST /api/auth/register
 */
export interface RegisterResponse {
  success: boolean;
  token: string;
  user: ApiUser;
}

/**
 * Get current user response
 * GET /api/auth/me
 */
export interface GetMeResponse {
  success: boolean;
  user: ApiUser;
}

/**
 * Logout response
 * POST /api/auth/logout
 */
export interface LogoutResponse {
  success: boolean;
}

/**
 * Update details response
 * PUT /api/auth/updatedetails
 */
export interface UpdateDetailsResponse {
  success: boolean;
  data: ApiUser;
}

/**
 * Update password response
 * PUT /api/auth/updatepassword
 */
export interface UpdatePasswordResponse {
  success: boolean;
}

/**
 * Forgot password request payload
 * POST /api/auth/forgotpassword
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Forgot password response
 * POST /api/auth/forgotpassword
 */
export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  resetToken?: string; // Only returned in development mode
}

/**
 * Reset password request payload
 * PUT /api/auth/resetpassword/:resettoken
 */
export interface ResetPasswordRequest {
  password: string;
}

/**
 * Reset password response
 * PUT /api/auth/resetpassword/:resettoken
 */
export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  token: string;
}
