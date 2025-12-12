/**
 * API Response Handler Utility
 * 
 * Centralized handling of API responses with different status codes
 * Follows industry best practices for error handling
 */

import { ApiResponse } from '../services/admin/users';

export interface ResponseHandlerOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string, status: number) => void;
  onValidationError?: (errors: Record<string, string[]>, messages: string | string[]) => void;
  onUnauthorized?: () => void;
  silent?: boolean; // If true, won't log to console
}

/**
 * Handles API response based on status code
 * 
 * @param response - API response from api-client
 * @param options - Handler options for custom callbacks
 * @returns boolean - true if successful, false otherwise
 */
export function handleApiResponse<T = any>(
  response: ApiResponse<T>,
  options: ResponseHandlerOptions = {}
): boolean {
  const {
    onSuccess,
    onError,
    onValidationError,
    onUnauthorized,
    silent = false,
  } = options;

  // Status code handlers map
  const statusHandlers: Record<number, () => void> = {
    200: () => {
      if (response.data) {
        if (!silent) {
          console.log('✅ Success:', response.data);
        }
        onSuccess?.(response.data);
      } else {
        const errorMsg = 'Success response but no data received';
        if (!silent) {
          console.warn('⚠️', errorMsg);
        }
        onError?.(errorMsg, 200);
      }
    },

    204: () => {
      // 204 No Content - successful deletion with no response body
      if (!silent) {
        console.log('✅ Success: Resource deleted (204 No Content)');
      }
      onSuccess?.(undefined as any);
    },

    400: () => {
      const errorMsg = response.error || 'Bad Request';
      if (!silent) {
        console.error('❌ Bad Request (400):', errorMsg);
        if (response.errors) {
          console.error('Validation errors:', response.errors);
        }
      }
      
      onValidationError?.(
        response.errors || {},
        response.message || errorMsg
      );
      onError?.(errorMsg, 400);
    },

    401: () => {
      const errorMsg = response.error || 'Unauthorized';
      if (!silent) {
        console.error('❌ Unauthorized (401):', errorMsg);
        console.log('Please check your authentication token');
      }
      onUnauthorized?.();
      onError?.(errorMsg, 401);
    },

    403: () => {
      const errorMsg = response.error || 'Forbidden';
      if (!silent) {
        console.error('❌ Forbidden (403):', errorMsg);
      }
      onError?.(errorMsg, 403);
    },

    404: () => {
      const errorMsg = response.error || 'Not Found';
      if (!silent) {
        console.error('❌ Not Found (404):', errorMsg);
      }
      onError?.(errorMsg, 404);
    },

    500: () => {
      const errorMsg = response.error || 'Internal Server Error';
      if (!silent) {
        console.error('❌ Server Error (500):', errorMsg);
      }
      onError?.(errorMsg, 500);
    },
  };

  // Get handler for status code
  const handler = statusHandlers[response.status];

  if (handler) {
    handler();
    return response.status === 200 || response.status === 204;
  }

  // Handle unknown status codes
  const errorMsg = response.error || `HTTP Error: ${response.status}`;
  if (!silent) {
    console.error(`❌ Error (${response.status}):`, errorMsg);
  }
  onError?.(errorMsg, response.status);
  return false;
}

/**
 * Type-safe success response handler
 */
export function handleSuccessResponse<T>(
  response: ApiResponse<T>,
  callback: (data: T) => void
): boolean {
  if (response.status === 200 && response.data) {
    callback(response.data);
    return true;
  }
  return false;
}

/**
 * Type-safe error response handler
 */
export function handleErrorResponse(
  response: ApiResponse<any>,
  callback?: (error: string, status: number) => void
): boolean {
  if (response.status !== 200 || response.error) {
    const errorMsg = response.error || `HTTP Error: ${response.status}`;
    callback?.(errorMsg, response.status);
    return true;
  }
  return false;
}
