/**
 * Admin - Notification Routes
 * All endpoints related to admin notifications
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const adminNotificationRoutes = {
  list: `${BASE_URL}/admin/notifications`,
  getById: (id: string | number) => `${BASE_URL}/admin/notifications/${id}`,
  markAsRead: (id: string | number) => `${BASE_URL}/admin/notifications/${id}/read`,
  markAllAsRead: `${BASE_URL}/admin/notifications/read-all`,
  delete: (id: string | number) => `${BASE_URL}/admin/notifications/${id}`,
} as const;

