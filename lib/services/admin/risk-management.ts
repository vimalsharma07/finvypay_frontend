/**
 * Risk Management API Service
 * 
 * Centralized API calls for risk management operations
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';

// Risk Management types matching the API response structure
export interface RiskManagementUser {
  id: string;
  name: string;
  email: string;
}

export interface RiskManagement {
  id: string;
  userId: string;
  user: RiskManagementUser;
  riskValue: number | string;
  riskType: string;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface RiskManagementListParams {
  page?: number;
  limit?: number;
}

export interface RiskManagementListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface RiskManagementListData {
  items: RiskManagement[];
  meta: RiskManagementListMeta;
}

export interface RiskManagementListResponse {
  success: boolean;
  data: RiskManagementListData;
  message?: string;
}

export interface UpdateRiskManagementPayload {
  userId?: number | string;
  riskValue?: number | string;
  riskType?: string;
}

export interface CreateRiskManagementPayload {
  userId: number | string;
  riskType: string;
  riskValue: string;
}

export interface RiskType {
  value: string;
  description: string;
}

export interface RiskTypesResponse {
  success: boolean;
  data: {
    riskTypes: RiskType[];
  };
  message?: string;
}

/**
 * Get all risk management entries (with pagination)
 */
export async function getRiskManagement(
  params?: RiskManagementListParams
): Promise<ApiResponse<RiskManagementListResponse>> {
  try {
    const data = await http.get(adminRoutes.riskManagement.list, {
      query: params as Record<string, string | number | undefined>,
    }) as RiskManagementListResponse;
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
 * Get risk management entry by ID
 */
export async function getRiskManagementById(
  id: string | number
): Promise<ApiResponse<RiskManagement>> {
  try {
    const data = await http.get(adminRoutes.riskManagement.getById(id)) as RiskManagement;
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
 * Create risk management entry
 */
export async function createRiskManagement(
  payload: CreateRiskManagementPayload
): Promise<ApiResponse<RiskManagement>> {
  try {
    const data = await http.post(adminRoutes.riskManagement.create, payload) as RiskManagement;
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
 * Update risk management entry
 */
export async function updateRiskManagement(
  id: string | number,
  payload: UpdateRiskManagementPayload
): Promise<ApiResponse<RiskManagement>> {
  try {
    const data = await http.put(adminRoutes.riskManagement.update(id), payload) as RiskManagement;
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
 * Delete risk management entry (returns 204 No Content per REST API standard)
 */
export async function deleteRiskManagement(id: string | number): Promise<ApiResponse<void>> {
  try {
    const response = await http.delete(adminRoutes.riskManagement.delete(id));
    
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

/**
 * Get risk types
 */
export async function getRiskTypes(): Promise<ApiResponse<RiskTypesResponse>> {
  try {
    const data = await http.get(adminRoutes.riskManagement.types) as RiskTypesResponse;
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

