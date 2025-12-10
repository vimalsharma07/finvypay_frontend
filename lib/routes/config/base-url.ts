/**
 * Base URL Configuration
 * Centralized BASE_URL logic for all route modules
 */

export const getBaseUrl = (): string => {
  // Support both server and client-side
  if (typeof window === 'undefined') {
    return process.env.NEXTAUTH_URL || '';
  }
  return process.env.NEXT_PUBLIC_NEXTAUTH_URL || process.env.NEXTAUTH_URL || '';
};
