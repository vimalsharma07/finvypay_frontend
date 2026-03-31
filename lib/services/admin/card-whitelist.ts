/**
 * Card Whitelist API Service
 * 
 * Centralized API calls for card whitelist management
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';
import type { CursorPaginationMeta } from '@/lib/types/pagination';
import { normalizeToCursorListEnvelope } from '@/lib/utils/normalize-cursor-list';

// Card Whitelist types matching the API response structure
export interface CardWhitelistUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface CardWhitelist {
  id: string;
  userId: string;
  card: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: CardWhitelistUser;
}

export interface CardWhitelistListParams {
  cursor?: string;
  limit?: number;
}

export interface CardWhitelistListResponse {
  success: boolean;
  data: CardWhitelist[];
  meta: CursorPaginationMeta | null;
  message?: string;
}

export interface UpdateCardWhitelistPayload {
  card: string;
}

export interface CreateCardWhitelistPayload {
  userId: number | string;
  card: string;
}

/**
 * Get all card whitelist entries (with pagination and sorting)
 */
export async function getCardWhitelist(
  params?: CardWhitelistListParams
): Promise<ApiResponse<CardWhitelistListResponse>> {
  try {
    const raw = await http.get(adminRoutes.cardWhitelist.list, {
      query: params as Record<string, string | number | undefined>,
    });
    const normalized = normalizeToCursorListEnvelope<CardWhitelist>(raw);
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
 * Get card whitelist entry by ID
 */
export async function getCardWhitelistById(
  id: string | number
): Promise<ApiResponse<CardWhitelist>> {
  try {
    const data = await http.get(adminRoutes.cardWhitelist.getById(id)) as CardWhitelist;
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
 * Create card whitelist entry
 */
export async function createCardWhitelist(
  payload: CreateCardWhitelistPayload
): Promise<ApiResponse<CardWhitelist>> {
  try {
    const data = await http.post(adminRoutes.cardWhitelist.create, payload) as CardWhitelist;
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
 * Update card whitelist entry
 */
export async function updateCardWhitelist(
  id: string | number,
  payload: UpdateCardWhitelistPayload
): Promise<ApiResponse<CardWhitelist>> {
  try {
    const data = await http.put(adminRoutes.cardWhitelist.update(id), payload) as CardWhitelist;
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
 * Delete card whitelist entry (returns 204 No Content per REST API standard)
 */
export async function deleteCardWhitelist(id: string | number): Promise<ApiResponse<void>> {
  try {
    const response = await http.delete(adminRoutes.cardWhitelist.delete(id));
    
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

