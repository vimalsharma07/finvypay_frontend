/**
 * Routing API Service
 * 
 * Centralized API calls for routing management
 */

import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';

// Route Rule types
export interface RouteRule {
  id: string;
  name: string;
  view_route: string;
  connector_id: string | null;
  connectorId?: string | null;
  status: boolean;
  is_cascade: boolean;
  priority: number;
  routing_for: string;
  config: any;
  split_enable: boolean;
  split_config: any;
  split_type: string | null;
  is_success_transaction: boolean;
  merchantConnector?: {
    id: string;
    name: string;
    customName?: string | null;
    custom_name?: string | null;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface RouteRuleListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface RouteRuleListResponse {
  success: boolean;
  data: RouteRule[] | { data: RouteRule[]; meta?: RouteRuleListMeta };
  meta?: RouteRuleListMeta;
  message?: string;
}

export interface CreateRouteRulePayload {
  // Backend primary fields
  name: string;
  routingFor: string;
  config: any[];
  merchantProfileId: number;
  merchantAcquirerAccountId: number;
  splitEnable?: boolean;
  // Legacy/compat fields (still accepted)
  routing_for?: string;
  profile_id?: number;
  split_enable?: boolean;
  split_type?: string;
  split_config?: any;
}

export interface UpdateRouteRulePayload extends CreateRouteRulePayload {
  id: string;
}

const getBaseUrl = (userId: string, profileId?: string | number) => {
  if (profileId !== undefined && profileId !== null) {
    return `/user-management/${userId}/routing/profile/${profileId}`;
  }
  return `/user-management/${userId}/routing`;
};

/**
 * Get all routing rules for a user (optionally scoped to a profile/industry)
 */
export async function getUserRoutings(
  userId: string,
  params?: Record<string, any>,
  profileId?: string | number
): Promise<ApiResponse<RouteRuleListResponse>> {
  try {
    const data = await http.get(getBaseUrl(userId, profileId), {
      query: params as Record<string, string | number | boolean | null | undefined>,
    }) as RouteRuleListResponse;
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
 * Get routing rule by ID
 */
export async function getUserRoutingById(
  userId: string,
  routingId: string
): Promise<ApiResponse<{ success: boolean; data: RouteRule }>> {
  try {
    const data = await http.get(`${getBaseUrl(userId)}/${routingId}`) as {
      success: boolean;
      data: RouteRule;
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
 * Create a new routing rule
 */
export async function createUserRouting(
  userId: string,
  payload: CreateRouteRulePayload
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
 * Update a routing rule
 */
export async function updateUserRouting(
  userId: string,
  routingId: string,
  payload: UpdateRouteRulePayload
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.put(`${getBaseUrl(userId)}/${routingId}/update`, {
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
 * Delete a routing rule
 */
export async function deleteUserRouting(
  userId: string,
  routingId: string
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.delete(`${getBaseUrl(userId)}/${routingId}`) as {
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
 * Update routing rule status
 */
export async function updateUserRoutingStatus(
  userId: string,
  routingId: string,
  status: boolean
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.put(`${getBaseUrl(userId)}/${routingId}/status`, {
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
 * Update routing rule cascade status
 */
export async function updateUserRoutingCascade(
  userId: string,
  routingId: string,
  isCascade: boolean
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.put(`${getBaseUrl(userId)}/${routingId}/cascade`, {
      is_cascade: isCascade,
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
 * Update routing rule priority
 */
export async function updateUserRoutingPriority(
  userId: string,
  routePriorityList: Array<{ id: string; priority: number }>,
  userProfileId?: number
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const payload: Record<string, unknown> = {
      route_priority_list: routePriorityList.map(({ id, priority }) => ({
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

