/**
 * App Configuration
 * Centralizes environment variables and configuration constants
 */

// API Configuration
export const API_CONFIG = {
  /** Base URL for all API requests */
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',

  /** Request timeout in milliseconds */
  TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 30000,
};

// Storage Keys for AsyncStorage
export const STORAGE_KEYS = {
  /** JWT Access Token */
  ACCESS_TOKEN: 'access_token',

  /** Refresh Token (if implemented) */
  REFRESH_TOKEN: 'refresh_token',

  /** Cached User Data */
  USER_DATA: 'user_data',
};

// API Error Codes
export enum ApiErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN',
}

// Export all config
export default {
  API_CONFIG,
  STORAGE_KEYS,
  ApiErrorCode,
};
