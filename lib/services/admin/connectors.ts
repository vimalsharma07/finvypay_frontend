/**
 * Connectors (Merchant Gateways) API Service
 * 
 * Centralized API calls for connector/merchant gateway management
 */

import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';

// Merchant Gateway types
export interface MerchantGateway {
  id: string;
  userId: number;
  gatewayId: number | null;
  paymentChannelId: number | null;
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
  gateway?: {
    id: number;
    name: string;
  };
  paymentChannel?: {
    id: number;
    name: string;
    currency: string;
    providerType: string;
    flowType: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MerchantGatewayListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface MerchantGatewayListData {
  data: MerchantGateway[];
  meta: MerchantGatewayListMeta;
}

export interface MerchantGatewayListResponse {
  success: boolean;
  data: MerchantGatewayListData;
  message?: string;
}

const getBaseUrl = (userId?: string) => {
  if (userId) {
    return `/api/admin/user-management/${userId}/payment-channels`;
  }
  return `/api/admin/merchant-gateway`;
};

/**
 * Get all connectors (merchant gateways) for a user
 */
export async function getUserConnectors(
  params?: Record<string, any>
): Promise<ApiResponse<MerchantGatewayListResponse>> {
  try {
    const userId = params?.userId as string;
    const baseUrl = getBaseUrl(userId);
    // Remove userId from query params if using user-specific endpoint
    const queryParams = userId ? { ...params, userId: undefined } : params;
    
    const data = await http.get(baseUrl, {
      query: queryParams as Record<string, string | number | boolean | null | undefined>,
    }) as MerchantGatewayListResponse;
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
): Promise<ApiResponse<{ success: boolean; data: MerchantGateway }>> {
  try {
    const data = await http.get(`${getBaseUrl()}/${connectorId}`) as {
      success: boolean;
      data: MerchantGateway;
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

