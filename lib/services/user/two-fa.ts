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

// 2FA Toggle Request
export interface TwoFaToggleRequest {
  enable: boolean;
  secret?: string;
  token: string;
}

// 2FA Toggle Response
export interface TwoFaToggleResponse {
  success: boolean;
  message: string;
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

/**
 * Toggle 2FA status (enable/disable)
 * PUT /merchant/2fa/status
 * Enable 2FA with secret and token, or disable with token only
 */
export async function toggleTwoFa(
  payload: TwoFaToggleRequest
): Promise<ApiResponse<TwoFaToggleResponse>> {
  try {
    // Ensure token is sent as string (not number)
    const requestPayload = {
      ...payload,
      token: String(payload.token),
      secret: payload.secret ? String(payload.secret) : undefined,
    };

    const response = await http.put('/merchant/2fa/status', requestPayload, {
      auth: true,
      json: true,
    }) as TwoFaToggleResponse;

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

