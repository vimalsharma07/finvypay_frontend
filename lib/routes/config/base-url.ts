/**
 * Base URL Configuration
 * 
 * Note: For API routes, use relative paths (starting with /).
 * The api.ts file will automatically prepend NEXT_PUBLIC_API_URL.
 * This function is kept for backward compatibility but should return empty string for API routes.
 */

export const getBaseUrl = (): string => {
  // Return empty string - api.ts will handle prepending the API base URL
  // API routes should be relative paths like /user-management, /admin/user-management, etc.
  return '';
};
