/**
 * Users API Service
 * 
 * Centralized API calls for user management
 * All user-related API calls should be defined here
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';

// User types matching the actual API response structure
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  roleId?: number;
  parentId: string | null;
  emailVerifiedAt: string | null;
  isBlocked: boolean;
  isDeleted: boolean;
  uniqueId: string;
  isTwoFaEnabled: boolean;
  provider: string;
  profileImage: string | null;
  avatarUrl: string | null;
  isProfileCompleted: boolean;
  isKycCompleted: boolean | null;
  profileStep: number;
  entityType: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  email: string;
  name: string;
  password: string;
  roleId: number;
  parentId?: string | null;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  roleId?: number;
  // isBlocked?: boolean;
  // isDeleted?: boolean;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  role?: string;
}

export interface UserListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface UserListData {
  data: User[];
  meta: UserListMeta;
}

export interface UserListResponse {
  success: boolean;
  data: UserListData;
  message?: string;
}

/**
 * 1. Get all users (with pagination and filters)
 */
export async function getUsers(
  params?: UserListParams
): Promise<ApiResponse<UserListResponse>> {
  try {
    const data = await http.get(adminRoutes.users.list, {
      query: params as Record<string, string | number | boolean | null | undefined>,
    }) as UserListResponse;
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
 * 2. Get user by ID
 */
export async function getUserById(id: string): Promise<ApiResponse<User>> {
  try {
    const response = await http.get(adminRoutes.users.getById(id)) as
      | {
          success: boolean;
          data: User;
        }
      | User;
    
    // Handle API response structure: { success: true, data: {...} }
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      const apiResponse = response as { success: boolean; data: User };
      if (apiResponse.success && apiResponse.data) {
        return {
          status: 200,
          data: apiResponse.data,
        };
      }
    }
    
    // Fallback: if response is directly the user data
    if (response && typeof response === 'object' && 'id' in response && !('success' in response)) {
      return {
        status: 200,
        data: response as unknown as User,
      };
    }
    
    return {
      status: 200,
      data: response as unknown as User,
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
 * 3. Create new user
 */
export async function createUser(
  payload: CreateUserPayload
): Promise<ApiResponse<User>> {
  try {
    const data = await http.post(adminRoutes.users.create, payload) as User;
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
 * 4. Update user (PATCH)
 */
export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<ApiResponse<User>> {
  try {
    const data = await http.patch(adminRoutes.users.update(id), payload) as User;
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
 * 5. Delete user (returns 204 No Content per REST API standard)
 */
export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  try {
    // DELETE requests return 204 No Content with no body
    const response = await http.delete(adminRoutes.users.delete(id));
    
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

/**
 * Bonus: Search users
 */
export async function searchUsers(
  query: string,
  params?: Omit<UserListParams, 'search'>
): Promise<ApiResponse<UserListResponse>> {
  try {
    const data = await http.get(adminRoutes.users.list, {
      query: { ...params, search: query } as Record<string, string | number | boolean | null | undefined>,
    }) as UserListResponse;
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
 * Bonus: Bulk delete users
 */
export async function bulkDeleteUsers(
  ids: string[]
): Promise<ApiResponse<{ deleted: number }>> {
  try {
    const data = await http.post(adminRoutes.users.bulkDelete, { ids }) as { deleted: number };
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

