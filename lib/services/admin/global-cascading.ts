/**
 * Global Cascading API Service
 * Admin-level global cascading rules (industry-scoped)
 */

import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';

export interface GlobalCascadingRule {
  id: string;
  name: string;
  type: string;
  duration?: string;
  config: any;
  status: boolean;
  priority: number;
  cascadingFor?: number;
  cascading_for?: number;
  industryId?: number;
  industry_id?: number;
  industry?: { id: number; name: string };
  globalAcquirerAccountId?: number | null;
  global_acquirer_account_id?: number | null;
  globalAcquirerAccount?: { id: number; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GlobalCascadingRuleListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GlobalCascadingRuleListResponse {
  success: boolean;
  data: GlobalCascadingRule[];
  meta?: GlobalCascadingRuleListMeta;
}

export interface CreateGlobalCascadingPayload {
  name: string;
  type: string;
  duration?: string;
  config: any[];
  industryId: number;
  globalAcquirerAccountId?: number;
  cascadingFor?: number;
  status?: boolean;
  priority?: number;
}

const BASE_URL = '/admin/global-cascading';

export async function getGlobalCascadings(
  params?: Record<string, any>
): Promise<ApiResponse<GlobalCascadingRuleListResponse>> {
  try {
    const data = await http.get(BASE_URL, {
      query: params as Record<string, string | number | boolean | null | undefined>,
    }) as GlobalCascadingRuleListResponse;
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

export async function getGlobalCascadingById(
  cascadingId: string
): Promise<ApiResponse<{ success: boolean; data: GlobalCascadingRule }>> {
  try {
    const data = await http.get(`${BASE_URL}/${cascadingId}`) as {
      success: boolean;
      data: GlobalCascadingRule;
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

export async function createGlobalCascading(
  payload: CreateGlobalCascadingPayload
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

export async function updateGlobalCascading(
  cascadingId: string,
  payload: Partial<CreateGlobalCascadingPayload>
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.put(`${BASE_URL}/${cascadingId}`, payload) as { success: boolean; message: string };
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

export async function deleteGlobalCascading(
  cascadingId: string
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.delete(`${BASE_URL}/${cascadingId}`) as { success: boolean; message: string };
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

export async function updateGlobalCascadingPriority(
  cascadingPriorityList: Array<{ id: number; priority: number }>
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.put(`${BASE_URL}/priority`, {
      route_priority_list: cascadingPriorityList,
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

export async function updateGlobalCascadingStatus(
  cascadingId: string,
  status: boolean
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.put(`${BASE_URL}/${cascadingId}/status`, { status }) as { success: boolean; message: string };
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
