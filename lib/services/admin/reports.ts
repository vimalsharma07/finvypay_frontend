/**
 * Admin Reports API Service
 * 
 * Centralized API calls for admin reporting operations
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';

// Merchant Turnover Report types
export interface MerchantTurnoverReportItem {
  date: string;
  success_amount: number;
  success_count: number;
  declined_amount: number;
  declined_count: number;
  success_percentage: number;
}

export interface MerchantTurnoverReportResponse {
  success: boolean;
  data: MerchantTurnoverReportItem[];
  message?: string;
}

export interface ReportParams {
  type: string;
  start_date: string;
  end_date: string;
}

/**
 * Get merchant turnover report
 * 
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Promise with merchant turnover report response
 */
export async function getMerchantTurnoverReport(
  startDate: string,
  endDate: string
): Promise<ApiResponse<MerchantTurnoverReportResponse>> {
  try {
    const endpoint = adminRoutes.reports.merchantTurnover(startDate, endDate);
    const data = await http.get(endpoint) as MerchantTurnoverReportResponse;

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

