/**
 * Industries API Service
 * 
 * Centralized API calls for industries management
 * All industries-related API calls should be defined here
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';

// Industry types matching the actual API response structure
export interface Industry {
  id: string;
  name: string;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IndustryListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface IndustryListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface IndustryListData {
  data: Industry[];
  meta: IndustryListMeta;
}

export interface IndustryListResponse {
  success: boolean;
  data: IndustryListData;
  message?: string;
}

export interface IndustryResponse {
  success: boolean;
  data: Industry;
  message?: string;
}

export interface CreateIndustryPayload {
  name: string;
  status: string;
}

export interface UpdateIndustryPayload {
  name?: string;
  status?: string;
}

/**
 * Get all industries (with pagination and sorting)
 */
export async function getIndustries(
  params?: IndustryListParams
): Promise<ApiResponse<IndustryListResponse>> {
  try {
    const data = await http.get(adminRoutes.master.industries.list, {
      query: params as Record<string, string | number | boolean | null | undefined>,
    }) as IndustryListResponse;
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
 * Get industry by ID
 */
export async function getIndustryById(id: string): Promise<ApiResponse<Industry>> {
  try {
    const response = await http.get(adminRoutes.master.industries.getById(id)) as
      | IndustryResponse
      | Industry;

    // Handle wrapped response: { success: true, data: {...} }
    if (response && typeof response === 'object' && 'success' in response && response.success) {
      const apiResponse = response as IndustryResponse;
      return {
        status: 200,
        data: apiResponse.data,
      };
    }

    // Fallback: if response is directly the industry data
    if (response && typeof response === 'object' && 'id' in response && 'name' in response) {
      return {
        status: 200,
        data: response as unknown as Industry,
      };
    }

    throw new Error('Invalid response structure from server');
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
 * Create industry
 */
export async function createIndustry(
  payload: CreateIndustryPayload
): Promise<ApiResponse<Industry>> {
  try {
    const response = await http.post(adminRoutes.master.industries.create, payload) as
      | IndustryResponse
      | Industry;

    // Handle wrapped response: { success: true, data: {...} }
    if (response && typeof response === 'object' && 'success' in response && response.success) {
      const apiResponse = response as IndustryResponse;
      return {
        status: 200,
        data: apiResponse.data,
      };
    }

    // Fallback: if response is directly the industry data
    if (response && typeof response === 'object' && 'id' in response && 'name' in response) {
      return {
        status: 200,
        data: response as unknown as Industry,
      };
    }

    throw new Error('Invalid response structure from server');
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
 * Update industry
 */
export async function updateIndustry(
  id: string,
  payload: UpdateIndustryPayload
): Promise<ApiResponse<Industry>> {
  try {
    const response = await http.put(adminRoutes.master.industries.update(id), payload) as
      | IndustryResponse
      | Industry;

    // Handle wrapped response: { success: true, data: {...} }
    if (response && typeof response === 'object' && 'success' in response && response.success) {
      const apiResponse = response as IndustryResponse;
      return {
        status: 200,
        data: apiResponse.data,
      };
    }

    // Fallback: if response is directly the industry data
    if (response && typeof response === 'object' && 'id' in response && 'name' in response) {
      return {
        status: 200,
        data: response as unknown as Industry,
      };
    }

    throw new Error('Invalid response structure from server');
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
 * Delete industry
 */
export async function deleteIndustry(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await http.delete(adminRoutes.master.industries.delete(id));

    // Handle 204 No Content response
    if (response && typeof response === 'object' && (response as any).__noContent) {
      return {
        status: 204,
      };
    }

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

