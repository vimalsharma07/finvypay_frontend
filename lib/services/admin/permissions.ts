/**
 * Permissions API Service
 * 
 * Centralized API calls for permissions management
 */

import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';

// Permission types matching the API response structure
export interface Permission {
  id: number | string;
  name: string;
  identifier?: string;
  route?: string;
  method?: string;
  frontendRoute?: string;
  module: string;
  subModule: string;
  type: string;
  rolePermissions?: any[];
  createdAt?: string;
  updatedAt?: string;
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

