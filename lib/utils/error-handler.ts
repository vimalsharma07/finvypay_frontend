/**
 * Error Handler Utilities
 * 
 * Utilities for handling and redirecting to error pages
 */

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Redirect to error page based on status code
 * 
 * @param router - Next.js router instance
 * @param statusCode - HTTP status code (403, 404, 500, etc.)
 */
export function redirectToErrorPage(
  router: AppRouterInstance,
  statusCode: number
): void {
  switch (statusCode) {
    case 403:
      router.push('/forbidden');
      break;
    case 404:
      router.push('/not-found');
      break;
    case 500:
      router.push('/error');
      break;
    default:
      // For unknown errors, redirect to 500 page
      router.push('/error');
  }
}

/**
 * Handle API error and redirect to appropriate error page
 * 
 * @param router - Next.js router instance
 * @param statusCode - HTTP status code from API response
 * @param showToast - Whether to show toast notification (default: true)
 */
export function handleApiError(
  router: AppRouterInstance,
  statusCode: number,
  showToast: boolean = true
): void {
  // Only redirect for client-side errors (4xx) and server errors (5xx)
  if (statusCode >= 400) {
    if (showToast && typeof window !== 'undefined') {
      // Import toast dynamically to avoid SSR issues
      import('sonner').then(({ toast }) => {
        const messages: Record<number, string> = {
          403: 'Access forbidden. You don\'t have permission to perform this action.',
          404: 'Resource not found.',
          500: 'Server error. Please try again later.',
        };
        
        toast.error(messages[statusCode] || 'An error occurred. Please try again.');
      });
    }
    
    redirectToErrorPage(router, statusCode);
  }
}

