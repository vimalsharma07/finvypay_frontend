/**
 * Merchant - Support Ticket Routes
 * All endpoints related to merchant support ticket operations
 * 
 * Note: Routes should be relative paths (starting with /)
 * The api.ts file will automatically prepend NEXT_PUBLIC_API_URL
 */

export const userSupportTicketRoutes = {
  list: `/merchant/support-ticket`,
  getById: (id: string | number) => `/merchant/support-ticket/${id}`,
  create: `/merchant/support-ticket`,
  update: (id: string | number) => `/merchant/support-ticket/${id}`,
  delete: (id: string | number) => `/merchant/support-ticket/${id}`,
} as const;

