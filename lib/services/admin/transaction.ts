/**
 * Transaction API Service
 * 
 * Centralized API calls for transaction operations
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';

// Transaction types matching the API response structure
export interface TransactionUser {
  id: string;
  name: string;
  email: string;
}

export interface Transaction {
  id: string;
  transactionId: string;
  userId: string;
  profileId: string | null;
  connectorId: string | null;
  gatewayId: string;
  orderId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  ipAddress: string;
  amount: string;
  currency: string;
  convertedAmount: string | null;
  convertedCurrency: string | null;
  amountInUsd: string;
  cardNumber: string | null;
  cardExpiryMonth: number | null;
  cardExpiryYear: number | null;
  cardType: number | null;
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
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  user: TransactionUser;
}

export interface TransactionListParams {
  page?: number;
  limit?: number;
}

export interface TransactionListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface TransactionListData {
  data: Transaction[];
  meta: TransactionListMeta;
}

export interface TransactionListResponse {
  success: boolean;
  data: TransactionListData;
  message?: string;
}

/**
 * Get production transactions (with pagination)
 */
export async function getProductionTransactions(
  params?: TransactionListParams
): Promise<ApiResponse<TransactionListResponse>> {
  try {
    const data = await http.get(adminRoutes.transactions.production, {
      query: params as Record<string, string | number | undefined>,
    }) as TransactionListResponse;
    return {
      status: 200,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
      };
    }
    return {
      status: 500,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Get sandbox transactions (with pagination)
 */
export async function getSandboxTransactions(
  params?: TransactionListParams
): Promise<ApiResponse<TransactionListResponse>> {
  try {
    const data = await http.get(adminRoutes.transactions.sandbox, {
      query: params as Record<string, string | number | undefined>,
    }) as TransactionListResponse;
    return {
      status: 200,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
      };
    }
    return {
      status: 500,
      error: 'An unexpected error occurred',
    };
  }
}

export interface ChargebackPayload {
  remark: string;
}

export interface RefundPayload {
  remark: string;
}

export interface SuspiciousPayload {
  remark: string;
}

export interface TransactionActionResponse {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * Process chargeback for a transaction
 */
export async function processChargeback(
  transactionId: string | number,
  payload: ChargebackPayload
): Promise<ApiResponse<TransactionActionResponse>> {
  try {
    const data = await http.post(
      adminRoutes.transactions.chargeback(transactionId),
      payload
    ) as TransactionActionResponse;
    return {
      status: 200,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
      };
    }
    return {
      status: 500,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Process refund for a transaction
 */
export async function processRefund(
  transactionId: string | number,
  payload: RefundPayload
): Promise<ApiResponse<TransactionActionResponse>> {
  try {
    const data = await http.post(
      adminRoutes.transactions.refund(transactionId),
      payload
    ) as TransactionActionResponse;
    return {
      status: 200,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
      };
    }
    return {
      status: 500,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Mark transaction as suspicious
 */
export async function markSuspicious(
  transactionId: string | number,
  payload: SuspiciousPayload
): Promise<ApiResponse<TransactionActionResponse>> {
  try {
    const data = await http.post(
      adminRoutes.transactions.suspicious(transactionId),
      payload
    ) as TransactionActionResponse;
    return {
      status: 200,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
      };
    }
    return {
      status: 500,
      error: 'An unexpected error occurred',
    };
  }
}

