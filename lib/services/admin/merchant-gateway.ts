/**
 * Merchant Gateway API Service
 * 
 * Centralized API calls for merchant gateway management
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
  status: number;
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
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateMerchantGatewayPayload {
  userId: number;
  gatewayId?: number;
  paymentChannelId?: number;
  name?: string;
  description?: string;
  currencyCode?: string;
  rates?: Record<string, any>;
  ratesType?: string;
  userProfileId?: number;
}

const getBaseUrl = () => {
  return `/api/admin/merchant-gateway`;
};

/**
 * Create a new merchant gateway
 */
export async function createMerchantGateway(
  payload: CreateMerchantGatewayPayload
): Promise<ApiResponse<{ success: boolean; message: string; data: MerchantGateway }>> {
  try {
    const data = await http.post(getBaseUrl(), { body: payload }) as {
      success: boolean;
      message: string;
      data: MerchantGateway;
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
 * Get merchant gateway by ID
 */
export async function getMerchantGatewayById(
  id: string
): Promise<ApiResponse<{ success: boolean; data: MerchantGateway }>> {
  try {
    const data = await http.get(`${getBaseUrl()}/${id}`) as {
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

