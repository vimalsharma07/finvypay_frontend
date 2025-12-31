'use client';

import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';

export interface UserAcquirerAccount {
  id: string;
  merchantProfileId?: string;
  merchantProfile?: {
    id: string;
    merchantProfileName?: string;
    isPrimary?: boolean;
    industry?: { id?: string; name?: string };
  };
  acquirerId?: number;
  acquirer?: { id: number; name?: string; iconUrl?: string | null };
  acquirerAccountId?: number;
  acquirerAccount?: { id: number; name?: string; currency?: string };
  name: string;
  terminalId?: string;
  description?: string | null;
  status?: number;
  rates?: Record<string, string | number>;
  ratesPdfUrl?: string | null;
  currencyCode?: string | null;
  ratesType?: string | null;
  isActive?: boolean;
  isPrimary?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserAcquirerAccountListMeta {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface UserAcquirerAccountListResponse {
  success: boolean;
  data: UserAcquirerAccount[] | { data: UserAcquirerAccount[]; meta?: UserAcquirerAccountListMeta };
  meta?: UserAcquirerAccountListMeta;
  message?: string;
}

const getBaseUrl = () => '/merchant/acquirer-accounts';

export async function getUserAcquirerAccounts(
  params?: Record<string, any>
): Promise<ApiResponse<UserAcquirerAccountListResponse>> {
  try {
    const data = await http.get(getBaseUrl(), {
      query: params as Record<string, string | number | boolean | null | undefined>,
    }) as UserAcquirerAccountListResponse;
    return { status: 200, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: error.status, error: error.message, data: error.data };
    }
    throw error;
  }
}


