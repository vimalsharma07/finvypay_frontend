/**
 * User/Merchant Reports API Service
 *
 * Centralized API calls for merchant/user reporting operations.
 * All report types use the same endpoint with different type parameter.
 */

import { http, ApiError } from '../../api';
import { routes } from '../../routes/routes';
import type { ApiResponse } from '../types';

// Merchant Turnover Report types (for backward compatibility)
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

/** Generic report response - data structure varies by report type */
export interface GenericReportResponse {
  success: boolean;
  data: unknown;
  message?: string;
}

/**
 * Get report by type (generic - works for all report types)
 *
 * @param type - Report type (e.g., merchant-turnover-report, merchant-transaction-report)
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Promise with report response
 */
export async function getReport(
  type: string,
  startDate: string,
  endDate: string
): Promise<ApiResponse<GenericReportResponse>> {
  try {
    const endpoint = routes.merchant.reports.reportByType(type, startDate, endDate);
    const data = (await http.get(endpoint)) as GenericReportResponse;

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
  const response = await getReport('merchant-turnover-report', startDate, endDate);
  return response as ApiResponse<MerchantTurnoverReportResponse>;
}

