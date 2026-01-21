/**
 * Merchant Dashboard API Service
 * 
 * Centralized API calls for merchant dashboard operations
 */

import { http, ApiError } from '../../api';
import { routes } from '../../routes/routes';
import type { ApiResponse } from '../types';

// Dashboard response types
export interface TransactionStatistics {
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

export interface ConnectorTransactionsSummary {
  connectorName?: string;
  successCount?: number;
  declineCount?: number;
  chargebackCount?: number;
  refundCount?: number;
  totalTransactions?: number;
  [key: string]: unknown;
}

export interface MerchantDashboardData {
  transactionStatistics: TransactionStatistics;
  connectorTransactionsSummary: ConnectorTransactionsSummary[];
}

export interface MerchantDashboardResponse {
  success: boolean;
  data: MerchantDashboardData;
  message?: string;
}

/**
 * Get merchant dashboard data
 * 
 * @param from - Start date in YYYY-MM-DD format
 * @param to - End date in YYYY-MM-DD format
 * @returns Promise with dashboard response
 */
export async function getMerchantDashboard(
  from: string,
  to: string
): Promise<ApiResponse<MerchantDashboardResponse>> {
  try {
    const endpoint = routes.merchant.dashboard.dashboard(from, to);
    const data = await http.get(endpoint) as MerchantDashboardResponse;

    return {
      status: 200,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status || 500,
        error: error.message,
      };
    }
    throw error;
  }
}

