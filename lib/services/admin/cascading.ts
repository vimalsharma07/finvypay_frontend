/**
 * Cascading API Service
 * 
 * Centralized API calls for cascading management
 */

import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';
import type { CursorPaginationMeta } from '@/lib/types/pagination';

// Cascading Rule types
export interface CascadingRule {
  id: string;
  name: string;
  connector_id?: string;
  connectorId?: string;
  connector?: {
    id: string;
    name: string;
    [key: string]: unknown;
  };
  type: string;
  duration?: string;
  config: Array<{
    connector_id?: string;
    connector_name?: string;
    merchantAcquirerAccountId?: string;
    merchantAcquirerAccountName?: string;
    number?: number;
    amount?: number;
    minutes?: string;
  }>;
  cascadeTo?: unknown;
  status: boolean;
  priority: number;
  cascading_for?: number;
  cascadingFor?: number;
  user_profile_id?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const CASCADING_FOR_LABELS: Record<number, string> = {
  1: 'Card',
  2: 'UPI',
  3: 'Crypto',
  4: 'APM',
};

export type CascadingRuleListMeta = CursorPaginationMeta;

export interface CascadingRuleListResponse {
  success: boolean;
  data: CascadingRule[];
  meta?: CascadingRuleListMeta;
  message?: string;
}

export interface CascadingConfigEntry {
  merchantAcquirerAccountId: string;
  merchantAcquirerAccountName: string;
}

export interface CreateCascadingRulePayload {
  name: string;
  merchantProfileId: number;
  merchantAcquirerAccountId: number;
  type: string;
  duration?: string;
  cascadingFor?: number;
  status?: boolean;
  config: CascadingConfigEntry[];
  // Legacy/compat fields
  profile_id?: number;
  connector_id?: string;
  cascading_for?: number;
}

export interface UpdateCascadingRulePayload extends CreateCascadingRulePayload {
  id: string;
}

const getBaseUrl = (userId: string, profileId?: string | number) => {
  if (profileId !== undefined && profileId !== null) {
    return `/user-management/${userId}/cascading/profile/${profileId}`;
  }
  return `/user-management/${userId}/cascading`;
};

/**
 * Get all cascading rules for a user
 */
export async function getUserCascadings(
  userId: string,
  params?: Record<string, any>,
  profileId?: string | number
): Promise<ApiResponse<CascadingRuleListResponse>> {
  try {
    const data = await http.get(getBaseUrl(userId, profileId), {
      query: params as Record<string, string | number | boolean | null | undefined>,
    }) as CascadingRuleListResponse;
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

/**
 * Get cascading rule by ID
 */
export async function getUserCascadingById(
  userId: string,
  cascadingId: string
): Promise<ApiResponse<{ success: boolean; data: CascadingRule }>> {
  try {
    const data = await http.get(`${getBaseUrl(userId)}/${cascadingId}`) as {
      success: boolean;
      data: CascadingRule;
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

/**
 * Create a new cascading rule
 */
export async function createUserCascading(
  userId: string,
  payload: CreateCascadingRulePayload
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.post(getBaseUrl(userId), {
      ...payload,
    }) as { success: boolean; message: string };
    return {
      status: 201,
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

/**
 * Update a cascading rule
 */
export async function updateUserCascading(
  userId: string,
  cascadingId: string,
  payload: UpdateCascadingRulePayload
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.put(`${getBaseUrl(userId)}/${cascadingId}`, {
      ...payload,
    }) as { success: boolean; message: string };
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

/**
 * Delete a cascading rule
 */
export async function deleteUserCascading(
  userId: string,
  cascadingId: string
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.delete(`${getBaseUrl(userId)}/${cascadingId}`) as {
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

/**
 * Update cascading rule status
 */
export async function updateUserCascadingStatus(
  userId: string,
  cascadingId: string,
  status: boolean
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.put(`${getBaseUrl(userId)}/${cascadingId}/status`, {
      status,
    }) as { success: boolean; message: string };
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

/**
 * Update cascading rule priority
 */
export async function updateUserCascadingPriority(
  userId: string,
  cascadingPriorityList: Array<{ id: string; priority: number }>,
  userProfileId?: number
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const payload: Record<string, unknown> = {
      cascading_priority_list: cascadingPriorityList.map(({ id, priority }) => ({
        id: typeof id === 'string' ? parseInt(id, 10) : id,
        priority,
      })),
    };
    if (userProfileId !== undefined) {
      payload.user_profile_id = userProfileId;
    }
    const data = await http.put(`${getBaseUrl(userId)}/priority`, payload) as { success: boolean; message: string };
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

