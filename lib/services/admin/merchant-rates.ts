'use client';

import { http, ApiError } from '@/lib/api';
import type { ApiResponse } from '../types';
import { merchantRatesRoutes } from '@/lib/routes/admin';

export interface MerchantRates {
  id?: string | number;
  merchantId: number;
  defaultMdr: number;
  visaMdr: number;
  masterMdr: number;
  rollingReserve: number;
  successTransactionFee: number;
  declinedTransactionFee: number;
  chargebackFee: number;
  flaggedFee: number;
  setupFee: number;
  refundFee: number;
}

export async function getMerchantRates(
  merchantId: string | number
): Promise<ApiResponse<{ success: boolean; message?: string; data: MerchantRates | null }>> {
  try {
    const data = await http.get(merchantRatesRoutes.getByMerchant(merchantId)) as {
      success: boolean;
      message?: string;
      data: MerchantRates | null;
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

export async function upsertMerchantRates(
  payload: MerchantRates
): Promise<ApiResponse<{ success: boolean; message?: string; data?: MerchantRates }>> {
  try {
    const data = await http.post(merchantRatesRoutes.upsert, payload) as {
      success: boolean;
      message?: string;
      data?: MerchantRates;
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


