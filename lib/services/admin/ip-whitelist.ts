/**
 * IP Whitelist API Service
 * 
 * Centralized API calls for IP whitelist management
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';

// IP Whitelist types matching the API response structure
export interface IpWhitelistUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface IpWhitelist {
  id: string;
  userId: string;
  ip: string;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: IpWhitelistUser;
}

export interface IpWhitelistListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface IpWhitelistListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface IpWhitelistListData {
  data: IpWhitelist[];
  meta: IpWhitelistListMeta;
}

export interface IpWhitelistListResponse {
  success: boolean;
  data: IpWhitelistListData;
  message?: string;
}

export interface UpdateIpWhitelistStatusPayload {
  status: 'approved' | 'pending' | 'rejected';
}

export interface UpdateIpWhitelistPayload {
  ip: string;
}

export interface CreateIpWhitelistPayload {
  user_id: number | string;
  ips: string[];
}

/**
 * Get all IP whitelist entries (with pagination and sorting)
 */
export async function getIpWhitelist(
  params?: IpWhitelistListParams
): Promise<ApiResponse<IpWhitelistListResponse>> {
  try {
    const data = await http.get(adminRoutes.ipWhitelist.list, {
      query: params as Record<string, string | number | undefined>,
    }) as IpWhitelistListResponse;
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
 * Create IP whitelist entries
 */
export async function createIpWhitelist(
  payload: CreateIpWhitelistPayload
): Promise<ApiResponse<IpWhitelist[]>> {
  try {
    const data = await http.post(adminRoutes.ipWhitelist.create, payload) as IpWhitelist[];
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
 * Update IP whitelist entry
 */
export async function updateIpWhitelist(
  id: string | number,
  payload: UpdateIpWhitelistPayload
): Promise<ApiResponse<IpWhitelist>> {
  try {
    const data = await http.put(adminRoutes.ipWhitelist.update(id), payload) as IpWhitelist;
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
 * Update IP whitelist status
 */
export async function updateIpWhitelistStatus(
  id: string | number,
  payload: UpdateIpWhitelistStatusPayload
): Promise<ApiResponse<IpWhitelist>> {
  try {
    const data = await http.put(adminRoutes.ipWhitelist.updateStatus(id), payload) as IpWhitelist;
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
 * Delete IP whitelist entry (returns 204 No Content per REST API standard)
 */
export async function deleteIpWhitelist(id: string | number): Promise<ApiResponse<void>> {
  try {
    const response = await http.delete(adminRoutes.ipWhitelist.delete(id));
    
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

