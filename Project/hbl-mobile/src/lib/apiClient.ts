/**
 * API Client
 * Centralized HTTP client with interceptors for auth, error handling, and retries
 */

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS, ApiErrorCode } from '../config';
import { ApiError, ApiErrorResponse } from '../types/api';

// ============================================
// Auth Event Emitter for 401 handling
// ============================================

type AuthEventListener = () => void;
const authEventListeners: AuthEventListener[] = [];

/**
 * Subscribe to auth events (e.g., 401 unauthorized)
 * Returns unsubscribe function
 */
export function onUnauthorized(listener: AuthEventListener): () => void {
  authEventListeners.push(listener);
  return () => {
    const index = authEventListeners.indexOf(listener);
    if (index > -1) {
      authEventListeners.splice(index, 1);
    }
  };
}

/**
 * Emit unauthorized event to all listeners
 */
function emitUnauthorized(): void {
  authEventListeners.forEach((listener) => listener());
}

// ============================================
// Error Mapping
// ============================================

/**
 * Maps HTTP status codes to ApiErrorCode
 */
function getErrorCodeFromStatus(status: number): ApiErrorCode {
  switch (status) {
    case 401:
      return ApiErrorCode.UNAUTHORIZED;
    case 403:
      return ApiErrorCode.FORBIDDEN;
    case 404:
      return ApiErrorCode.NOT_FOUND;
    case 422:
      return ApiErrorCode.VALIDATION_ERROR;
    case 500:
    case 502:
    case 503:
      return ApiErrorCode.SERVER_ERROR;
    default:
      return ApiErrorCode.UNKNOWN;
  }
}

/**
 * Maps Axios errors to structured ApiError
 */
function mapAxiosError(error: AxiosError<ApiErrorResponse>): ApiError {
  // Network error (no response)
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return new ApiError(
        'Request timed out. Please check your connection and try again.',
        ApiErrorCode.TIMEOUT
      );
    }
    return new ApiError(
      'Network error. Please check your internet connection.',
      ApiErrorCode.NETWORK_ERROR
    );
  }

  const { status, data } = error.response;
  const errorCode = getErrorCodeFromStatus(status);
  const message = data?.message || error.message || 'An unexpected error occurred';

  const apiError = new ApiError(message, errorCode, status);

  // Include validation errors if present
  if (data?.errors) {
    apiError.validationErrors = data.errors;
  }

  return apiError;
}

// ============================================
// API Client Class
// ============================================

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: {
    resolve: (token: string) => void;
    reject: (error: ApiError) => void;
  }[] = [];

  constructor() {
    // Create axios instance with base config
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Setup interceptors
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  /**
   * Request interceptor - attaches auth token to requests
   */
  private setupRequestInterceptor(): void {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Response interceptor - handles errors and token refresh
   */
  private setupResponseInterceptor(): void {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 Unauthorized - clear tokens and notify listeners
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          await this.clearTokens();
          // Emit unauthorized event to trigger logout/redirect
          emitUnauthorized();
        }

        throw mapAxiosError(error);
      }
    );
  }

  /**
   * Clear stored authentication tokens
   */
  private async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
  }

  /**
   * Store authentication token
   */
  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  /**
   * Get stored authentication token
   */
  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Remove authentication token (logout)
   */
  async removeToken(): Promise<void> {
    await this.clearTokens();
  }

  /**
   * Check if user has a stored token
   */
  async hasToken(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  // ============================================
  // HTTP Methods
  // ============================================

  /**
   * GET request
   */
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(
    url: string,
    data?: unknown,
    config?: { headers?: Record<string, string> }
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  /**
   * POST with multipart/form-data (for file uploads)
   */
  async postFormData<T>(url: string, formData: FormData): Promise<T> {
    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export class for testing purposes
export { ApiClient };
