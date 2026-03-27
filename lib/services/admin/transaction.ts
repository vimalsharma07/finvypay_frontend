/**
 * Transaction API Service
 * 
 * Centralized API calls for transaction operations
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';

/** Transaction status enum – display by name in UI, send ID in API */
export enum TransactionStatus {
  PENDING = 0,
  SUCCESS = 1,
  FAILED = 2,
  BLOCKED = 3,
  ABANDONED = 4,
  REDIRECTED = 5,
}

/** Options for advance filter: label = display name, value = status ID for API */
export const TRANSACTION_STATUS_FILTER_OPTIONS = [
  { label: 'Pending', value: TransactionStatus.PENDING },
  { label: 'Success', value: TransactionStatus.SUCCESS },
  { label: 'Failed', value: TransactionStatus.FAILED },
  { label: 'Blocked', value: TransactionStatus.BLOCKED },
  { label: 'Abandoned', value: TransactionStatus.ABANDONED },
  { label: 'Redirected', value: TransactionStatus.REDIRECTED },
] as const;

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
  merchantProfileId: string | null;
  /** Merchant profile label (e.g. igaming, peptide) for the profile used on this transaction */
  merchantProfileName?: string | null;
  profileId: string | null;
  connectorId: string | null;
  gatewayId: string;
  /** Backend PaymentSource enum string, e.g. api | payment_link */
  paymentSource?: string | null;
  orderId: string;
  acquirerId?: number;
  acquirerName?: string | null;
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
  /** Search by transactionId, orderId, or email (partial match) */
  search?: string;
  /** Advance filter params (production & sandbox) */
  userId?: string;
  orderId?: string;
  cardBin?: string;
  currency?: string;
  country?: string;
  refundDateStart?: string;
  refundDateEnd?: string;
  message?: string;
  transactionId?: string;
  email?: string;
  connector?: string;
  status?: string;
  transactionDateStart?: string;
  transactionDateEnd?: string;
  chargebackDateStart?: string;
  chargebackDateEnd?: string;
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

/**
 * Resend merchant webhook for a production transaction (admin).
 * Uses public transaction id (e.g. TXN-20240101-ABC123).
 */
export async function resendTransactionWebhook(
  transactionId: string,
  sandbox: boolean = false
): Promise<ApiResponse<TransactionActionResponse>> {
  try {
    const data = await http.post(
      adminRoutes.transactions.resendWebhook(transactionId, sandbox),
      {}
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

