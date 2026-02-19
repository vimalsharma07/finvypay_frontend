/**
 * Admin Dashboard API Service
 * 
 * Centralized API calls for admin dashboard operations
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';

// Dashboard response types
export interface UserCounters {
  totalAdmin: number;
  totalMerchant: number;
  totalAffiliate: number;
}

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

/** Per-connector (acquirer) success vs decline for Connector Performance section */
export interface ConnectorPerformanceItem {
  connector_name: string;
  success_amount_usd: number;
  success_count: number;
  decline_amount_usd: number;
  decline_count: number;
  success_percentage: number;
  decline_percentage: number;
}

export interface DashboardData {
  userCounters: UserCounters;
  transactionStatistics: TransactionStatistics;
  connectorTransactionsSummary: ConnectorTransactionsSummary[];
  connectorPerformance?: ConnectorPerformanceItem[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  message?: string;
}

/**
 * Get admin dashboard data
 * 
 * @param from - Start date in YYYY-MM-DD format
 * @param to - End date in YYYY-MM-DD format
 * @param merchantId - Optional merchant ID to filter by specific merchant
 * @returns Promise with dashboard response
 */
export async function getAdminDashboard(
  from: string,
  to: string,
  merchantId?: number
): Promise<ApiResponse<DashboardResponse>> {
  try {
    let endpoint = adminRoutes.dashboard.dashboard(from, to);
    if (merchantId) {
      endpoint += `&merchantId=${merchantId}`;
    }
    const data = await http.get(endpoint) as DashboardResponse;

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

