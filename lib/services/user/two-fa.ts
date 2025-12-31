/**
 * Two-Factor Authentication API Service
 * 
 * Centralized API calls for 2FA operations
 */

import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';

// 2FA Enable Response
export interface TwoFaEnableResponse {
  success: boolean;
  message: string;
  data: {
    secret: string;
    qrCodeUrl: string;
  };
}

/**
 * Enable 2FA and get QR code
 * GET /merchant/2fa/enable
 * Returns QR code for user to scan with authenticator app
 */
export async function enableTwoFa(): Promise<ApiResponse<TwoFaEnableResponse>> {
  try {
    const response = await http.get('/merchant/2fa/enable') as TwoFaEnableResponse;

    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
        errors: error.data?.errors,
        message: error.data?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

