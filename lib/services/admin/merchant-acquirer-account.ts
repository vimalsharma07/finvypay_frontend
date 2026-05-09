/**
 * Merchant Acquirer Account API Service
 * 
 * Centralized API calls for merchant acquirer account management
 */

import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';

// Merchant Acquirer Account types
export interface MerchantAcquirerAccount {
  id: string;
  userId: number;
  merchantProfileId: number | null;
  acquirerId: number | null;
  acquirerAccountId: number | null;
  name: string;
  terminalId: string | null;
  description: string | null;
  status: number; // 0 = rejected, 1 = approved, 2 = pending, 3 = rates assigned
  adminRejectReason: string | null;
  merchantRejectReason: string | null;
  rates: Record<string, any> | null;
  ratesPdfUrl: string | null;
  currencyCode: string | null;
  ratesType: string | null;
  isActive: boolean;
  isPrimary: boolean;
  isDeleted: boolean;
  acquirer?: {
    id: number;
    name: string;
  };
  acquirerAccount?: {
    id: number;
    name: string;
  };
  merchantProfile?: {
    id: number;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MerchantProfile {
  id: string;
  merchantProfileName: string;
  userId: string;
  industryId: string;
  industry: any;
  isPrimary: boolean;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface MerchantProfilesResponse {
  success: boolean;
  data: MerchantProfile[];
}

export interface CreateMerchantAcquirerAccountPayload {
  userId: number;
  acquirerId?: number;
  acquirerAccountId?: number;
  name?: string;
  description?: string;
  currencyCode?: string;
  rates?: Record<string, any>;
  ratesType?: string;
  userProfileId?: number;
  merchantProfileId?: number;
  paymentMethod?: string;
  providerId?: number;
  connectorId?: number;
  cryptoFlow?: number;
}

const getBaseUrl = () => {
  return `/admin/merchant-acquirer-account`;
};

/**
 * Create a new merchant acquirer account
 */
export async function createMerchantAcquirerAccount(
  payload: CreateMerchantAcquirerAccountPayload
): Promise<ApiResponse<{ success: boolean; message: string; data: MerchantAcquirerAccount }>> {
  try {
    const data = await http.post(getBaseUrl(), payload) as {
      success: boolean;
      message: string;
      data: MerchantAcquirerAccount;
    };
    return {
      status: 201,
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
    throw error;
  }
}

/**
 * Get merchant acquirer account by ID
 */
export async function getMerchantAcquirerAccountById(
  id: string
): Promise<ApiResponse<{ success: boolean; data: MerchantAcquirerAccount }>> {
  try {
    const data = await http.get(`${getBaseUrl()}/${id}`) as {
      success: boolean;
      data: MerchantAcquirerAccount;
    };
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
    throw error;
  }
}

/**
 * Get merchant profiles for a specific merchant
 */
export async function getMerchantProfiles(
  merchantId: string | number
): Promise<ApiResponse<MerchantProfilesResponse>> {
  try {
    const data = await http.get(`${getBaseUrl()}/merchant/${merchantId}/profiles`) as MerchantProfilesResponse;
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
    throw error;
  }
}
