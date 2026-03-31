'use client';

import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';
import type { CursorPaginationMeta } from '@/lib/types/pagination';

export interface UserAcquirerAccount {
  id: string;
  customName?: string | null;
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

export type UserAcquirerAccountListMeta = CursorPaginationMeta;

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

const ACQUIRER_FILTER_MAX = 100;

/** Walk cursor pages for filter dropdowns */
export async function getAllUserAcquirerAccountsForFilter(): Promise<
  UserAcquirerAccount[]
> {
  const all: UserAcquirerAccount[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < ACQUIRER_FILTER_MAX; i++) {
    const res = await getUserAcquirerAccounts({
      limit: 100,
      ...(cursor ? { cursor } : {}),
    });
    if (res.status !== 200 || !res.data?.success) break;
    const raw = res.data.data;
    const rows = Array.isArray(raw) ? raw : [];
    all.push(...rows);
    const next = res.data.meta?.nextCursor;
    if (!next || rows.length === 0) break;
    cursor = next;
  }
  return all;
}

export async function updateAcquirerAccountCustomName(
  id: string | number,
  customName: string | null
): Promise<ApiResponse<{ success: boolean; data: { id: number; customName: string | null }; message?: string }>> {
  try {
    const data = await http.put(`${getBaseUrl()}/${id}/name`, {
      customName: customName || null,
    }) as { success: boolean; data: { id: number; customName: string | null }; message?: string };
    return { status: 200, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: error.status, error: error.message, data: error.data };
    }
    throw error;
  }
}


