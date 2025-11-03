/**
 * @file index.ts
 * @author Angelo Nicolson
 * @brief Shared type definitions barrel export for client-server type safety
 * @description Main entry point for shared TypeScript type definitions used across both client and server.
 * Re-exports all type definitions from user, tutor, and booking modules, and defines common API response structures
 * including ApiError, ApiResponse, PaginationParams, and PaginatedResponse for consistent API contracts and type safety
 * throughout the full-stack application.
 */

// Export all types
export * from './types/user';
export * from './types/tutor';
export * from './types/booking';

// API Response types
export interface ApiError {
  message: string;
  errors?: any[];
  stack?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}