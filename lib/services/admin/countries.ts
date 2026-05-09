/**
 * Countries API Service
 * 
 * Centralized API calls for countries management
 * All countries-related API calls should be defined here
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';
import type { CursorPaginationMeta } from '@/lib/types/pagination';
import { normalizeToCursorListEnvelope } from '@/lib/utils/normalize-cursor-list';

// Country types matching the actual API response structure
export interface Country {
  id: string;
  countryName: string;
  local: string;
  phoneCode: string;
  isoTwo: string;
  isoThree: string;
  flag: string;
  currencyName: string;
  currencyCode: string;
  currencySymbol: string;
  continent: string;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CountryListParams {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CountryListResponse {
  success: boolean;
  data: Country[];
  meta: CursorPaginationMeta | null;
  message?: string;
}

export interface CountryResponse {
  success: boolean;
  data: Country;
  message?: string;
}

export interface CreateCountryPayload {
  countryName: string;
  local: string;
  phoneCode: string;
  isoTwo: string;
  isoThree: string;
  flag: string;
  currencyName: string;
  currencyCode: string;
  currencySymbol: string;
  continent: string;
  status: string;
}

export interface UpdateCountryPayload {
  countryName?: string;
  local?: string;
  phoneCode?: string;
  isoTwo?: string;
  isoThree?: string;
  flag?: string;
  currencyName?: string;
  currencyCode?: string;
  currencySymbol?: string;
  continent?: string;
  status?: string;
}

/**
 * Get all countries (with pagination and sorting)
 */
export async function getCountries(
  params?: CountryListParams
): Promise<ApiResponse<CountryListResponse>> {
  try {
    const raw = await http.get(adminRoutes.master.countries.list, {
      query: params as Record<string, string | number | boolean | null | undefined>,
    });
    const normalized = normalizeToCursorListEnvelope<Country>(raw);
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
 * Get country by ID
 */
export async function getCountryById(id: string): Promise<ApiResponse<Country>> {
  try {
    const response = await http.get(adminRoutes.master.countries.getById(id)) as
      | CountryResponse
      | Country;
    
    // Handle API response structure: { success: true, data: {...} }
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      const apiResponse = response as CountryResponse;
      if (apiResponse.success && apiResponse.data) {
        return {
          status: 200,
          data: apiResponse.data,
        };
      }
    }
    
    // Fallback: if response is directly the country data
    if (response && typeof response === 'object' && 'id' in response && !('success' in response)) {
      return {
        status: 200,
        data: response as unknown as Country,
      };
    }
    
    return {
      status: 0,
      error: 'Invalid response format',
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
 * Create country
 */
export async function createCountry(
  payload: CreateCountryPayload
): Promise<ApiResponse<Country>> {
  try {
    const response = await http.post(adminRoutes.master.countries.create, payload) as
      | CountryResponse
      | Country;
    
    // Handle API response structure: { success: true, data: {...} }
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      const apiResponse = response as CountryResponse;
      if (apiResponse.success && apiResponse.data) {
        return {
          status: 200,
          data: apiResponse.data,
        };
      }
    }
    
    // Fallback: if response is directly the country data
    if (response && typeof response === 'object' && 'id' in response && !('success' in response)) {
      return {
        status: 200,
        data: response as unknown as Country,
      };
    }
    
    return {
      status: 0,
      error: 'Invalid response format',
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
 * Update country
 */
export async function updateCountry(
  id: string,
  payload: UpdateCountryPayload
): Promise<ApiResponse<Country>> {
  try {
    const response = await http.put(adminRoutes.master.countries.update(id), payload) as
      | CountryResponse
      | Country;
    
    // Handle API response structure: { success: true, data: {...} }
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      const apiResponse = response as CountryResponse;
      if (apiResponse.success && apiResponse.data) {
        return {
          status: 200,
          data: apiResponse.data,
        };
      }
    }
    
    // Fallback: if response is directly the country data
    if (response && typeof response === 'object' && 'id' in response && !('success' in response)) {
      return {
        status: 200,
        data: response as unknown as Country,
      };
    }
    
    return {
      status: 0,
      error: 'Invalid response format',
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
 * Delete country
 */
export async function deleteCountry(id: string): Promise<ApiResponse<void>> {
  try {
    // DELETE requests return 204 No Content with no body
    const response = await http.delete(adminRoutes.master.countries.delete(id));
    
    // Check if response indicates 204 No Content
    if (response && typeof response === 'object' && (response as any).__noContent) {
      return {
        status: 204,
      };
    }
    
    // Fallback: if we get here and response is null/undefined, assume 204
    // (REST API standard for DELETE)
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
