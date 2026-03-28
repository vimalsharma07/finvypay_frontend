/**
 * Affiliate Merchants API Service
 *
 * Fetches merchants referred by the logged-in affiliate (cursor-paginated).
 */

import { http, ApiError } from '../../api';
import { affiliateRoutes } from '../../routes/affiliate';
import type { ApiResponse } from '../types';
import type { CursorPaginationMeta } from '@/lib/types/pagination';

/** Merchant rates from API */
export interface AffiliateMerchantRates {
  defaultMdr: number;
  visaMdr: number;
  masterMdr: number;
  successTransactionFee: number;
  declinedTransactionFee: number;
  chargebackFee: number;
  refundFee: number;
  rollingReserve: number;
  flaggedFee: number;
  setupFee: number;
  minTxnAmount: number;
  maxTxnAmount: number;
}

/** Single merchant in affiliate merchant list response */
export interface AffiliateMerchant {
  id: string;
  name: string;
  email: string;
  role: string;
  uniqueId: string;
  isBlocked: boolean;
  kycStatus: string;
  referralPartnerId: number;
  referralPartnerCommission: string | null;
  createdAt: string;
  updatedAt: string;
  rates?: AffiliateMerchantRates | null;
}

export interface AffiliateMerchantListParams {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface AffiliateMerchantListResponse {
  success: boolean;
  data: AffiliateMerchant[];
  meta?: CursorPaginationMeta;
}

/**
 * List merchants for the current affiliate (RP) with cursor pagination.
 */
export async function getAffiliateMerchants(
  params?: AffiliateMerchantListParams
): Promise<ApiResponse<AffiliateMerchantListResponse>> {
  try {
    const data = (await http.get(affiliateRoutes.merchant.list, {
      query: params as Record<string, string | number | undefined>,
    })) as AffiliateMerchantListResponse;
    return {
      status: 200,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: undefined,
      };
    }
    throw error;
  }
}
