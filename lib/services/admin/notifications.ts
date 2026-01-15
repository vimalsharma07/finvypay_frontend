/**
 * Admin Notifications API Service
 * 
 * Centralized API calls for admin notification operations
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';

// Notification types matching the API response structure
export interface NotificationUser {
  id: string;
  email: string;
  name: string;
  role: string;
  [key: string]: any;
}

export interface NotificationMetadata {
  [key: string]: any;
  ratesId?: string;
  merchantId?: string;
}

export interface Notification {
  id: string;
  userId: string | null;
  user: NotificationUser | null;
  title: string;
  message: string;
  tag: string;
  type: 'info' | 'success' | 'warning' | 'error';
  eventKey: string;
  recipientRole: string;
  recipientId: string | null;
  severity: 'info' | 'success' | 'warning' | 'error';
  metadata: NotificationMetadata;
  isRead: boolean;
  readAt: string | null;
  relatedId: string | null;
  actionUrl: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface NotificationListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  unreadCount: number;
}

export interface NotificationListResponse {
  success: boolean;
  data: Notification[];
  meta: NotificationListMeta;
  message?: string;
}

/**
 * Get all notifications for admin
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns Promise with notification list response
 */
export async function getAdminNotifications(
  params?: NotificationListParams
): Promise<ApiResponse<NotificationListResponse>> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.includeDeleted !== undefined) {
      queryParams.append('includeDeleted', params.includeDeleted.toString());
    }
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = adminRoutes.notifications.list + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    const data = await http.get(endpoint) as NotificationListResponse;

    return {
      status: 200,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status || 500,
        error: error.message,
      };
    }
    throw error;
  }
}

/**
 * Mark a notification as read
 * 
 * @param id - Notification ID
 * @returns Promise with success response
 */
export async function markNotificationAsRead(
  id: string | number
): Promise<ApiResponse<{ success: boolean; message?: string }>> {
  try {
    const data = await http.put(adminRoutes.notifications.markAsRead(id));
    
    // Handle both standard API response format and direct response
    const responseData = data?.data || data || { success: true };
    
    return {
      status: 200,
      data: responseData as { success: boolean; message?: string },
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status || 500,
        error: error.message,
      };
    }
    throw error;
  }
}

/**
 * Mark all notifications as read
 * 
 * @returns Promise with success response
 */
export async function markAllNotificationsAsRead(): Promise<ApiResponse<{ success: boolean; message?: string }>> {
  try {
    const data = await http.put(adminRoutes.notifications.markAllAsRead);
    
    // Handle both standard API response format and direct response
    const responseData = data?.data || data || { success: true };
    
    return {
      status: 200,
      data: responseData as { success: boolean; message?: string },
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status || 500,
        error: error.message,
      };
    }
    throw error;
  }
}

/**
 * Delete a notification
 * 
 * @param id - Notification ID
 * @returns Promise with success response
 */
export async function deleteNotification(
  id: string | number
): Promise<ApiResponse<{ success: boolean; message?: string }>> {
  try {
    const data = await http.delete(adminRoutes.notifications.delete(id));
    return {
      status: 200,
      data: data as { success: boolean; message?: string },
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status || 500,
        error: error.message,
      };
    }
    throw error;
  }
}

