/**
 * Merchants API Service
 * 
 * Centralized API calls for merchant management
 * All merchant-related API calls should be defined here
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';

// Merchant types matching the actual API response structure
export interface Merchant {
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
  otp?: string | null;
  profileStep: number;
  entityType: string | null;
  createdAt: string;
  updatedAt: string;
}

// Backward compatibility
export interface User extends Merchant {}

export interface CreateMerchantPayload {
  email: string;
  name: string;
  password: string;
  roleId: number;
  parentId?: string | null;
}

// Backward compatibility
export interface CreateUserPayload extends CreateMerchantPayload {}

export interface UpdateMerchantPayload {
  name?: string;
  email?: string;
  roleId?: number;
  binEnabled?: boolean;
  // isBlocked?: boolean;
  // isDeleted?: boolean;
}

// Backward compatibility
export interface UpdateUserPayload extends UpdateMerchantPayload {}

export interface MerchantListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  role?: string;
}

// Backward compatibility
export interface UserListParams extends MerchantListParams {}

export interface MerchantListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Backward compatibility
export interface UserListMeta extends MerchantListMeta {}

// Legacy type - kept for backward compatibility during migration
export interface MerchantListData {
  data: Merchant[];
  meta: MerchantListMeta;
}

// New standard format: { success: true, data: Merchant[], meta: MerchantListMeta }
export interface MerchantListResponse {
  success: boolean;
  data: Merchant[];
  meta: MerchantListMeta;
  message?: string;
}

// Backward compatibility
export interface UserListData extends MerchantListData {}
export interface UserListResponse extends MerchantListResponse {}

/**
 * 1. Get all merchants (with pagination and filters)
 */
export async function getMerchants(
  params?: MerchantListParams
): Promise<ApiResponse<MerchantListResponse>> {
  try {
    const data = await http.get(adminRoutes.users.list, {
      query: params as Record<string, string | number | boolean | null | undefined>,
    }) as MerchantListResponse;
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

// Backward compatibility
export async function getUsers(
  params?: UserListParams
): Promise<ApiResponse<UserListResponse>> {
  return getMerchants(params as MerchantListParams) as Promise<ApiResponse<UserListResponse>>;
}

/**
 * 2. Get merchant by ID
 */
export async function getMerchantById(id: string): Promise<ApiResponse<Merchant>> {
  try {
    const response = await http.get(adminRoutes.users.getById(id)) as
      | {
          success: boolean;
          data?: Merchant | null;
        }
      | Merchant;
    
    // Handle API response structure: { success: true, data: {...} }
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      const apiResponse = response as { success: boolean; data?: Merchant | null };
      if (apiResponse.success && apiResponse.data && typeof apiResponse.data === 'object') {
        return {
          status: 200,
          data: apiResponse.data,
        };
      }
      // Success but missing or invalid data
      if (apiResponse.success && !apiResponse.data) {
        return {
          status: 404,
          error: 'Merchant not found',
        };
      }
    }
    
    // Fallback: if response is directly the merchant data (no wrapper)
    if (response && typeof response === 'object' && 'id' in response && !('success' in response)) {
      return {
        status: 200,
        data: response as unknown as Merchant,
      };
    }
    
    return {
      status: 404,
      error: 'Merchant not found',
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

// Backward compatibility
export async function getUserById(id: string): Promise<ApiResponse<User>> {
  return getMerchantById(id) as Promise<ApiResponse<User>>;
}

/**
 * 3. Create new merchant
 */
export async function createMerchant(
  payload: CreateMerchantPayload
): Promise<ApiResponse<Merchant>> {
  try {
    const data = await http.post(adminRoutes.users.create, payload) as Merchant;
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

// Backward compatibility
export async function createUser(
  payload: CreateUserPayload
): Promise<ApiResponse<User>> {
  return createMerchant(payload as CreateMerchantPayload) as Promise<ApiResponse<User>>;
}

/**
 * 4. Update merchant (PATCH)
 */
export async function updateMerchant(
  id: string,
  payload: UpdateMerchantPayload
): Promise<ApiResponse<Merchant>> {
  try {
    const response = await http.patch(adminRoutes.users.update(id), payload) as
      | { success: boolean; data?: Merchant }
      | Merchant;
    // Backend returns { success: true, data: Merchant }
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      const wrapped = response as { success: boolean; data?: Merchant };
      if (wrapped.success && wrapped.data) {
        return { status: 200, data: wrapped.data };
      }
    }
    // Direct merchant object (no wrapper)
    if (response && typeof response === 'object' && 'id' in response && !('success' in response)) {
      return { status: 200, data: response as unknown as Merchant };
    }
    return {
      status: 200,
      data: response as unknown as Merchant,
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

// Backward compatibility
export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<ApiResponse<User>> {
  return updateMerchant(id, payload as UpdateMerchantPayload) as Promise<ApiResponse<User>>;
}

/**
 * 5. Delete merchant (returns 204 No Content per REST API standard)
 */
export async function deleteMerchant(id: string): Promise<ApiResponse<void>> {
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

// Backward compatibility
export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  return deleteMerchant(id);
}

/**
 * 6. Disable Two-Factor Authentication for a merchant
 * PUT /user-management/:id/disable-2fa
 */
export async function disableMerchant2Fa(id: string): Promise<ApiResponse<{ message: string }>> {
  try {
    const data = await http.put(adminRoutes.users.disable2Fa(id), {}) as { message: string };
    return {
      status: 200,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle error data that might be an object with nested error structure
      const errorData = error.data;
      let errorMessage = error.message;
      
      // Check if error.data.error is an object (like { code, message, details })
      if (errorData?.error && typeof errorData.error === 'object') {
        errorMessage = errorData.error.message || errorData.error.code || error.message;
      } else if (typeof errorData?.error === 'string') {
        errorMessage = errorData.error;
      }
      
      return {
        status: error.status,
        error: errorMessage,
        data: errorData,
        errors: errorData?.errors,
        message: errorData?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Backward compatibility
export async function disableUser2Fa(id: string): Promise<ApiResponse<{ message: string }>> {
  return disableMerchant2Fa(id);
}

/**
 * Impersonate a user (login as that user).
 * POST /user-management/:id/impersonate
 * Returns the same response structure as login (accessToken, refreshToken, user data).
 * Used by admin to open a new window and sign in as the target user.
 */
export async function impersonateUser(
  id: string
): Promise<ApiResponse<{ success: boolean; data?: { accessToken: any; refreshToken?: any; [key: string]: any }; message?: string }>> {
  try {
    const data = await http.post(adminRoutes.users.impersonate(id), {}) as {
      success: boolean;
      data?: { accessToken: any; refreshToken?: any; [key: string]: any };
      message?: string;
    };
    return {
      status: 200,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const errorData = error.data;
      let errorMessage = error.message;
      if (errorData?.error && typeof errorData.error === 'object') {
        errorMessage = errorData.error.message || errorData.error.code || error.message;
      } else if (typeof errorData?.error === 'string') {
        errorMessage = errorData.error;
      }
      return {
        status: error.status,
        error: errorMessage,
        data: errorData,
        errors: errorData?.errors,
        message: errorData?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Bonus: Search merchants
 */
export async function searchMerchants(
  query: string,
  params?: Omit<MerchantListParams, 'search'>
): Promise<ApiResponse<MerchantListResponse>> {
  try {
    const data = await http.get(adminRoutes.users.list, {
      query: { ...params, search: query } as Record<string, string | number | boolean | null | undefined>,
    }) as MerchantListResponse;
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

// Backward compatibility
export async function searchUsers(
  query: string,
  params?: Omit<UserListParams, 'search'>
): Promise<ApiResponse<UserListResponse>> {
  return searchMerchants(query, params as Omit<MerchantListParams, 'search'>) as Promise<ApiResponse<UserListResponse>>;
}

/**
 * Bonus: Bulk delete merchants
 */
export async function bulkDeleteMerchants(
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

