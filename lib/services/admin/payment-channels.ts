/**
 * Payment Channels API Service
 * 
 * Centralized API calls for payment channels management
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';

// Payment Channel types matching the API response structure
export interface PaymentChannelGateway {
  id: number | string;
  gatewayName: string;
  fileName: string;
  status: string;
}

export interface PaymentChannel {
  id: number | string;
  gatewayId: number | string;
  gateway: PaymentChannelGateway;
  name: string;
  currency: string;
  providerType: string;
  flowType: string;
  timezone: string;
  minTransactionAmount: string;
  maxTransactionAmount: string;
  perDaySuccessAmount: string;
  perDayCardLimit: number;
  perDayEmailLimit: number;
  perWeekCardLimit: number;
  perWeekEmailLimit: number;
  perMonthCardLimit: number;
  perMonthEmailLimit: number;
  dailyCardDeclineLimit: number;
  dailyEmailDeclineLimit: number;
  allowedCountries: string[];
  blockedCountries: string[];
  acceptedCardTypes: string[];
  config: Record<string, string>;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentChannelListParams {
  page?: number;
  limit?: number;
}

export interface PaymentChannelListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaymentChannelListData {
  data: PaymentChannel[];
  meta: PaymentChannelListMeta;
}

export interface PaymentChannelListResponse {
  success: boolean;
  data: PaymentChannelListData;
  message?: string;
}

export interface CreatePaymentChannelPayload {
  gatewayId: number | string;
  name: string;
  currency: string;
  providerType: string;
  flowType: string;
  timezone: string;
  minTransactionAmount: number;
  maxTransactionAmount: number;
  perDaySuccessAmount: number;
  perDayCardLimit: number;
  perDayEmailLimit: number;
  perWeekCardLimit: number;
  perWeekEmailLimit: number;
  perMonthCardLimit: number;
  perMonthEmailLimit: number;
  dailyCardDeclineLimit: number;
  dailyEmailDeclineLimit: number;
  allowedCountries: string[];
  blockedCountries: string[];
  acceptedCardTypes: string[];
  config: Record<string, string>;
}

export interface UpdatePaymentChannelPayload {
  gatewayId: number | string;
  name: string;
  currency: string;
  providerType: string;
  flowType: string;
  timezone: string;
  minTransactionAmount: number;
  maxTransactionAmount: number;
  perDaySuccessAmount: number;
  perDayCardLimit: number;
  perDayEmailLimit: number;
  perWeekCardLimit: number;
  perWeekEmailLimit: number;
  perMonthCardLimit: number;
  perMonthEmailLimit: number;
  dailyCardDeclineLimit: number;
  dailyEmailDeclineLimit: number;
  allowedCountries: string[];
  blockedCountries: string[];
  acceptedCardTypes: string[];
  config: Record<string, string>;
  status: string;
  descriptor?: string;
}

/**
 * Get all payment channels (with pagination)
 */
export async function getPaymentChannels(
  params?: PaymentChannelListParams
): Promise<ApiResponse<PaymentChannelListResponse>> {
  try {
    const data = await http.get(adminRoutes.paymentChannels.list, {
      query: params as Record<string, string | number | undefined>,
    }) as PaymentChannelListResponse;
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
 * Get payment channel by ID
 */
export async function getPaymentChannelById(
  id: string | number
): Promise<ApiResponse<PaymentChannel>> {
  try {
    const response = await http.get(adminRoutes.paymentChannels.getById(id)) as
      | {
          success: boolean;
          data: PaymentChannel;
        }
      | PaymentChannel;
    
    // Handle API response structure: { success: true, data: {...} }
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      const apiResponse = response as { success: boolean; data: PaymentChannel };
      if (apiResponse.success && apiResponse.data) {
        return {
          status: 200,
          data: apiResponse.data,
        };
      }
    }
    
    // Fallback: if response is directly the payment channel data
    if (response && typeof response === 'object' && 'id' in response && !('success' in response)) {
      return {
        status: 200,
        data: response as unknown as PaymentChannel,
      };
    }
    
    // Handle direct PaymentChannel object response
    return {
      status: 200,
      data: response as PaymentChannel,
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
 * Create payment channel
 */
export async function createPaymentChannel(
  payload: CreatePaymentChannelPayload
): Promise<ApiResponse<PaymentChannel>> {
  try {
    const data = await http.post(adminRoutes.paymentChannels.create, payload) as PaymentChannel;
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
 * Update payment channel
 */
export async function updatePaymentChannel(
  id: string | number,
  payload: UpdatePaymentChannelPayload
): Promise<ApiResponse<PaymentChannel>> {
  try {
    const data = await http.put(adminRoutes.paymentChannels.update(id), payload) as PaymentChannel;
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
 * Delete payment channel
 */
export async function deletePaymentChannel(
  id: string | number
): Promise<ApiResponse<{ success: boolean; message?: string }>> {
  try {
    const data = await http.delete(adminRoutes.paymentChannels.delete(id)) as {
      success: boolean;
      message?: string;
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

