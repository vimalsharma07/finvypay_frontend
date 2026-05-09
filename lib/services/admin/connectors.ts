/**
 * Connectors (Merchant Acquirer Accounts) API Service
 * 
 * Centralized API calls for connector/merchant acquirer account management
 */

import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';
import type { CursorPaginationMeta } from '@/lib/types/pagination';

// Merchant Acquirer Account types
export interface MerchantAcquirerAccount {
  id: string;
  userId: number;
  merchantProfileId: number | null;
  acquirerId: number | null;
  acquirerAccountId: number | null;
  name: string;
  customName?: string | null;
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
    acquirerName: string;
    name?: string; // For backward compatibility
  };
  acquirerAccount?: {
    id: number;
    name: string;
    currency: string;
    providerType: string;
    flowType: string;
  };
  merchantProfile?: {
    id: number | string;
    merchantProfileName?: string;
    industryId?: number | string;
    industry?: {
      id: number | string;
      name: string;
      status?: string;
      isDeleted?: boolean;
    };
  };
  industryName?: string; // Top-level field from API response
  binEnabled?: boolean; // User-level security setting
  createdAt: string;
  updatedAt: string;
}

export type MerchantAcquirerAccountListMeta = CursorPaginationMeta;

export interface MerchantAcquirerAccountListResponse {
  success: boolean;
  data: MerchantAcquirerAccount[];
  meta?: MerchantAcquirerAccountListMeta;
  message?: string;
}

const getBaseUrl = () => {
  return `/admin/merchant-acquirer-account`;
};

/**
 * Get all connectors (merchant acquirer accounts) for a user
 */
export async function getUserConnectors(
  params?: Record<string, any>
): Promise<ApiResponse<MerchantAcquirerAccountListResponse>> {
  try {
    const baseUrl = getBaseUrl();
    // Keep all params including userId and merchantProfileId as query parameters
    const queryParams = params;
    
    const data = await http.get(baseUrl, {
      query: queryParams as Record<string, string | number | boolean | null | undefined>,
    }) as MerchantAcquirerAccountListResponse;
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
 * Get connector by ID
 */
export async function getConnectorById(
  connectorId: string
): Promise<ApiResponse<{ success: boolean; data: MerchantAcquirerAccount }>> {
  try {
    const data = await http.get(`${getBaseUrl()}/${connectorId}`) as {
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

