/**
 * User Settlements API Service
 * 
 * Centralized API calls for user settlements management
 * All user settlements-related API calls should be defined here
 */

import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';

export interface UserSettlement {
  id: string;
  invoiceNumber: string;
  settlementDate: string;
  settlementStartDate: string;
  settlementEndDate: string;
  grossAmount: string;
  grossAmountUsd: string;
  totalDeductions: string;
  totalDeductionsUsd: string;
  netAmount: string;
  netAmountUsd: string;
  settlementFee: string;
  settlementFeeAmount: string;
  paidAmount: string;
  totalSuccessCount: number;
  totalDeclineCount: number;
  totalRefundCount: number;
  totalChargebackCount: number;
  isPaid: boolean;
  paidAt: string | null;
  createdAt: string;
}

export interface UserSettlementListParams {
  page?: number;
  limit?: number;
}

export interface UserSettlementListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserSettlementListResponse {
  success: boolean;
  data: UserSettlement[];
  meta: UserSettlementListMeta;
  message?: string;
}

/**
 * Get all settlements for the authenticated user (with pagination)
 */
export async function getUserSettlements(
  params?: UserSettlementListParams
): Promise<ApiResponse<UserSettlementListResponse>> {
  try {
    const data = await http.get('/merchant/settlements', {
      query: params as Record<string, string | number | undefined>,
    }) as UserSettlementListResponse;
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

export interface UserSettlementDetail {
  id: string;
  invoiceNumber: string;
  settlementDate: string;
  settlementStartDate: string;
  settlementEndDate: string;
  grossAmount: string;
  grossAmountUsd: string;
  totalDeductions: string;
  totalDeductionsUsd: string;
  netAmount: string;
  netAmountUsd: string;
  settlementFee: string;
  settlementFeeAmount: string;
  paidAmount: string;
  totalSuccessCount: number;
  totalDeclineCount: number;
  totalRefundCount: number;
  totalChargebackCount: number;
  isPaid: boolean;
  paidAt: string | null;
  createdAt: string;
}

export interface UserSettlementDetailResponse {
  success: boolean;
  data: UserSettlementDetail;
  message?: string;
}

export interface UserSettlementDetailItem {
  id: string;
  acquirerAccountName: string;
  currency: string;
  totalSuccessCount: number;
  totalSuccessAmount: string;
  totalSuccessAmountUsd: string;
  totalDeclineCount: number;
  mdrRate: string;
  mdrAmount: string;
  mdrAmountUsd: string;
  rollingReserveRate: string;
  rollingReserveAmount: string;
  rollingReserveAmountUsd: string;
  successTransactionFee: string;
  successTransactionFeeAmount: string;
  declineTransactionFee: string;
  declineTransactionFeeAmount: string;
  refundCount: number;
  refundFeeAmount: string;
  refundTransactionAmount: string;
  chargebackCount: number;
  chargebackFeeAmount: string;
  chargebackTransactionAmount: string;
  netAmount: string;
  netAmountUsd: string;
  merchantAcquirerAccount?: {
    id: string;
    name: string;
    terminalId: string;
    currencyCode: string;
    status: number;
    isActive: boolean;
  };
}

export interface UserSettlementDetailsResponse {
  success: boolean;
  data: UserSettlementDetailItem[];
  message?: string;
}

/**
 * Get settlement detail by ID for the authenticated user
 */
export async function getUserSettlementById(
  id: string | number
): Promise<ApiResponse<UserSettlementDetailResponse>> {
  try {
    const data = await http.get(`/merchant/settlements/${id}`) as UserSettlementDetailResponse;
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
 * Get settlement details (by acquirer account) for a settlement
 */
export async function getUserSettlementDetails(
  id: string | number
): Promise<ApiResponse<UserSettlementDetailsResponse>> {
  try {
    const data = await http.get(`/merchant/settlements/${id}/details`) as UserSettlementDetailsResponse;
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

export interface UserSettlementBalance {
  transactionDate: string;
  openingBalance: string;
  netAmount: string;
  payoutAmount: string;
  closingBalance: string;
  isPayoutCompleted: boolean;
}

export interface UserSettlementBalanceListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface UserSettlementBalanceListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserSettlementBalanceListResponse {
  success: boolean;
  data: UserSettlementBalance[];
  meta: UserSettlementBalanceListMeta;
  message?: string;
}

/**
 * Get balance history for the authenticated user (with pagination)
 */
export async function getUserSettlementBalanceHistory(
  params?: UserSettlementBalanceListParams
): Promise<ApiResponse<UserSettlementBalanceListResponse>> {
  try {
    const data = await http.get('/merchant/settlements/balance-history', {
      query: params as Record<string, string | number | undefined>,
    }) as UserSettlementBalanceListResponse;
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

export interface UserSettlementSummary {
  totalSettlements: number;
  paidSettlements: number;
  pendingSettlements: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
}

export interface UserSettlementSummaryResponse {
  success: boolean;
  data: UserSettlementSummary;
  message?: string;
}

/** Single row from GET /merchant/settlements/summary (list) */
export interface UserSettlementSummaryItem {
  id: string;
  user?: { name: string };
  transaction_date: string;
  opening_balance: number;
  net_amount: number;
  payout_amount: number;
  closing_balance: number;
  payout_date: string | null;
  is_payout_completed: boolean;
}

export interface UserSettlementSummaryListResponse {
  success: boolean;
  data: UserSettlementSummaryItem[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

export interface UserSettlementBalanceData {
  currentBalance: string;
  lastUpdated: string;
  isPayoutPending: boolean;
}

export interface UserSettlementBalanceResponse {
  success: boolean;
  data: UserSettlementBalanceData;
  message?: string;
}

/**
 * Get settlement summary for the authenticated user (legacy aggregate)
 */
export async function getUserSettlementSummary(): Promise<ApiResponse<UserSettlementSummaryResponse>> {
  try {
    const data = await http.get('/merchant/settlements/summary') as UserSettlementSummaryResponse;
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
 * Get settlement summary list for the authenticated merchant (with optional pagination)
 */
export async function getUserSettlementSummaryList(params?: {
  page?: number;
  limit?: number;
}): Promise<ApiResponse<UserSettlementSummaryListResponse>> {
  try {
    const query: Record<string, string | number | undefined> = {};
    if (params?.page != null) query.page = params.page;
    if (params?.limit != null) query.limit = params.limit;
    const data = await http.get('/merchant/settlements/summary', {
      query: Object.keys(query).length ? query : undefined,
    }) as UserSettlementSummaryListResponse;
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
 * Get current settlement balance for the authenticated user
 */
export async function getUserSettlementBalance(): Promise<ApiResponse<UserSettlementBalanceResponse>> {
  try {
    const data = await http.get('/merchant/settlements/balance') as UserSettlementBalanceResponse;
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

