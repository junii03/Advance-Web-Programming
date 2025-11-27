/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { api } from '../lib/apiClient';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  GetMeResponse,
  LogoutResponse,
  UpdateDetailsRequest,
  UpdateDetailsResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  ApiUser,
} from '../types/api';

class AuthService {
  /**
   * Login user with email and password
   * POST /api/auth/login
   */
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', payload);

    // Store the token
    if (response.token) {
      await api.setToken(response.token);
    }

    return response;
  }

  /**
   * Register new user
   * POST /api/auth/register
   * Note: Backend expects multipart/form-data for document uploads,
   * but for basic registration, JSON works
   */
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', payload);

    // Store the token
    if (response.token) {
      await api.setToken(response.token);
    }

    return response;
  }

  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  async getCurrentUser(): Promise<ApiUser> {
    const response = await api.get<GetMeResponse>('/auth/me');
    // response is GetMeResponse: { success: boolean, user: ApiUser }
    if (!response?.user) {
      console.error('Invalid /auth/me response structure:', response);
      throw new Error('Invalid response structure from /auth/me endpoint');
    }
    return response.user;
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(): Promise<void> {
    try {
      await api.post<LogoutResponse>('/auth/logout');
    } finally {
      // Always clear token, even if API call fails
      await api.removeToken();
    }
  }

  /**
   * Update user profile details
   * PUT /api/auth/updatedetails
   */
  async updateDetails(payload: UpdateDetailsRequest): Promise<ApiUser> {
    const response = await api.put<UpdateDetailsResponse>(
      '/auth/updatedetails',
      payload
    );
    return response.data;
  }

  /**
   * Update user password
   * PUT /api/auth/updatepassword
   */
  async updatePassword(payload: UpdatePasswordRequest): Promise<void> {
    await api.put<UpdatePasswordResponse>('/auth/updatepassword', payload);
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const hasToken = await api.hasToken();
      if (!hasToken) return false;

      // Verify token is valid by calling /me
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Request password reset
   * POST /api/auth/forgotpassword
   * Returns reset token (shown to user in development)
   */
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const response = await api.post<ForgotPasswordResponse>(
      '/auth/forgotpassword',
      { email }
    );
    return response;
  }

  /**
   * Reset password using token
   * PUT /api/auth/resetpassword/:resettoken
   */
  async resetPassword(
    resetToken: string,
    newPassword: string
  ): Promise<ResetPasswordResponse> {
    const response = await api.put<ResetPasswordResponse>(
      `/auth/resetpassword/${resetToken}`,
      { password: newPassword }
    );

    // Store the new token after successful password reset
    if (response.token) {
      await api.setToken(response.token);
    }

    return response;
  }

  /**
   * Register new user with FormData (for file uploads)
   * POST /api/auth/register
   */
  async registerWithFiles(formData: FormData): Promise<RegisterResponse> {
    const response = await api.postFormData<RegisterResponse>(
      '/auth/register',
      formData
    );

    // Store the token
    if (response.token) {
      await api.setToken(response.token);
    }

    return response;
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export class for testing
export { AuthService };
