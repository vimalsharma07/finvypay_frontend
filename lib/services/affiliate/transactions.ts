/**
 * Affiliate Transactions API Service
 *
 * Fetches RP (referral partner) merchant transactions for the logged-in affiliate.
 */

import { http, ApiError } from '../../api';
import { affiliateRoutes } from '../../routes/affiliate';
import type { ApiResponse } from '../types';

/** User nested in transaction */
export interface AffiliateTransactionUser {
  id: string;
  name: string;
  email: string;
}

/** Single transaction in affiliate RP merchants list (matches API response) */
export interface AffiliateTransaction {
  id: string;
  transactionId: string;
  userId: string;
  merchantProfileId: string;
  acquirerId: number;
  acquirerName: string | null;
  orderId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  ipAddress: string;
  amount: string;
  currency: string;
  convertedAmount: string;
  convertedCurrency: string;
  amountInUsd: string;
  cardNumber: string | null;
  cardExpiryMonth: number;
  cardExpiryYear: number;
  cardType: string;
  cardBin: string | null;
  isCardWl: boolean;
  status: number;
  transactionType: number;
  message: string;
  transactionDate: string;
  requestApi: string | null;
  riskBlocked: boolean;
  refundDate: string | null;
  refundReason: string | null;
  refundRemoveDate: string | null;
  chargebackDate: string | null;
  chargebackRemoveDate: string | null;
  suspiciousDate: string | null;
  suspiciousRemoveDate: string | null;
  webhookUrl: string | null;
  terminalId: string | null;
  gatewayId: string;
  paymentMode: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  user: AffiliateTransactionUser;
}

export interface AffiliateTransactionListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AffiliateTransactionListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  /** Accepted by API: transactionId, startDate, endDate, merchant_id, status */
  transactionId?: string;
  startDate?: string;
  endDate?: string;
  merchant_id?: string;
  status?: string;
}

export interface AffiliateTransactionListResponse {
  success: boolean;
  data: AffiliateTransaction[];
  meta: AffiliateTransactionListMeta;
}

/**
 * Get RP merchant transactions for the current affiliate
 */
export async function getAffiliateRpMerchantTransactions(
  params?: AffiliateTransactionListParams
): Promise<ApiResponse<AffiliateTransactionListResponse>> {
  try {
    const query = params as Record<string, string | number | boolean | null | undefined>;
    const data = (await http.get(affiliateRoutes.transactions.rpMerchants, {
      query,
    })) as AffiliateTransactionListResponse;
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
