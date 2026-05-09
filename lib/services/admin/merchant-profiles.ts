'use client';

/**
 * Admin - Merchant Profiles API Service
 *
 * Endpoints:
 * - GET  /user-management/:id/merchant-profiles
 * - POST /user-management/:id/merchant-profiles
 */

import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';

export interface AdminMerchantProfile {
  id: string;
  merchantProfileName: string;
  userId: string;
  industryId: number;
  industry?: {
    id: number;
    name: string;
  } | null;
  isPrimary: boolean;
  status?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminMerchantProfilesResponse {
  success: boolean;
  data: AdminMerchantProfile[];
}

export interface CreateMerchantProfilePayload {
  merchantProfileName: string;
  industryId: number;
  isPrimary?: boolean;
}

const getBaseUrl = (userId: string | number) =>
  `/user-management/${userId}/merchant-profiles`;

export async function getMerchantProfilesForUser(
  userId: string | number
): Promise<ApiResponse<AdminMerchantProfilesResponse>> {
  try {
    const data = await http.get(
      getBaseUrl(userId)
    ) as AdminMerchantProfilesResponse;
    return {
      status: 200,
      data,
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

export async function createMerchantProfileForUser(
  userId: string | number,
  payload: CreateMerchantProfilePayload
): Promise<ApiResponse<AdminMerchantProfile>> {
  try {
    const response = await http.post(
      getBaseUrl(userId),
      payload
    ) as { success: boolean; data: AdminMerchantProfile };

    const profile =
      response && typeof response === 'object' && 'data' in response
        ? (response as any).data
        : (response as any);

    return {
      status: 201,
      data: profile,
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

