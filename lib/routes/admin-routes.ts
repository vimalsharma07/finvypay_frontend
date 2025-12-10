/**
 * Admin API Routes Configuration
 * 
 * Centralized endpoint management for easy change management
 * Update endpoints here and they will be reflected across the application
 */

// Support both server and client-side
const BASE_URL = 
  typeof window === 'undefined' 
    ? process.env.NEXTAUTH_URL || ''
    : process.env.NEXT_PUBLIC_NEXTAUTH_URL || process.env.NEXTAUTH_URL || '';

export const adminRoutes = {
  // Users endpoints
  users: {
    list: `${BASE_URL}/user-management`,
    getById: (id: string) => `${BASE_URL}/user-management/${id}`,
    create: `${BASE_URL}/user-management`,
    update: (id: string) => `${BASE_URL}/user-management/${id}`,
    delete: (id: string) => `${BASE_URL}/user-management/${id}`,
    // Add more user-related endpoints as needed
    search: `${BASE_URL}/user-management/search`,
    bulkDelete: `${BASE_URL}/user-management/bulk-delete`,
  },
} as const;
