/**
 * Global Routing API Service
 * Admin-level global routing rules (industry-scoped)
 */

import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';

export interface GlobalRouteRule {
  id: string;
  name: string;
  viewRoute?: string;
  view_route?: string;
  status: boolean;
  isCascade?: boolean;
  is_cascade?: boolean;
  priority: number;
  routingFor?: string;
  routing_for?: string;
  config: any;
  splitEnable?: boolean;
  split_enable?: boolean;
  splitConfig?: any;
  split_config?: any;
  splitType?: string;
  split_type?: string;
  industryId?: number;
  industry_id?: number;
  industry?: { id: number; name: string };
  globalAcquirerAccountId?: number | null;
  global_acquirer_account_id?: number | null;
  globalAcquirerAccount?: { id: number; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GlobalRouteRuleListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GlobalRouteRuleListResponse {
  success: boolean;
  data: GlobalRouteRule[];
  meta?: GlobalRouteRuleListMeta;
}

export interface CreateGlobalRoutingPayload {
  name: string;
  config: any[];
  routingFor: string;
  industryId: number;
  splitEnable?: boolean;
  splitType?: string;
  splitConfig?: any;
  status?: boolean;
}

const BASE_URL = '/admin/global-routing';

export async function getGlobalRoutings(
  params?: Record<string, any>
): Promise<ApiResponse<GlobalRouteRuleListResponse>> {
  try {
    const data = await http.get(BASE_URL, {
      query: params as Record<string, string | number | boolean | null | undefined>,
    }) as GlobalRouteRuleListResponse;
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

export async function getGlobalRoutingById(
  routingId: string
): Promise<ApiResponse<{ success: boolean; data: GlobalRouteRule }>> {
  try {
    const data = await http.get(`${BASE_URL}/${routingId}`) as {
      success: boolean;
      data: GlobalRouteRule;
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

export async function createGlobalRouting(
  payload: CreateGlobalRoutingPayload
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.post(BASE_URL, payload) as { success: boolean; message: string };
    return { status: 201, data };
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

export async function updateGlobalRouting(
  routingId: string,
  payload: Partial<CreateGlobalRoutingPayload>
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.put(`${BASE_URL}/${routingId}`, payload) as { success: boolean; message: string };
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

export async function deleteGlobalRouting(
  routingId: string
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.delete(`${BASE_URL}/${routingId}`) as { success: boolean; message: string };
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

export async function updateGlobalRoutingPriority(
  routePriorityList: Array<{ id: number; priority: number }>
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.put(`${BASE_URL}/priority`, {
      route_priority_list: routePriorityList,
    }) as { success: boolean; message: string };
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

export async function updateGlobalRoutingStatus(
  routingId: string,
  status: boolean
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.put(`${BASE_URL}/${routingId}/status`, { status }) as { success: boolean; message: string };
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

export async function updateGlobalRoutingCascade(
  routingId: string,
  isCascade: boolean
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.put(`${BASE_URL}/${routingId}/cascade`, { is_cascade: isCascade }) as { success: boolean; message: string };
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
