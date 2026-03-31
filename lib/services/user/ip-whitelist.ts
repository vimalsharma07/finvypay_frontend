/**
 * User IP Whitelist API Service
 * 
 * Centralized API calls for user IP whitelist management
 */

import { http, ApiError } from '../../api';
import { userIpWhitelistRoutes } from '../../routes/user/ip-whitelist-routes';
import type { ApiResponse } from '../types';
import type { CursorPaginationMeta } from '@/lib/types/pagination';
import { normalizeToCursorListEnvelope } from '@/lib/utils/normalize-cursor-list';

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
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface IpWhitelistListResponse {
  success: boolean;
  data: IpWhitelist[];
  meta: CursorPaginationMeta | null;
  message?: string;
}

export interface UpdateIpWhitelistPayload {
  ip: string;
}

export interface CreateIpWhitelistPayload {
  ip: string[];
}

/**
 * Get user IP whitelist entries (with pagination and sorting)
 */
export async function getUserIpWhitelist(
  params?: IpWhitelistListParams
): Promise<ApiResponse<IpWhitelistListResponse>> {
  try {
    const raw = await http.get(userIpWhitelistRoutes.list, {
      query: params as Record<string, string | number | undefined>,
    });
    const normalized = normalizeToCursorListEnvelope<IpWhitelist>(raw);
    return {
      status: 200,
      data: {
        success: normalized.success,
        data: normalized.data,
        meta: normalized.meta,
      },
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
export async function createUserIpWhitelist(
  payload: CreateIpWhitelistPayload
): Promise<ApiResponse<IpWhitelist[]>> {
  try {
    const data = await http.post(userIpWhitelistRoutes.list, payload) as IpWhitelist[];
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
export async function updateUserIpWhitelist(
  id: string | number,
  payload: UpdateIpWhitelistPayload
): Promise<ApiResponse<IpWhitelist>> {
  try {
    const data = await http.put(userIpWhitelistRoutes.update(id), payload) as IpWhitelist;
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
export async function deleteUserIpWhitelist(id: string | number): Promise<ApiResponse<void>> {
  try {
    const response = await http.delete(userIpWhitelistRoutes.delete(id));
    
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

