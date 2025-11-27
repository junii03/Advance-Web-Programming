/**
 * Common API Types
 * Shared types used across all API services
 */

import { ApiErrorCode } from '../../config';

// ============================================
// Generic API Response Types
// ============================================

/**
 * Base success response structure
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  count?: number;
  pagination?: PaginationInfo;
}

/**
 * Paginated list response
 */
export interface ApiListResponse<T> {
  success: true;
  count: number;
  data: T[];
  pagination?: PaginationInfo;
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * API Error response from backend
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: ValidationError[];
}

/**
 * Validation error for individual fields
 */
export interface ValidationError {
  field: string;
  message: string;
}

// ============================================
// Custom Error Types
// ============================================

/**
 * Structured API Error used in the app
 */
export class ApiError extends Error {
  code: ApiErrorCode;
  statusCode?: number;
  meta?: Record<string, unknown>;
  validationErrors?: ValidationError[];

  constructor(
    message: string,
    code: ApiErrorCode,
    statusCode?: number,
    meta?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.meta = meta;
  }
}

// ============================================
// Query Parameter Types
// ============================================

/**
 * Common pagination and filter params
 */
export interface BaseQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  dateFrom?: string;
  dateTo?: string;
}
