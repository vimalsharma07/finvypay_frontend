/**
 * Shared Types for API Services
 * 
 * Common types used across all API services
 */

// ApiResponse type to match the expected format
export interface ApiResponse<T> {
  status: number;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
}

