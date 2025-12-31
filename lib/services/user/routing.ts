import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';

export interface UserRouteRule {
  id: string;
  name: string;
  viewRoute?: string;
  connectorId?: string | number | null;
  merchantConnector?: {
    id: string;
    name: string;
  };
  status: boolean;
  isCascade: boolean;
  priority: number;
  routingFor: string;
  config: any;
  splitEnable: boolean;
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

