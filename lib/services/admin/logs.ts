/**
 * Admin Logs API Service
 * 
 * Centralized API calls for admin logs operations
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';
import type { CursorPaginationMeta } from '@/lib/types/pagination';

// Log entry types
export type LogType =
  | 'txn_logs'
  | 'webhook_logs'
  | 'provider_logs'
  | 'app_error_logs'
  | 'job_error_logs'
  | 'cron_error_logs'
  | 'admin_audit_logs';

// Base log entry interface - supports multiple response formats
export interface LogEntry {
  id: string;
  // Transaction log format fields
  transactionId?: string | null;
  transaction_id?: string | null; // API format
  order_id?: string | null;
  orderId?: string | null;
  status?: number;
  type?: string;
  payload?: Record<string, any> | null;
  response?: Record<string, any> | null;
  webhook?: Record<string, any> | null;
  /** Plain string or structured error (e.g. `{ name, message, stack }`) from some log APIs */
  error?: string | Record<string, unknown> | null;
  createdAt?: string;
  created_at?: string; // API format
  updatedAt?: string;
  updated_at?: string;
  // API log format fields
  user_id?: string | null;
  userId?: string | null;
  user_name?: string | null;
  userName?: string | null;
  user?: {
    id: string;
    name: string;
    email?: string;
    role?: string;
    [key: string]: any;
  } | null;
  // App error log format fields
  errorMessage?: string | null;
  errorContext?: string | null;
  adminId?: number | string | null;
  rpId?: number | string | null;
  // Admin audit log format fields
  admin?: {
    id: string;
    name: string;
    email?: string;
    role?: string;
    [key: string]: any;
  } | null;
  event?: string | null;
  details?: Record<string, any> | null;
  // Additional fields that might exist
  [key: string]: any;
}

export type LogListMeta = CursorPaginationMeta;

export interface LogListResponse {
  success: boolean;
  data: LogEntry[];
  meta: LogListMeta;
  message?: string;
}

export interface LogListParams {
  type: LogType;
  limit: number;
  cursor?: string;
  startDate?: string;
  endDate?: string;
  /** Filter by transaction_id (provider, transaction, and webhook logs) */
  transaction_id?: string;
  /** e.g. `production` — used by transaction & webhook log APIs to scope live vs sandbox */
  payment_mode?: string;
}

/**
 * Get logs by type
 * 
 * @param params - Log list parameters
 * @returns Promise with log list response
 */
export async function getAdminLogs(
  params: LogListParams
): Promise<ApiResponse<LogListResponse>> {
  try {
    const endpoint = adminRoutes.logs.logs({
      type: params.type,
      limit: params.limit,
      cursor: params.cursor,
      startDate: params.startDate,
      endDate: params.endDate,
      transactionId: params.transaction_id,
      paymentMode: params.payment_mode,
    });
    const data = await http.get(endpoint) as LogListResponse;

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

