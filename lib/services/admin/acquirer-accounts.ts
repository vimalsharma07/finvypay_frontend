/**
 * Acquirer Accounts API Service
 * 
 * Centralized API calls for acquirer accounts management
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';

// Acquirer Account types matching the API response structure
export interface AcquirerAccountAcquirer {
  id: number | string;
  acquirerName: string;
  fileName: string;
  status: string;
}

export interface AcquirerAccount {
  id: number | string;
  acquirerId: number | string;
  acquirer: AcquirerAccountAcquirer;
  name: string;
  currency: string;
  providerType: string;
  flowType: string;
  timezone: string;
  minTransactionAmount: string;
  maxTransactionAmount: string;
  perDaySuccessAmount: string;
  perDayCardLimit: number;
  perDayEmailLimit: number;
  perWeekCardLimit: number;
  perWeekEmailLimit: number;
  perMonthCardLimit: number;
  perMonthEmailLimit: number;
  dailyCardDeclineLimit: number;
  dailyEmailDeclineLimit: number;
  allowedCountries: string[];
  blockedCountries: string[];
  acceptedCardTypes: string[];
  config: Record<string, string>;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcquirerAccountListParams {
  page?: number;
  limit?: number;
  acquirerId?: number;
}

export interface AcquirerAccountListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AcquirerAccountListData {
  data: AcquirerAccount[];
  meta: AcquirerAccountListMeta;
}

export interface AcquirerAccountListResponse {
  success: boolean;
  data: AcquirerAccountListData;
  message?: string;
}

export interface CreateAcquirerAccountPayload {
  acquirerId: number | string;
  name: string;
  currency: string;
  providerType: string;
  flowType: string;
  timezone: string;
  minTransactionAmount: number;
  maxTransactionAmount: number;
  perDaySuccessAmount: number;
  perDayCardLimit: number;
  perDayEmailLimit: number;
  perWeekCardLimit: number;
  perWeekEmailLimit: number;
  perMonthCardLimit: number;
  perMonthEmailLimit: number;
  dailyCardDeclineLimit: number;
  dailyEmailDeclineLimit: number;
  allowedCountries: string[];
  blockedCountries: string[];
  acceptedCardTypes: string[];
  config: Record<string, string>;
}

export interface UpdateAcquirerAccountPayload {
  acquirerId?: number | string;
  name?: string;
  currency?: string;
  providerType?: string;
  flowType?: string;
  timezone?: string;
  minTransactionAmount?: number;
  maxTransactionAmount?: number;
  perDaySuccessAmount?: number;
  perDayCardLimit?: number;
  perDayEmailLimit?: number;
  perWeekCardLimit?: number;
  perWeekEmailLimit?: number;
  perMonthCardLimit?: number;
  perMonthEmailLimit?: number;
  dailyCardDeclineLimit?: number;
  dailyEmailDeclineLimit?: number;
  allowedCountries?: string[];
  blockedCountries?: string[];
  acceptedCardTypes?: string[];
  config?: Record<string, string>;
  status?: string;
  descriptor?: string;
}

/**
 * Get all acquirer accounts (with pagination)
 */
export async function getAcquirerAccounts(
  params?: AcquirerAccountListParams
): Promise<ApiResponse<AcquirerAccountListResponse>> {
  try {
    const data = await http.get(adminRoutes.acquirerAccounts.list, {
      query: params as Record<string, string | number | undefined>,
    }) as AcquirerAccountListResponse;
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
 * Get acquirer account by ID
 */
export async function getAcquirerAccountById(
  id: string | number
): Promise<ApiResponse<AcquirerAccount>> {
  try {
    const response = await http.get(adminRoutes.acquirerAccounts.getById(id)) as
      | {
          success: boolean;
          data: AcquirerAccount;
        }
      | AcquirerAccount;
    
    // Handle API response structure: { success: true, data: {...} }
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      const apiResponse = response as { success: boolean; data: AcquirerAccount };
      if (apiResponse.success && apiResponse.data) {
        return {
          status: 200,
          data: apiResponse.data,
        };
      }
    }
    
    // Fallback: if response is directly the acquirer account data
    if (response && typeof response === 'object' && 'id' in response && !('success' in response)) {
      return {
        status: 200,
        data: response as unknown as AcquirerAccount,
      };
    }
    
    // Handle direct AcquirerAccount object response
    return {
      status: 200,
      data: response as AcquirerAccount,
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
 * Create acquirer account
 */
export async function createAcquirerAccount(
  payload: CreateAcquirerAccountPayload
): Promise<ApiResponse<AcquirerAccount>> {
  try {
    const data = await http.post(adminRoutes.acquirerAccounts.create, payload) as AcquirerAccount;
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
 * Update acquirer account
 */
export async function updateAcquirerAccount(
  id: string | number,
  payload: UpdateAcquirerAccountPayload
): Promise<ApiResponse<AcquirerAccount>> {
  try {
    const data = await http.put(adminRoutes.acquirerAccounts.update(id), payload) as AcquirerAccount;
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
 * Update acquirer account status
 */
export interface UpdateAcquirerAccountStatusPayload {
  status: 'active' | 'inactive';
}

export async function updateAcquirerAccountStatus(
  id: string | number,
  payload: UpdateAcquirerAccountStatusPayload
): Promise<ApiResponse<AcquirerAccount>> {
  try {
    const data = await http.patch(adminRoutes.acquirerAccounts.updateStatus(id), payload) as AcquirerAccount;
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
 * Delete acquirer account
 */
export async function deleteAcquirerAccount(
  id: string | number
): Promise<ApiResponse<{ success: boolean; message?: string }>> {
  try {
    const data = await http.delete(adminRoutes.acquirerAccounts.delete(id)) as {
      success: boolean;
      message?: string;
    };
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
