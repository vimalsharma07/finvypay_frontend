/**
 * Permissions API Service
 * 
 * Centralized API calls for permissions management
 */

import { http, ApiError } from '../api';

// ApiResponse type
export interface ApiResponse<T> {
  status: number;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
}

// Permission types
export interface Permission {
  id: number | string;
  name: string;
  slug?: string;
  description?: string | null;
  category?: string;
  subCategory?: string;
}

export interface PermissionListResponse {
  success: boolean;
  data: Permission[];
  message?: string;
}

/**
 * Get all permissions
 */
export async function getPermissions(): Promise<ApiResponse<PermissionListResponse>> {
  try {
    const data = await http.get('/permissions/permissions') as PermissionListResponse;
    return {
      status: 200,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

