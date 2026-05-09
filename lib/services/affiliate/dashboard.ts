/**
 * Affiliate Dashboard API Service
 *
 * Fetches dashboard statistics for the logged-in affiliate.
 * Optional from/to for date filtering; when omitted, no date filter is applied.
 */

import { http, ApiError } from '../../api';
import { affiliateRoutes } from '../../routes/affiliate';
import type { ApiResponse } from '../types';

export interface AffiliateTransactionStatistics {
  successCount: number;
  declineCount: number;
  chargebackCount: number;
  refundCount: number;
  successPercentage: number;
  declinePercentage: number;
  chargebackPercentage: number;
  refundPercentage: number;
  totalTransactions: number;
}

export interface AffiliateConnectorTransactionsSummary {
  connectorName?: string;
  successCount?: number;
  declineCount?: number;
  chargebackCount?: number;
  refundCount?: number;
  totalTransactions?: number;
  /** For trend chart: date (YYYY-MM-DD), transaction_count, amount_in_usd */
  date?: string;
  transaction_count?: number;
  amount_in_usd?: number;
  [key: string]: unknown;
}

export interface AffiliateDashboardData {
  transactionStatistics: AffiliateTransactionStatistics;
  connectorTransactionsSummary: AffiliateConnectorTransactionsSummary[];
}

export interface AffiliateDashboardResponse {
  success: boolean;
  data: AffiliateDashboardData;
  message?: string;
}

export interface AffiliateDashboardParams {
  from?: string;
  to?: string;
}

/**
 * Get affiliate dashboard data.
 * When from/to are omitted, no date filter is applied (backend returns all-time or default range).
 */
export async function getAffiliateDashboard(
  params?: AffiliateDashboardParams
): Promise<ApiResponse<AffiliateDashboardResponse>> {
  try {
    const query: Record<string, string> = {};
    if (params?.from) query.from = params.from;
    if (params?.to) query.to = params.to;

    const data = (await http.get(affiliateRoutes.dashboard.dashboard, {
      query: Object.keys(query).length > 0 ? query : undefined,
    })) as AffiliateDashboardResponse;
    return {
      status: 200,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status || 500,
        error: error.message,
        data: undefined,
      };
    }
    throw error;
  }
}
