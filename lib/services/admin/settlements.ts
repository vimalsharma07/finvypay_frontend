/**
 * Settlements API Service
 * 
 * Centralized API calls for settlements management
 * All settlements-related API calls should be defined here
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';
import type { CursorPaginationMeta } from '@/lib/types/pagination';

export interface SettlementUser {
  id: string;
  email: string;
  name: string;
  kycStatus: string;
}

export interface SettlementDetailMerchantAcquirerAccount {
  id: string;
  name: string;
  terminalId: string;
  status: number;
  currencyCode: string;
  isActive: boolean;
}

export interface SettlementDetail {
  id: string;
  merchantAcquirerAccountId: string;
  merchantAcquirerAccount: SettlementDetailMerchantAcquirerAccount;
  acquirerAccountName: string;
  acquirerCurrency: string;
  currency: string;
  totalSuccessCount: number;
  totalSuccessAmount: string;
  totalSuccessAmountUsd: string;
  totalDeclineCount: number;
  totalDeclineAmount: string;
  totalDeclineAmountUsd: string;
  totalCount: number;
  totalAmount: string;
  mdrRate: string;
  mdrAmount: string;
  mdrAmountUsd: string;
  rollingReserveRate: string;
  rollingReserveAmount: string;
  rollingReserveAmountUsd: string;
  successTransactionFee: string;
  successTransactionFeeAmount: string;
  successTransactionFeeAmountUsd: string;
  declineTransactionFee: string;
  declineTransactionFeeAmount: string;
  declineTransactionFeeAmountUsd: string;
  refundFee: string;
  refundFeeAmount: string;
  refundFeeAmountUsd: string;
  refundCount: number;
  refundTransactionAmount: string;
  refundTransactionAmountUsd: string;
  chargebackFee: string;
  chargebackFeeAmount: string;
  chargebackFeeAmountUsd: string;
  chargebackCount: number;
  chargebackTransactionAmount: string;
  chargebackTransactionAmountUsd: string;
  suspiciousFee: string;
  suspiciousFeeAmount: string;
  suspiciousFeeAmountUsd: string;
  suspiciousCount: number;
  suspiciousTransactionAmount: string;
  suspiciousTransactionAmountUsd: string;
  removedRefundCount: number;
  removedRefundAmount: string;
  removedRefundAmountUsd: string;
  removedChargebackCount: number;
  removedChargebackAmount: string;
  removedChargebackAmountUsd: string;
  removedSuspiciousCount: number;
  removedSuspiciousAmount: string;
  removedSuspiciousAmountUsd: string;
  netAmount: string;
  netAmountUsd: string;
}

export interface Settlement {
  id: string;
  userId: string;
  user: SettlementUser;
  invoiceNumber: string;
  userName: string;
  userEmail: string;
  settlementDate: string;
  settlementStartDate: string;
  settlementEndDate: string;
  disputesStartDate: string;
  disputesEndDate: string;
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
  totalSuspiciousCount: number;
  isPaid: boolean;
  paidAt: string | null;
  isDisplayToMerchant: boolean;
  type: string;
  remarks: string | null;
  pdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SettlementDetailResponse {
  id: string;
  userId: string;
  user: SettlementUser;
  invoiceNumber: string;
  userName: string;
  userEmail: string;
  settlementDate: string;
  settlementStartDate: string;
  settlementEndDate: string;
  disputesStartDate: string;
  disputesEndDate: string;
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
  totalSuspiciousCount: number;
  isPaid: boolean;
  paidAt: string | null;
  isDisplayToMerchant: boolean;
  type: string;
  remarks: string | null;
  pdfUrl: string | null;
  details: SettlementDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface SettlementDetailApiResponse {
  success: boolean;
  data: SettlementDetailResponse;
  message?: string;
}

export interface SettlementListParams {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  startDate?: string;
  endDate?: string;
}

export type SettlementListMeta = CursorPaginationMeta;

export interface SettlementListResponse {
  success: boolean;
  data: Settlement[];
  meta: SettlementListMeta;
  message?: string;
}

export interface MerchantBalance {
  id: string;
  userId: string;
  user: SettlementUser;
  transactionDate: string;
  openingBalance: string;
  netAmount: string;
  payoutAmount: string;
  closingBalance: string;
  settlementCharge: string;
  isPayoutCompleted: boolean;
  payoutDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantBalanceListParams {
  cursor?: string;
  limit?: number;
}

export interface MerchantBalanceListResponse {
  success: boolean;
  data: MerchantBalance[];
  meta: SettlementListMeta;
  message?: string;
}

export interface SettlementSummary {
  totalSettlements: number;
  paidSettlements: number;
  pendingSettlements: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
}

export interface SettlementSummaryResponse {
  success: boolean;
  data: SettlementSummary;
  message?: string;
}

/** Single row from GET /admin/settlements/summary (list) */
export interface SettlementSummaryItem {
  id: string;
  user: { name: string };
  transaction_date: string;
  opening_balance: number;
  net_amount: number;
  payout_amount: number;
  closing_balance: number;
  payout_date: string | null;
  is_payout_completed: boolean;
}

export interface SettlementSummaryListParams {
  userId?: string | number;
  cursor?: string;
  limit?: number;
}

export interface SettlementSummaryListResponse {
  success: boolean;
  data: SettlementSummaryItem[];
  meta: SettlementListMeta;
  message?: string;
}

export interface SettlementCalculationAcquirer {
  id: number;
  acquirerName: string;
  fileName: string;
  iconUrl: string | null;
  status: string;
  isDeleted: boolean;
}

export interface SettlementCalculationMerchantAcquirerAccount {
  id: string;
  name: string;
  terminalId: string;
  status: number;
  currencyCode: string;
  isActive: boolean;
}

export interface SettlementCalculation {
  id: string;
  userId: string;
  user: SettlementUser;
  acquirerId: number;
  acquirer: SettlementCalculationAcquirer;
  merchantAcquirerAccountId: string;
  merchantAcquirerAccount: SettlementCalculationMerchantAcquirerAccount;
  transactionDate: string;
  currency: string;
  cardType: number;
  totalSuccessCount: number;
  totalSuccessAmount: string;
  totalSuccessAmountUsd: string;
  totalDeclineCount: number;
  totalDeclineAmount: string;
  totalDeclineAmountUsd: string;
  totalCount: number;
  totalAmount: string;
  usdRate: string;
  mdrRate: string;
  mdrAmount: string;
  mdrAmountUsd: string;
  rollingReserveRate: string;
  rollingReserveAmount: string;
  rollingReserveAmountUsd: string;
  successTransactionFee: string;
  successTransactionFeeAmount: string;
  successTransactionFeeAmountUsd: string;
  declineTransactionFee: string;
  declineTransactionFeeAmount: string;
  declineTransactionFeeAmountUsd: string;
  refundFee: string;
  refundFeeAmount: string;
  refundFeeAmountUsd: string;
  refundTransactionAmount: string;
  refundTransactionAmountUsd: string;
  refundCount: number;
  chargebackFee: string;
  chargebackFeeAmount: string;
  chargebackFeeAmountUsd: string;
  chargebackTransactionAmount: string;
  chargebackTransactionAmountUsd: string;
  chargebackCount: number;
  suspiciousFee: string;
  suspiciousFeeAmount: string;
  suspiciousFeeAmountUsd: string;
  suspiciousTransactionAmount: string;
  suspiciousTransactionAmountUsd: string;
  suspiciousCount: number;
  removedRefundCount: number;
  removedRefundAmount: string;
  removedRefundAmountUsd: string;
  removedChargebackCount: number;
  removedChargebackAmount: string;
  removedChargebackAmountUsd: string;
  removedSuspiciousCount: number;
  removedSuspiciousAmount: string;
  removedSuspiciousAmountUsd: string;
  netAmount: string;
  netAmountUsd: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettlementCalculationListParams {
  cursor?: string;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface SettlementCalculationListResponse {
  success: boolean;
  data: SettlementCalculation[];
  meta: SettlementListMeta;
  message?: string;
}

/**
 * Get all settlements (with pagination and sorting)
 */
export async function getSettlements(
  params?: SettlementListParams
): Promise<ApiResponse<SettlementListResponse>> {
  try {
    const data = await http.get(adminRoutes.settlements.list, {
      query: params as Record<string, string | number | undefined>,
    }) as SettlementListResponse;
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
 * Get settlement by ID
 */
export async function getSettlementById(
  id: string | number
): Promise<ApiResponse<SettlementDetailApiResponse>> {
  try {
    const data = await http.get(adminRoutes.settlements.getById(id)) as SettlementDetailApiResponse;
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

export interface UpdateSettlementPayload {
  isPaid?: boolean;
  isDisplayToMerchant?: boolean;
  remarks?: string;
}

export interface UpdateSettlementResponse {
  success: boolean;
  data: SettlementDetailResponse;
  message?: string;
}

/**
 * Update settlement
 */
export async function updateSettlement(
  id: string | number,
  payload: UpdateSettlementPayload
): Promise<ApiResponse<UpdateSettlementResponse>> {
  try {
    const data = await http.put(adminRoutes.settlements.update(id), payload) as UpdateSettlementResponse;
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

export interface GenerateSettlementPayload {
  userId: number;
  startDate: string;
  endDate: string;
  disputesStartDate: string;
  disputesEndDate: string;
  type?: string;
  remarks?: string;
}

export interface GenerateSettlementResponse {
  success: boolean;
  data?: unknown;
  message?: string;
}

/**
 * Generate settlement
 */
export async function generateSettlement(
  payload: GenerateSettlementPayload
): Promise<ApiResponse<GenerateSettlementResponse>> {
  try {
    const data = await http.post(adminRoutes.settlements.generate, payload) as GenerateSettlementResponse;
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
 * Get merchant balances list (with pagination)
 */
export async function getMerchantBalances(
  params?: MerchantBalanceListParams
): Promise<ApiResponse<MerchantBalanceListResponse>> {
  try {
    const data = await http.get(adminRoutes.settlements.balancesList, {
      query: params as Record<string, string | number | undefined>,
    }) as MerchantBalanceListResponse;
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
 * Get settlement summary (legacy aggregate)
 */
export async function getSettlementSummary(): Promise<ApiResponse<SettlementSummaryResponse>> {
  try {
    const data = await http.get(adminRoutes.settlements.summary) as SettlementSummaryResponse;
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
 * Get settlement summary list (with optional userId filter and pagination)
 */
export async function getSettlementSummaryList(
  params?: SettlementSummaryListParams
): Promise<ApiResponse<SettlementSummaryListResponse>> {
  try {
    const query: Record<string, string | number | undefined> = {};
    if (params?.userId != null) query.userId = params.userId;
    if (params?.cursor != null) query.cursor = params.cursor;
    if (params?.limit != null) query.limit = params.limit;

    const data = await http.get(adminRoutes.settlements.summary, {
      query,
    }) as SettlementSummaryListResponse;
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
 * Get settlement calculations list (with pagination and optional date filter)
 */
export async function getSettlementCalculations(
  params?: SettlementCalculationListParams
): Promise<ApiResponse<SettlementCalculationListResponse>> {
  try {
    const query: Record<string, string | number | undefined> = {};
    if (params?.cursor != null) query.cursor = params.cursor;
    if (params?.limit != null) query.limit = params.limit;
    if (params?.startDate) query.startDate = params.startDate;
    if (params?.endDate) query.endDate = params.endDate;

    const data = await http.get(adminRoutes.settlements.calculationsList, {
      query,
    }) as SettlementCalculationListResponse;
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

