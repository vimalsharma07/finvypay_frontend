'use client';

import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';
import type { CursorPaginationMeta } from '@/lib/types/pagination';
import { normalizeToCursorListEnvelope } from '@/lib/utils/normalize-cursor-list';

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
  processingVolume?: string | number;
  acceptedPaymentMethods?: string[];
  processingCurrency?: string[];
  status?: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type UserAcquirerRequestListMeta = CursorPaginationMeta;

export interface UserAcquirerRequestListParams {
  cursor?: string;
  limit?: number;
  status?: string;
}

export interface UserAcquirerRequestListResponse {
  success: boolean;
  data: UserAcquirerRequest[];
  meta: UserAcquirerRequestListMeta | null;
  message?: string;
}

const getBaseUrl = () => '/merchant/acquirer-requests';

export async function getUserAcquirerRequests(
  params?: UserAcquirerRequestListParams,
): Promise<ApiResponse<UserAcquirerRequestListResponse>> {
  try {
    const raw = await http.get(getBaseUrl(), {
      query: params as Record<string, string | number | boolean | null | undefined>,
    });
    const normalized = normalizeToCursorListEnvelope<UserAcquirerRequest>(raw);
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
      return { status: error.status, error: error.message, data: error.data };
    }
    throw error;
  }
}

export interface CreateAcquirerRequestPayload {
  merchantProfileId: number;
  processingVolume: number;
  acceptedPaymentMethods: string[];
  processingCurrency: string[];
  description?: string;
}

export async function createUserAcquirerRequest(
  payload: CreateAcquirerRequestPayload
): Promise<ApiResponse<{ success: boolean; message?: string }>> {
  try {
    const data = await http.post(getBaseUrl(), payload) as { success: boolean; message?: string };
    return { status: 201, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: error.status, error: error.message, data: error.data };
    }
    throw error;
  }
}


