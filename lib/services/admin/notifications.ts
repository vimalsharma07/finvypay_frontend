/**
 * Admin Notifications API Service
 * 
 * Centralized API calls for admin notification operations
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';
import type { CursorPaginationMeta } from '@/lib/types/pagination';
import { coerceCursorMeta, extractListRows } from '@/lib/utils/normalize-cursor-list';

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
  cursor?: string;
  limit?: number;
  includeDeleted?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export type NotificationListMeta = CursorPaginationMeta & { unreadCount: number };

function coerceNotificationMeta(raw: unknown): NotificationListMeta | null {
  const base = coerceCursorMeta(raw);
  if (!base || raw == null || typeof raw !== 'object') return null;
  const m = raw as Record<string, unknown>;
  return {
    ...base,
    unreadCount: Number(m.unreadCount ?? 0),
  };
}

export interface NotificationListResponse {
  success: boolean;
  data: Notification[];
  meta: NotificationListMeta;
  message?: string;
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
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
    const raw = await http.get(adminRoutes.notifications.list, {
      query: {
        ...(params?.cursor ? { cursor: params.cursor } : {}),
        ...(params?.limit != null ? { limit: params.limit } : {}),
        ...(params?.includeDeleted !== undefined
          ? { includeDeleted: params.includeDeleted }
          : {}),
        ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
        ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
      },
    }) as NotificationListResponse & Record<string, unknown>;

    const rows = extractListRows<Notification>(raw);
    const listData = Array.isArray(raw.data) ? raw.data : rows;
    const meta =
      coerceNotificationMeta(raw.meta) ??
      ({
        itemsPerPage: params?.limit ?? 20,
        hasNextPage: false,
        hasPreviousPage: false,
        nextCursor: null,
        totalCount: listData.length,
        unreadCount: 0,
      } satisfies NotificationListMeta);

    return {
      status: 200,
      data: {
        success: raw.success !== false,
        data: listData,
        meta,
        message: raw.message,
      },
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
 * Get unread notification count for admin
 * 
 * @returns Promise with unread count response
 */
export async function getAdminUnreadCount(): Promise<ApiResponse<UnreadCountResponse>> {
  try {
    const data = await http.get(adminRoutes.notifications.unreadCount) as UnreadCountResponse;
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

