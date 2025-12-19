/**
 * Admin - Support Ticket Routes
 * All endpoints related to support ticket operations
 * 
 * Note: Routes should be relative paths (starting with /)
 * The api.ts file will automatically prepend NEXT_PUBLIC_API_URL
 */

export const adminSupportTicketRoutes = {
  list: `/admin/support-ticket`,
  getById: (id: string | number) => `/admin/support-ticket/${id}`,
  update: (id: string | number) => `/admin/support-ticket/${id}`,
  close: (id: string | number) => `/admin/support-ticket/${id}/close`,
  reopen: (id: string | number) => `/admin/support-ticket/${id}/reopen`,
} as const;

