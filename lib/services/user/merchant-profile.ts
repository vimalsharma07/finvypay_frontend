/**
 * Merchant Profile API Service
 * 
 * Centralized API calls for merchant profile operations
 */

import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';

// Merchant Profile types
export interface MerchantProfile {
  id: number;
  merchantProfileName: string;
  userId: number;
  industryId: number;
  isPrimary: boolean;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantProfileListResponse {
  success: boolean;
  data: MerchantProfile[];
  message?: string;
}

/**
 * Get all merchant profiles for the authenticated user
 */
export async function getMerchantProfiles(): Promise<ApiResponse<MerchantProfileListResponse>> {
  try {
    const data = await http.get('/merchant/profile/merchant-profiles');
    return {
      status: 200,
      data: data as MerchantProfileListResponse,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status || 500,
        error: error.message,
      };
    }
    throw error;
  }
}

/**
 * Get primary merchant profile for the authenticated user
 */
export async function getPrimaryMerchantProfile(): Promise<ApiResponse<MerchantProfile>> {
  try {
    const data = await http.get('/merchant/profile/merchant-profiles/primary');
    return {
      status: 200,
      data: data as MerchantProfile,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status || 500,
        error: error.message,
      };
    }
    throw error;
  }
}

