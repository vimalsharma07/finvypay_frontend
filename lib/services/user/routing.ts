import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';

export interface UserRouteRule {
  id: string;
  userId?: string;
  merchantProfileId?: string;
  connectorId?: string | number | null;
  merchantConnector?: {
    id: string;
    userId?: string;
    merchantProfileId?: string;
    acquirerId?: number;
    acquirerAccountId?: number;
    name: string;
    terminalId?: string;
    description?: string;
    status?: number;
    adminRejectReason?: string | null;
    merchantRejectReason?: string | null;
    rates?: any;
    ratesPdfUrl?: string | null;
    currencyCode?: string;
    ratesType?: string;
    isActive?: boolean;
    isPrimary?: boolean;
    secretKey?: string;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  name: string;
  viewRoute?: string;
  priority?: number;
  status: boolean;
  isCascade?: boolean;
  routingFor: string;
  config: Array<{
    category: string;
    operator: string;
    value: string | number;
  }>;
  splitEnable: boolean;
  splitConfig?: any;
  splitType?: string | null;
  isSuccessTransaction?: boolean;
  byAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserRouteRuleListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface UserRouteRuleListResponse {
  success: boolean;
  data: UserRouteRule[];
  meta?: UserRouteRuleListMeta;
  message?: string;
}

const getBaseUrl = () => '/merchant/routing';

export async function getUserMerchantRoutings(
  params?: Record<string, any>
): Promise<ApiResponse<UserRouteRuleListResponse>> {
  try {
    const data = await http.get(getBaseUrl(), {
      query: params as Record<string, string | number | boolean | null | undefined>,
    }) as UserRouteRuleListResponse;
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

export async function deleteUserMerchantRouting(
  routingId: string
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.delete(`${getBaseUrl()}/${routingId}`) as {
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

export async function getUserMerchantRoutingById(
  routingId: string
): Promise<ApiResponse<{ success: boolean; data: UserRouteRule; message?: string }>> {
  try {
    const data = await http.get(`${getBaseUrl()}/${routingId}`) as {
      success: boolean;
      data: UserRouteRule;
      message?: string;
    };
    return { status: 200, data };
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

export async function createUserMerchantRouting(
  payload: {
    name: string;
    routingFor: string;
    merchantProfileId: number;
    merchantAcquirerAccountId: number;
    config: Array<{
      category: string;
      operator: string;
      value: string | number;
    }>;
    splitEnable: boolean;
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

export async function updateUserMerchantRouting(
  routingId: string,
  payload: {
    name: string;
    routingFor: string;
    merchantAcquirerAccountId: number;
    config: Array<{
      category: string;
      operator: string;
      value: string | number;
    }>;
    splitEnable: boolean;
  }
): Promise<ApiResponse<{ success: boolean; message: string; data?: any }>> {
  try {
    const data = await http.put(`${getBaseUrl()}/${routingId}/update`, payload) as {
      success: boolean;
      message: string;
      data?: any;
    };
    return { status: 200, data };
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

