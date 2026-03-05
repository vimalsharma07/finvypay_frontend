/**
 * User - Support Ticket API Service
 * 
 * Centralized API calls for user support ticket operations
 */

import { http, ApiError } from '../../api';
import { userSupportTicketRoutes } from '../../routes/user/support-ticket-routes';
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
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
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
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
}

export interface CreateSupportTicketPayload {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  file?: File;
}

/**
 * Get all support tickets (with pagination)
 */
export async function getSupportTickets(
  params?: SupportTicketListParams
): Promise<ApiResponse<SupportTicketListResponse>> {
  try {
    const data = await http.get(userSupportTicketRoutes.list, {
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
 */
export async function getSupportTicketById(
  id: string | number
): Promise<ApiResponse<SupportTicket>> {
  try {
    const response = await http.get(userSupportTicketRoutes.getById(id)) as {
      success?: boolean;
      data?: SupportTicket;
    } | SupportTicket;
    
    // Handle response structure: { success: true, data: {...} } or direct SupportTicket
    let ticketData: SupportTicket;
    
    if (response && typeof response === 'object') {
      // Check if response has the wrapped structure { success: true, data: {...} }
      if ('success' in response && 'data' in response && response.data) {
        ticketData = response.data;
      } else if ('id' in response && 'title' in response) {
        // Direct SupportTicket structure
        ticketData = response as SupportTicket;
      } else {
        throw new Error('Invalid response structure');
      }
    } else {
      throw new Error('Invalid response structure');
    }
    
    return {
      status: 200,
      data: ticketData,
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
 * Create support ticket
 * Accepts FormData for file upload support
 */
export async function createSupportTicket(
  formData: FormData
): Promise<ApiResponse<SupportTicket>> {
  try {
    // http.post handles FormData automatically - apiFetch detects FormData and doesn't stringify it
    const response = await http.post(userSupportTicketRoutes.create, formData) as {
      success?: boolean;
      data?: SupportTicket;
    } | SupportTicket;
    
    // Handle response structure: { success: true, data: {...} } or direct SupportTicket
    let ticketData: SupportTicket;
    
    if (response && typeof response === 'object') {
      // Check if response has the wrapped structure { success: true, data: {...} }
      if ('success' in response && 'data' in response && response.data) {
        ticketData = response.data;
      } else if ('id' in response && 'title' in response) {
        // Direct SupportTicket structure
        ticketData = response as SupportTicket;
      } else {
        throw new Error('Invalid response structure');
      }
    } else {
      throw new Error('Invalid response structure');
    }
    
    return {
      status: 200,
      data: ticketData,
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
 * Update support ticket
 */
export async function updateSupportTicket(
  id: string | number,
  payload: UpdateSupportTicketPayload
): Promise<ApiResponse<SupportTicket>> {
  try {
    const data = await http.put(userSupportTicketRoutes.update(id), payload) as SupportTicket;
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
 * Delete support ticket (returns 204 No Content per REST API standard)
 */
export async function deleteSupportTicket(id: string | number): Promise<ApiResponse<void>> {
  try {
    const response = await http.delete(userSupportTicketRoutes.delete(id));
    
    if (response && typeof response === 'object' && (response as any).__noContent) {
      return {
        status: 204,
      };
    }
    
    return {
      status: 204,
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

