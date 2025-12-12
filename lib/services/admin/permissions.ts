/**
 * Permissions API Service
 * 
 * Centralized API calls for permissions management
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
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

export interface CreatePermissionPayload {
  name: string;
  identifier: string;
  route: string;
  method: string;
  frontendRoute: string;
  module: string;
  subModule: string;
  type: string;
}

/**
 * Get all permissions
 */
export async function getPermissions(): Promise<ApiResponse<PermissionListResponse>> {
  try {
    const data = await http.get(adminRoutes.permissions.list) as PermissionListResponse;
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

/**
 * Create new permission
 */
export async function createPermission(
  payload: CreatePermissionPayload
): Promise<ApiResponse<Permission>> {
  try {
    const data = await http.post(adminRoutes.permissions.create, payload) as Permission;
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
        errors: error.data?.errors,
        message: error.data?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete permission (returns 204 No Content per REST API standard)
 */
export async function deletePermission(id: string | number): Promise<ApiResponse<void>> {
  try {
    const response = await http.delete(adminRoutes.permissions.delete(id));
    
    // Check if response indicates 204 No Content
    if (response && typeof response === 'object' && (response as any).__noContent) {
      return {
        status: 204,
      };
    }
    
    // Fallback: if we get here and response is null/undefined, assume 204
    return {
      status: 204,
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

