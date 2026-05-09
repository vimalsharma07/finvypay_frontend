'use client';

import { http, ApiError } from '@/lib/api';
import { authRoutes } from '@/lib/routes/auth-routes';
import type { ApiResponse } from '../types';

export interface ApiCredentialsData {
  testSecretKey: string;
  liveSecretKey: string;
  encryptionKey: string;
  webhookHash: string;
}

export interface ApiCredentialsResponse {
  success: boolean;
  message?: string;
  data: ApiCredentialsData;
}

export async function getApiCredentials(): Promise<ApiResponse<ApiCredentialsResponse>> {
  try {
    const response = await http.get(authRoutes.apiCredentials) as ApiCredentialsResponse;
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
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
