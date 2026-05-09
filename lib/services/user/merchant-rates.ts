'use client';

import { http, ApiError } from '@/lib/api';
import { routes } from '@/lib/routes/routes';
import type { ApiResponse } from '../types';

export type MerchantRateStatus = 'approved' | 'rejected' | 'pending';

export interface MerchantRates {
  id: string;
  merchantId: string;
  defaultMdr: string;
  visaMdr: string;
  masterMdr: string;
  rollingReserve: string;
  successTransactionFee: string;
  declinedTransactionFee: string;
  chargebackFee: string;
  flaggedFee: string;
  setupFee: string;
  refundFee: string;
  status: MerchantRateStatus;
  rejectedReason: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantRatesResponse {
  success: boolean;
  message?: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
    };
    merchantRates: MerchantRates | null;
  };
}

export interface UpdateMerchantRatesStatusPayload {
  status: Exclude<MerchantRateStatus, 'pending'>;
}

export interface UpdateMerchantRatesStatusResponse {
  success: boolean;
  message?: string;
  data?: MerchantRates;
}

export async function getMerchantRates(): Promise<ApiResponse<MerchantRatesResponse>> {
  try {
    const response = await http.get(routes.merchant.rates.get) as MerchantRatesResponse;
    return {
      status: 200,
      data: response,
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

export async function updateMerchantRatesStatus(
  payload: UpdateMerchantRatesStatusPayload
): Promise<ApiResponse<UpdateMerchantRatesStatusResponse>> {
  try {
    const response = await http.put(routes.merchant.rates.updateStatus, payload) as UpdateMerchantRatesStatusResponse;
    return {
      status: 200,
      data: response,
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


