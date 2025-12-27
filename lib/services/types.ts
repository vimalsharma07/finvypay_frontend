/**
 * Shared Types for API Services
 * 
 * Common types used across all API services
 * 
 * STANDARD API RESPONSE FORMAT:
 * - SUCCESS (LIST): { success: true, data: <Array>, meta: <Object | null> }
 * - SUCCESS (SINGLE): { success: true, data: <Object> }
 * - ERROR: { success: false, error: { code: <STRING>, message: <STRING>, details: <Object | null> } }
 */

// Standard API Response format
export interface StandardApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  } | null;
  error?: {
    code: string;
    message: string;
    details: Record<string, any> | null;
  };
  message?: string;
}

// Legacy ApiResponse type for backward compatibility during migration
// This will be removed after full migration
export interface ApiResponse<T> {
  status: number;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
}

