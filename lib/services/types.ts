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

/** Cursor list meta (matches backend) */
export interface StandardListMeta {
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor: string | null;
  totalCount: number;
}

// Standard API Response format
export interface StandardApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: StandardListMeta | null;
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

