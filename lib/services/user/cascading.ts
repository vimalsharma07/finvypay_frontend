'use client';

import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';

export interface UserCascadingRule {
  id: string;
  userId?: string;
  merchantProfileId?: string;
  connectorId?: string;
  connector?: {
    id: string | number;
    userId?: string | number;
    merchantProfileId?: string | number;
    acquirerId?: number;
    acquirerAccountId?: number;
    name?: string;
    terminalId?: string;
    description?: string;
    status?: number;
    adminRejectReason?: string;
    merchantRejectReason?: string;
    rates?: Record<string, string>;
    ratesPdfUrl?: string;
    currencyCode?: string;
    ratesType?: string;
    isActive?: boolean;
    isPrimary?: boolean;
    secretKey?: string;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  config: Array<{ merchantAcquirerAccountId?: string; merchantAcquirerAccountName?: string }>;
  name: string;
  duration?: string | null;
  type?: string | null;
  availedAt?: string | null;
  status: boolean;
  priority: number;
  currentMid?: string | null;
  byAdmin?: boolean;
  cascadingFor?: number | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCascadingListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface UserCascadingListResponse {
  success: boolean;
  data: UserCascadingRule[] | { data: UserCascadingRule[]; meta?: UserCascadingListMeta };
  meta?: UserCascadingListMeta;
  message?: string;
}

const getBaseUrl = () => '/merchant/cascading';

export async function getUserMerchantCascading(
  params?: Record<string, any>
): Promise<ApiResponse<UserCascadingListResponse>> {
  try {
    const data = await http.get(getBaseUrl(), {
      query: params as Record<string, string | number | boolean | null | undefined>,
    }) as UserCascadingListResponse;
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

export async function updateUserMerchantCascadingStatus(
  cascadingId: string,
  status: boolean
): Promise<ApiResponse<{ success: boolean; message?: string }>> {
  try {
    const data = await http.put(`${getBaseUrl()}/${cascadingId}/status`, {
      status,
    }) as { success: boolean; message?: string };
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

export async function deleteUserMerchantCascading(
  cascadingId: string
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.delete(`${getBaseUrl()}/${cascadingId}`) as {
      success: boolean;
      message: string;
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

export async function createUserMerchantCascading(
  payload: {
    name: string;
    merchantProfileId: number;
    merchantAcquirerAccountId: number;
    type: string;
    duration?: string;
    cascadingFor: number;
    status: boolean;
    config: Array<{
      merchantAcquirerAccountId: string;
      merchantAcquirerAccountName: string;
    }>;
  }
): Promise<ApiResponse<{ success: boolean; message: string; data?: any }>> {
  try {
    const data = await http.post(getBaseUrl(), payload) as {
      success: boolean;
      message: string;
      data?: any;
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

export async function getUserMerchantCascadingById(
  cascadingId: string
): Promise<ApiResponse<{ success: boolean; data: UserCascadingRule; message?: string }>> {
  try {
    const data = await http.get(`${getBaseUrl()}/${cascadingId}`) as {
      success: boolean;
      data: UserCascadingRule;
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
      };
    }
    throw error;
  }
}

export async function updateUserMerchantCascading(
  cascadingId: string,
  payload: {
    name: string;
    merchantAcquirerAccountId: number;
    type: string;
    duration?: string;
    cascadingFor: number;
    status: boolean;
    config: Array<{
      merchantAcquirerAccountId: string;
      merchantAcquirerAccountName: string;
    }>;
  }
): Promise<ApiResponse<{ success: boolean; message: string; data?: any }>> {
  try {
    const data = await http.put(`${getBaseUrl()}/${cascadingId}/update`, payload) as {
      success: boolean;
      message: string;
      data?: any;
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


