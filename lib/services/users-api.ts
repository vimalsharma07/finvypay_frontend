/**
 * Users API Service
 * 
 * Centralized API calls for user management
 * All user-related API calls should be defined here
 */

import { http, ApiError } from '../api';
import { adminRoutes } from '../routes/admin-routes';

// ApiResponse type to match the expected format
export interface ApiResponse<T> {
  status: number;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
}

// User types matching the actual API response structure
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
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
  name: string;
  email: string;
  password?: string;
  role?: string;
  [key: string]: any;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  [key: string]: any;
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
    const data = await http.get(adminRoutes.users.getById(id)) as User;
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
 * 4. Update user
 */
export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<ApiResponse<User>> {
  try {
    const data = await http.put(adminRoutes.users.update(id), payload) as User;
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
 * 5. Delete user
 */
export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  try {
    await http.delete(adminRoutes.users.delete(id));
    return {
      status: 200,
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
