/**
 * Currency API Service
 * 
 * Centralized API calls for currency management
 * All currency-related API calls should be defined here
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';
import type { CursorPaginationMeta } from '@/lib/types/pagination';
import { normalizeToCursorListEnvelope } from '@/lib/utils/normalize-cursor-list';

// Currency types matching the actual API response structure
export interface Currency {
  id: string;
  code: string;
  value: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CurrencyListParams {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CurrencyListResponse {
  success: boolean;
  data: Currency[];
  meta: CursorPaginationMeta | null;
  message?: string;
}

/**
 * Get all currencies (with pagination and sorting)
 */
export async function getCurrencies(
  params?: CurrencyListParams
): Promise<ApiResponse<CurrencyListResponse>> {
  try {
    const raw = await http.get(adminRoutes.master.currency.list, {
      query: params as Record<string, string | number | boolean | null | undefined>,
    });
    const normalized = normalizeToCursorListEnvelope<Currency>(raw);
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
