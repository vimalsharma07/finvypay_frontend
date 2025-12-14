/**
 * Currency API Service
 * 
 * Centralized API calls for currency management
 * All currency-related API calls should be defined here
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';

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
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CurrencyListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CurrencyListData {
  data: Currency[];
  meta: CurrencyListMeta;
}

export interface CurrencyListResponse {
  success: boolean;
  data: CurrencyListData;
  message?: string;
}

/**
 * Get all currencies (with pagination and sorting)
 */
export async function getCurrencies(
  params?: CurrencyListParams
): Promise<ApiResponse<CurrencyListResponse>> {
  try {
    const data = await http.get(adminRoutes.master.currency.list, {
      query: params as Record<string, string | number | boolean | null | undefined>,
    }) as CurrencyListResponse;
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
