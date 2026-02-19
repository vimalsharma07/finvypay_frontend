/**
 * User - Transaction API Service
 * 
 * Centralized API calls for user transaction operations
 */

import { http, ApiError } from '../../api';
import { userTransactionRoutes } from '../../routes/user/transaction-routes';
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
  merchantProfileId: string | null;
  acquirerId: string | null;
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
  profileId?: number; // Merchant Profile ID for filtering
  /** Search by transactionId, orderId, or email (partial match) */
  search?: string;
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
    const response = await http.get(userTransactionRoutes.production, {
      query: params as Record<string, string | number | undefined>,
    }) as TransactionListResponse;
    
    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
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
    const response = await http.get(userTransactionRoutes.sandbox, {
      query: params as Record<string, string | number | undefined>,
    }) as TransactionListResponse;
    
    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

