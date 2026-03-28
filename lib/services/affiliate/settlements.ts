/**
 * Affiliate settlements list (merchants linked to this RP)
 */

import { http, ApiError } from '../../api';
import { affiliateRoutes } from '../../routes/affiliate';
import type { ApiResponse } from '../types';
import type { CursorPaginationMeta } from '@/lib/types/pagination';

export interface AffiliateSettlementRow {
  id: number;
  invoiceNumber: string;
  userName: string | null;
  userEmail: string | null;
  settlementDate: string;
  grossAmountUsd: string | null;
  totalDeductionsUsd: string | null;
  netAmountUsd: string | null;
  paidAmount: string | null;
  isPaid: boolean;
  type: string;
  totalSuccessCount: number | null;
  createdAt: string;
}

export interface AffiliateSettlementListParams {
  cursor?: string;
  limit?: number;
  startDate?: string;
  endDate?: string;
  isPaid?: boolean;
  type?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface AffiliateSettlementListResponse {
  success: boolean;
  data: AffiliateSettlementRow[];
  meta?: CursorPaginationMeta;
  message?: string;
}

function normalizeRow(raw: Record<string, unknown>): AffiliateSettlementRow {
  const n = (v: unknown) =>
    v === null || v === undefined ? null : String(v);
  return {
    id: Number(raw.id),
    invoiceNumber: String(raw.invoiceNumber ?? ''),
    userName: raw.userName != null ? String(raw.userName) : null,
    userEmail: raw.userEmail != null ? String(raw.userEmail) : null,
    settlementDate: String(raw.settlementDate ?? ''),
    grossAmountUsd: n(raw.grossAmountUsd),
    totalDeductionsUsd: n(raw.totalDeductionsUsd),
    netAmountUsd: n(raw.netAmountUsd),
    paidAmount: n(raw.paidAmount),
    isPaid: Boolean(raw.isPaid),
    type: String(raw.type ?? ''),
    totalSuccessCount:
      raw.totalSuccessCount != null ? Number(raw.totalSuccessCount) : null,
    createdAt: String(raw.createdAt ?? ''),
  };
}

export async function getAffiliateSettlements(
  params?: AffiliateSettlementListParams
): Promise<ApiResponse<AffiliateSettlementListResponse>> {
  try {
    const data = (await http.get(affiliateRoutes.settlements.list, {
      query: params as Record<string, string | number | boolean | undefined>,
    })) as { success: boolean; data: Record<string, unknown>[]; meta?: CursorPaginationMeta };

    const list = Array.isArray(data.data)
      ? data.data.map((row) => normalizeRow(row))
      : [];

    return {
      status: 200,
      data: {
        success: data.success,
        data: list,
        meta: data.meta,
      },
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data as AffiliateSettlementListResponse | undefined,
      };
    }
    throw error;
  }
}
