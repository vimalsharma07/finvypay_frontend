/**
 * User - Support Ticket Routes
 * All endpoints related to user support ticket operations
 * 
 * Note: Routes should be relative paths (starting with /)
 * The api.ts file will automatically prepend NEXT_PUBLIC_API_URL
 */

export const userSupportTicketRoutes = {
  list: `/user/support-ticket`,
  getById: (id: string | number) => `/user/support-ticket/${id}`,
  create: `/user/support-ticket`,
  update: (id: string | number) => `/user/support-ticket/${id}`,
  delete: (id: string | number) => `/user/support-ticket/${id}`,
} as const;

