'use client';

import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';

export interface UserAcquirerRequest {
  id: string;
  merchantId?: string;
  merchantProfileId?: string;
  merchantProfile?: {
    id: string;
    merchantProfileName?: string;
    isPrimary?: boolean;
    industryId?: string;
  };
  acquirerAccountId?: string;
  acquirerAccount?: {
    id: string;
    name?: string;
    currencyCode?: string;
    currency?: string;
    terminalId?: string;
    rates?: Record<string, string | number>;
  };
  acceptedPaymentMethods?: string[];
  processingCurrency?: string[];
  status?: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserAcquirerRequestListMeta {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface UserAcquirerRequestListResponse {
  success: boolean;
  data: UserAcquirerRequest[] | { data: UserAcquirerRequest[]; meta?: UserAcquirerRequestListMeta };
  meta?: UserAcquirerRequestListMeta;
  message?: string;
}

const getBaseUrl = () => '/merchant/acquirer-requests';

export async function getUserAcquirerRequests(
  params?: Record<string, any>
): Promise<ApiResponse<UserAcquirerRequestListResponse>> {
  try {
    const data = await http.get(getBaseUrl(), {
      query: params as Record<string, string | number | boolean | null | undefined>,
    }) as UserAcquirerRequestListResponse;
    return { status: 200, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: error.status, error: error.message, data: error.data };
    }
    throw error;
  }
}

export async function createUserAcquirerRequest(
  payload: {
    merchantProfileId: number | string;
    acquirerAccountId: number | string;
    acceptedPaymentMethods: string[];
    processingCurrency: string[];
    description?: string;
  }
): Promise<ApiResponse<{ success: boolean; message?: string }>> {
  try {
    const data = await http.post(getBaseUrl(), {
      ...payload,
    }) as { success: boolean; message?: string };
    return { status: 201, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: error.status, error: error.message, data: error.data };
    }
    throw error;
  }
}


