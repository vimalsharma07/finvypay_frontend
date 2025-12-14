/**
 * Gateways API Service
 * 
 * Centralized API calls for gateway management
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';

// Gateway types matching the API response structure
export interface Gateway {
  id: number | string;
  gatewayName: string;
  fileName: string;
  fields: Record<string, string>;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GatewayListParams {
  page?: number;
  limit?: number;
}

export interface GatewayListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GatewayListData {
  data: Gateway[];
  meta: GatewayListMeta;
}

export interface GatewayListResponse {
  success: boolean;
  data: GatewayListData;
  message?: string;
}

export interface CreateGatewayPayload {
  gatewayName: string;
  fileName: string;
  fields: Record<string, string>;
}

export interface UpdateGatewayPayload {
  gatewayName: string;
  fileName: string;
  fields: Record<string, string>;
  status: string;
}

/**
 * Get all gateways (with pagination)
 */
export async function getGateways(
  params?: GatewayListParams
): Promise<ApiResponse<GatewayListResponse>> {
  try {
    const data = await http.get(adminRoutes.gateway.list, {
      query: params as Record<string, string | number | undefined>,
    }) as GatewayListResponse;
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
 * Create new gateway
 */
export async function createGateway(
  payload: CreateGatewayPayload
): Promise<ApiResponse<Gateway>> {
  try {
    const data = await http.post(adminRoutes.gateway.create, payload) as Gateway;
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
 * Get gateway by ID
 */
export async function getGatewayById(id: string | number): Promise<ApiResponse<Gateway>> {
  try {
    const response = await http.get(adminRoutes.gateway.getById(id)) as
      | {
          success: boolean;
          data: Gateway;
        }
      | Gateway;
    
    // Handle API response structure: { success: true, data: {...} }
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      const apiResponse = response as { success: boolean; data: Gateway };
      if (apiResponse.success && apiResponse.data) {
        return {
          status: 200,
          data: apiResponse.data,
        };
      }
    }
    
    // Fallback: if response is directly the gateway data
    if (response && typeof response === 'object' && 'id' in response && !('success' in response)) {
      return {
        status: 200,
        data: response as unknown as Gateway,
      };
    }
    
    // Handle direct Gateway object response
    return {
      status: 200,
      data: response as Gateway,
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
 * Update gateway
 */
export async function updateGateway(
  id: string | number,
  payload: UpdateGatewayPayload
): Promise<ApiResponse<Gateway>> {
  try {
    const data = await http.put(adminRoutes.gateway.update(id), payload) as Gateway;
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
 * Delete gateway
 */
export async function deleteGateway(id: string | number): Promise<ApiResponse<{ success: boolean; message?: string }>> {
  try {
    const data = await http.delete(adminRoutes.gateway.delete(id)) as { success: boolean; message?: string };
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

