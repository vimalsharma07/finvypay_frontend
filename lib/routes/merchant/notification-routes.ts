/**
 * Merchant - Notification Routes
 * All endpoints related to merchant notifications
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const merchantNotificationRoutes = {
  list: `${BASE_URL}/merchant/notifications`,
  getById: (id: string | number) => `${BASE_URL}/merchant/notifications/${id}`,
  unreadCount: `${BASE_URL}/merchant/notifications/unread/count`,
  markAsRead: (id: string | number) => `${BASE_URL}/merchant/notifications/${id}/read`,
  markAllAsRead: `${BASE_URL}/merchant/notifications/read-all`,
  delete: (id: string | number) => `${BASE_URL}/merchant/notifications/${id}`,
} as const;

