'use client';

import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';

export interface PaymentLink {
  id: string;
  merchantId: string;
  name: string;
  link: string;
  amount: string;
  currency: string;
  expiryValidity: string;
  status: 'active' | 'inactive' | 'expired';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PaymentLinksListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaymentLinksListResponse {
  success: boolean;
  data: PaymentLink[] | { data: PaymentLink[]; meta?: PaymentLinksListMeta };
  meta?: PaymentLinksListMeta;
  message?: string;
}

const getBaseUrl = () => '/merchant/payment-link';

export async function getUserPaymentLinks(
  params?: Record<string, any>
): Promise<ApiResponse<PaymentLinksListResponse>> {
  try {
    const data = await http.get(getBaseUrl(), {
      query: params as Record<string, string | number | boolean | null | undefined>,
    }) as PaymentLinksListResponse;
    return {
      status: 200,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
      };
    }
    throw error;
  }
}

export async function deleteUserPaymentLink(
  paymentLinkId: string
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.delete(`${getBaseUrl()}/${paymentLinkId}`) as {
      success: boolean;
      message: string;
    };
    return {
      status: 200,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
      };
    }
    throw error;
  }
}

export async function createUserPaymentLink(
  payload: {
    name: string;
    amount: number;
    currency: string;
    expiryValidity: string;
  }
): Promise<ApiResponse<{ success: boolean; message: string; data?: any }>> {
  try {
    const data = await http.post(getBaseUrl(), payload) as {
      success: boolean;
      message: string;
      data?: any;
    };
    return {
      status: 200,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
      };
    }
    throw error;
  }
}

export async function getUserPaymentLinkById(
  paymentLinkId: string
): Promise<ApiResponse<{ success: boolean; data: PaymentLink; message?: string }>> {
  try {
    const data = await http.get(`${getBaseUrl()}/${paymentLinkId}`) as {
      success: boolean;
      data: PaymentLink;
      message?: string;
    };
    return {
      status: 200,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
      };
    }
    throw error;
  }
}

