'use client';

import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';
import type { CursorPaginationMeta } from '@/lib/types/pagination';
import { normalizeToCursorListEnvelope } from '@/lib/utils/normalize-cursor-list';

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

export type PaymentLinksListMeta = CursorPaginationMeta;

export interface PaymentLinksListParams {
  cursor?: string;
  limit?: number;
  status?: string;
  search?: string;
  includeDeleted?: boolean;
}

export interface PaymentLinksListResponse {
  success: boolean;
  data: PaymentLink[];
  meta: PaymentLinksListMeta | null;
  message?: string;
}

const getBaseUrl = () => '/merchant/payment-link';

export async function getUserPaymentLinks(
  params?: PaymentLinksListParams,
): Promise<ApiResponse<PaymentLinksListResponse>> {
  try {
    const raw = await http.get(getBaseUrl(), {
      query: params as Record<string, string | number | boolean | null | undefined>,
    });
    const normalized = normalizeToCursorListEnvelope<PaymentLink>(raw);
    return {
      status: 200,
      data: {
        success: normalized.success,
        data: normalized.data,
        meta: normalized.meta,
      },
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

export async function updateUserPaymentLink(
  paymentLinkId: string,
  payload: {
    name: string;
    amount: number;
    currency: string;
    expiryValidity: string;
  }
): Promise<ApiResponse<{ success: boolean; message: string; data?: any }>> {
  try {
    const data = await http.put(`${getBaseUrl()}/${paymentLinkId}`, payload) as {
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

