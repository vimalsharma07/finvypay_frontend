/**
 * Roles API Service
 * 
 * Centralized API calls for roles management
 * All role-related API calls should be defined here
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';

// Role types matching the actual API response structure
export interface Role {
  id: number;
  name: string;
  type: string;
  rolePermissions: any[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleListResponse {
  success: boolean;
  data: Role[];
  message?: string;
}

export interface CreateRolePayload {
  name: string;
  type: string;
  permissionIds?: (number | string)[];
}

export interface UpdateRolePayload {
  name: string;
  type: string;
  permissionIds?: (number | string)[];
}

/**
 * Get all roles
 * @param type - Optional role type filter (e.g., 'ADMIN', 'USER', 'AFFILIATE')
 */
export async function getRoles(type?: string): Promise<ApiResponse<RoleListResponse>> {
  try {
    const endpoint = type 
      ? `${adminRoutes.roles.list}?type=${type}`
      : adminRoutes.roles.list;
    console.log('📡 Calling API:', endpoint);
    const data = await http.get(endpoint) as RoleListResponse;
    console.log('📦 Raw API response:', data);
    return {
      status: 200,
      data,
    };
  } catch (error) {
    console.error('❌ Error in getRoles:', error);
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
 * Get role by ID
 */
export async function getRoleById(id: string | number): Promise<ApiResponse<Role>> {
  try {
    const response = await http.get(adminRoutes.roles.getById(id)) as
      | {
          success: boolean;
          data: Role;
        }
      | Role;
    
    // Handle API response structure: { success: true, data: {...} }
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      const apiResponse = response as { success: boolean; data: Role };
      if (apiResponse.success && apiResponse.data) {
        return {
          status: 200,
          data: apiResponse.data,
        };
      }
    }
    
    // Fallback: if response is directly the role data
    if (response && typeof response === 'object' && 'id' in response && !('success' in response)) {
      return {
        status: 200,
        data: response as unknown as Role,
      };
    }
    
    return {
      status: 200,
      data: response as unknown as Role,
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
 * Create new role
 */
export async function createRole(
  payload: CreateRolePayload
): Promise<ApiResponse<Role>> {
  try {
    const data = await http.post(adminRoutes.roles.create, payload) as Role;
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
 * Update existing role
 */
export async function updateRole(
  id: string | number,
  payload: UpdateRolePayload
): Promise<ApiResponse<Role>> {
  try {
    const data = await http.put(adminRoutes.roles.update(id), payload) as Role;
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
 * Delete role (returns 204 No Content per REST API standard)
 */
export async function deleteRole(id: string | number): Promise<ApiResponse<void>> {
  try {
    // DELETE requests return 204 No Content with no body
    const response = await http.delete(adminRoutes.roles.delete(id));
    
    // Check if response indicates 204 No Content
    if (response && typeof response === 'object' && (response as any).__noContent) {
      return {
        status: 204,
      };
    }
    
    // Fallback: if we get here and response is null/undefined, assume 204
    // (REST API standard for DELETE)
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

