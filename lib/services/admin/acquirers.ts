/**
 * Acquirers API Service
 * 
 * Centralized API calls for acquirer management
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';

// Acquirer types matching the API response structure
export interface Acquirer {
  id: number | string;
  acquirerName: string;
  fileName: string;
  fields: Record<string, string>;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcquirerListParams {
  page?: number;
  limit?: number;
}

export interface AcquirerListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AcquirerListData {
  data: Acquirer[];
  meta: AcquirerListMeta;
}

export interface AcquirerListResponse {
  success: boolean;
  data: AcquirerListData;
  message?: string;
}

export interface CreateAcquirerPayload {
  acquirerName: string;
  fileName: string;
  fields: Record<string, string>;
}

export interface UpdateAcquirerPayload {
  acquirerName: string;
  fileName: string;
  fields: Record<string, string>;
  status: string;
}

/**
 * Get all acquirers (with pagination)
 */
export async function getAcquirers(
  params?: AcquirerListParams
): Promise<ApiResponse<AcquirerListResponse>> {
  try {
    const data = await http.get(adminRoutes.acquirer.list, {
      query: params as Record<string, string | number | undefined>,
    }) as AcquirerListResponse;
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
 * Create new acquirer
 */
export async function createAcquirer(
  payload: CreateAcquirerPayload
): Promise<ApiResponse<Acquirer>> {
  try {
    const data = await http.post(adminRoutes.acquirer.create, payload) as Acquirer;
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
 * Get acquirer by ID
 */
export async function getAcquirerById(id: string | number): Promise<ApiResponse<Acquirer>> {
  try {
    const response = await http.get(adminRoutes.acquirer.getById(id)) as
      | {
          success: boolean;
          data: Acquirer;
        }
      | Acquirer;
    
    // Handle API response structure: { success: true, data: {...} }
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      const apiResponse = response as { success: boolean; data: Acquirer };
      if (apiResponse.success && apiResponse.data) {
        return {
          status: 200,
          data: apiResponse.data,
        };
      }
    }
    
    // Fallback: if response is directly the acquirer data
    if (response && typeof response === 'object' && 'id' in response && !('success' in response)) {
      return {
        status: 200,
        data: response as unknown as Acquirer,
      };
    }
    
    // Handle direct Acquirer object response
    return {
      status: 200,
      data: response as Acquirer,
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
 * Update acquirer
 */
export async function updateAcquirer(
  id: string | number,
  payload: UpdateAcquirerPayload
): Promise<ApiResponse<Acquirer>> {
  try {
    const data = await http.put(adminRoutes.acquirer.update(id), payload) as Acquirer;
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
 * Delete acquirer
 */
export async function deleteAcquirer(id: string | number): Promise<ApiResponse<{ success: boolean; message?: string }>> {
  try {
    const data = await http.delete(adminRoutes.acquirer.delete(id)) as { success: boolean; message?: string };
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

