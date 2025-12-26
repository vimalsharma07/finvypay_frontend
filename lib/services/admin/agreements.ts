/**
 * Agreements API Service
 * 
 * Centralized API calls for agreements management
 * All agreements-related API calls should be defined here
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';

// Agreement types matching the actual API response structure
export interface Agreement {
  id: string;
  name: string;
  type: string;
  desc: string;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AgreementListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface AgreementListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AgreementListData {
  data: Agreement[];
  meta: AgreementListMeta;
}

export interface AgreementListResponse {
  success: boolean;
  data: AgreementListData;
  message?: string;
}

export interface AgreementResponse {
  success: boolean;
  data: Agreement;
  message?: string;
}

export interface CreateAgreementPayload {
  name: string;
  type: string;
  desc: string;
  status: string;
}

export interface UpdateAgreementPayload {
  name?: string;
  type?: string;
  desc?: string;
  status?: string;
}

/**
 * Get all agreements (with pagination and sorting)
 */
export async function getAgreements(
  params?: AgreementListParams
): Promise<ApiResponse<AgreementListResponse>> {
  try {
    const data = await http.get(adminRoutes.master.agreements.list, {
      query: params as Record<string, string | number | boolean | null | undefined>,
    }) as AgreementListResponse;
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
 * Get agreement by ID
 */
export async function getAgreementById(id: string): Promise<ApiResponse<Agreement>> {
  try {
    const response = await http.get(adminRoutes.master.agreements.getById(id)) as
      | AgreementResponse
      | Agreement;

    // Handle wrapped response: { success: true, data: {...} }
    if (response && typeof response === 'object' && 'success' in response && response.success) {
      const apiResponse = response as AgreementResponse;
      return {
        status: 200,
        data: apiResponse.data,
      };
    }

    // Fallback: if response is directly the agreement data
    if (response && typeof response === 'object' && 'id' in response && 'name' in response) {
      return {
        status: 200,
        data: response as unknown as Agreement,
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
 * Create agreement
 */
export async function createAgreement(
  payload: CreateAgreementPayload
): Promise<ApiResponse<Agreement>> {
  try {
    const response = await http.post(adminRoutes.master.agreements.create, payload) as
      | AgreementResponse
      | Agreement;

    // Handle wrapped response: { success: true, data: {...} }
    if (response && typeof response === 'object' && 'success' in response && response.success) {
      const apiResponse = response as AgreementResponse;
      return {
        status: 200,
        data: apiResponse.data,
      };
    }

    // Fallback: if response is directly the agreement data
    if (response && typeof response === 'object' && 'id' in response && 'name' in response) {
      return {
        status: 200,
        data: response as unknown as Agreement,
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
 * Update agreement
 */
export async function updateAgreement(
  id: string,
  payload: UpdateAgreementPayload
): Promise<ApiResponse<Agreement>> {
  try {
    const response = await http.put(adminRoutes.master.agreements.update(id), payload) as
      | AgreementResponse
      | Agreement;

    // Handle wrapped response: { success: true, data: {...} }
    if (response && typeof response === 'object' && 'success' in response && response.success) {
      const apiResponse = response as AgreementResponse;
      return {
        status: 200,
        data: apiResponse.data,
      };
    }

    // Fallback: if response is directly the agreement data
    if (response && typeof response === 'object' && 'id' in response && 'name' in response) {
      return {
        status: 200,
        data: response as unknown as Agreement,
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
 * Delete agreement
 */
export async function deleteAgreement(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await http.delete(adminRoutes.master.agreements.delete(id));

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

