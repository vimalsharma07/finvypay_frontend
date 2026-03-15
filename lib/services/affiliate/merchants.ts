/**
 * Affiliate Merchants API Service
 *
 * Fetches merchants referred by the logged-in affiliate.
 */

import { http, ApiError } from '../../api';
import { affiliateRoutes } from '../../routes/affiliate';
import type { ApiResponse } from '../types';

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
  referralPartnerCommission: number | null;
  createdAt: string;
  updatedAt: string;
  rates?: AffiliateMerchantRates | null;
}

/** API list response shape */
export interface AffiliateMerchantListResponse {
  success: boolean;
  data: AffiliateMerchant[];
}

/**
 * Get list of merchants for the current affiliate
 */
export async function getAffiliateMerchants(): Promise<
  ApiResponse<AffiliateMerchantListResponse>
> {
  try {
    const data = (await http.get(affiliateRoutes.merchant.list)) as AffiliateMerchantListResponse;
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
