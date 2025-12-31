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
    name?: string;
    terminalId?: string;
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


