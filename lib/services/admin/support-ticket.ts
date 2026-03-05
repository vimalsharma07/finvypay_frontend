/**
 * Support Ticket API Service
 * 
 * Centralized API calls for support ticket operations
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';

// Support Ticket types matching the API response structure
export interface SupportTicketUser {
  id: string;
  name: string;
  email: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  user: SupportTicketUser;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  filePath: string | null;
  s3Id: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

export interface SupportTicketListParams {
  page?: number;
  limit?: number;
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface SupportTicketListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface SupportTicketListData {
  items: SupportTicket[];
  meta: SupportTicketListMeta;
}

export interface SupportTicketListResponse {
  success: boolean;
  data: SupportTicketListData;
  message?: string;
}

export interface UpdateSupportTicketPayload {
  title?: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
}

/**
 * Get all support tickets (with pagination)
 */
export async function getSupportTickets(
  params?: SupportTicketListParams
): Promise<ApiResponse<SupportTicketListResponse>> {
  try {
    const data = await http.get(adminRoutes.supportTicket.list, {
      query: params as Record<string, string | number | undefined>,
    }) as SupportTicketListResponse;
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
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get support ticket by ID
 * Unwraps API response { success, data } so callers receive the ticket object directly.
 */
export async function getSupportTicketById(
  id: string | number
): Promise<ApiResponse<SupportTicket>> {
  try {
    const response = await http.get(adminRoutes.supportTicket.getById(id)) as
      | { success: boolean; data: SupportTicket }
      | SupportTicket;
    const data =
      response &&
      typeof response === 'object' &&
      'success' in response &&
      'data' in response
        ? (response as { success: boolean; data: SupportTicket }).data
        : (response as SupportTicket);
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
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update support ticket
 */
export async function updateSupportTicket(
  id: string | number,
  payload: UpdateSupportTicketPayload
): Promise<ApiResponse<SupportTicket>> {
  try {
    const data = await http.put(adminRoutes.supportTicket.update(id), payload) as SupportTicket;
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
        errors: error.data?.errors,
        message: error.data?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Close support ticket (admin)
 * Uses PATCH /admin/support-ticket/:id with status=CLOSED
 */
export async function closeSupportTicket(id: string | number): Promise<ApiResponse<SupportTicket>> {
  try {
    const response = await http.patch(
      adminRoutes.supportTicket.update(id),
      { status: 'CLOSED' }
    ) as { success?: boolean; data?: SupportTicket } | SupportTicket;

    const data =
      response && typeof response === 'object' && 'success' in response && 'data' in response
        ? (response as { success?: boolean; data?: SupportTicket }).data as SupportTicket
        : (response as SupportTicket);

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
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Reopen support ticket (admin)
 * Uses PATCH /admin/support-ticket/:id with status=OPEN
 */
export async function reopenSupportTicket(id: string | number): Promise<ApiResponse<SupportTicket>> {
  try {
    const response = await http.patch(
      adminRoutes.supportTicket.update(id),
      { status: 'OPEN' }
    ) as { success?: boolean; data?: SupportTicket } | SupportTicket;

    const data =
      response && typeof response === 'object' && 'success' in response && 'data' in response
        ? (response as { success?: boolean; data?: SupportTicket }).data as SupportTicket
        : (response as SupportTicket);

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
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

