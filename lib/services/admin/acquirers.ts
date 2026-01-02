/**
 * Acquirers API Service
 * 
 * Centralized API calls for acquirer management
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import { adminAcquirerRoutes } from '../../routes/admin/acquirer-routes';
import type { ApiResponse } from '../types';

// Acquirer types matching the API response structure
export interface Acquirer {
  id: number | string;
  acquirerName: string;
  fileName: string;
  iconUrl?: string;
  fields: Record<string, string>;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcquirerListParams {
  page?: number;
  limit?: number;
}

export interface AcquirerListMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AcquirerListData {
  data: Acquirer[];
  meta: AcquirerListMeta;
}

export interface AcquirerListResponse {
  success: boolean;
  data: AcquirerListData;
  message?: string;
}

export interface CreateAcquirerPayload {
  acquirerName: string;
  fileName: string;
  iconUrl?: string;
  fields: Record<string, string>;
}

export interface UpdateAcquirerPayload {
  acquirerName: string;
  fileName: string;
  iconUrl?: string;
  fields: Record<string, string>;
  status?: string;
}

/**
 * Get all acquirers (with pagination)
 */
export async function getAcquirers(
  params?: AcquirerListParams
): Promise<ApiResponse<AcquirerListResponse>> {
  try {
    const data = await http.get(adminRoutes.acquirer.list, {
      query: params as Record<string, string | number | undefined>,
    }) as AcquirerListResponse;
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

/**
 * Create new acquirer
 */
export async function createAcquirer(
  payload: CreateAcquirerPayload
): Promise<ApiResponse<Acquirer>> {
  try {
    const data = await http.post(adminRoutes.acquirer.create, payload) as Acquirer;
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
 * Get acquirer by ID
 */
export async function getAcquirerById(id: string | number): Promise<ApiResponse<Acquirer>> {
  try {
    const response = await http.get(adminRoutes.acquirer.getById(id)) as
      | {
          success: boolean;
          data: Acquirer;
        }
      | Acquirer;
    
    // Handle API response structure: { success: true, data: {...} }
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      const apiResponse = response as { success: boolean; data: Acquirer };
      if (apiResponse.success && apiResponse.data) {
        return {
          status: 200,
          data: apiResponse.data,
        };
      }
    }
    
    // Fallback: if response is directly the acquirer data
    if (response && typeof response === 'object' && 'id' in response && !('success' in response)) {
      return {
        status: 200,
        data: response as unknown as Acquirer,
      };
    }
    
    // Handle direct Acquirer object response
    return {
      status: 200,
      data: response as Acquirer,
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

/**
 * Update acquirer
 */
export async function updateAcquirer(
  id: string | number,
  payload: UpdateAcquirerPayload
): Promise<ApiResponse<Acquirer>> {
  try {
    const data = await http.put(adminRoutes.acquirer.update(id), payload) as Acquirer;
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
 * Delete acquirer
 */
export async function deleteAcquirer(id: string | number): Promise<ApiResponse<{ success: boolean; message?: string }>> {
  try {
    const data = await http.delete(adminRoutes.acquirer.delete(id)) as { success: boolean; message?: string };
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

// Merchant Acquirer Request Types
export interface MerchantAcquirerRequestMerchant {
  id: string;
  parentId: string | null;
  email: string;
  name: string;
  password: string;
  role: string;
  roleId: number;
  otp: string | null;
  otpExpiry: string | null;
  emailVerifiedAt: string;
  isBlocked: boolean;
  isDeleted: boolean;
  uniqueId: string;
  isTwoFaEnabled: boolean;
  twoFaToken: string | null;
  provider: string;
  oauthId: string | null;
  profileImage: string | null;
  avatarUrl: string | null;
  kycRejectReason: string | null;
  isProfileCompleted: boolean;
  isKycCompleted: boolean | null;
  kycStatus: string;
  videoKycRequired: boolean;
  videoKycSkipped: boolean;
  profileStep: number;
  agreementSignedAt: string;
  agreementStatus: number;
  agreementRemark: string | null;
  entityType: string;
  currentProfileId: string | null;
  encryptionKey: string;
  testSecretKey: string;
  liveSecretKey: string | null;
  referralPartnerId: string | null;
  referralPartnerCommission: string | null;
  settlementFee: string | null;
  ipEnabled: boolean;
  binEnabled: boolean;
  cardWlEnabled: boolean;
  webhookHash: string | null;
  isPasswordChanged: boolean | null;
  penaltyAmount: string;
  sendTransactionEmail: boolean;
  socialMediaInfo: string | null;
  notificationEmails: string | null;
  permissions: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantAcquirerRequestMerchantProfile {
  id: string;
  merchantProfileName: string;
  userId: string;
  industryId: string;
  isPrimary: boolean;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface MerchantAcquirerRequestAcquirerAccount {
  id: string;
  userId: string;
  merchantProfileId: string;
  acquirerId: number;
  acquirerAccountId: number;
  name: string;
  terminalId: string;
  description: string;
  status: number;
  adminRejectReason: string | null;
  merchantRejectReason: string | null;
  rates: Record<string, string>;
  ratesPdfUrl: string | null;
  currencyCode: string;
  ratesType: string;
  isActive: boolean;
  isPrimary: boolean;
  secretKey: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantAcquirerRequest {
  id: string;
  merchantId: string;
  merchant: MerchantAcquirerRequestMerchant;
  merchantProfileId: string;
  merchantProfile: MerchantAcquirerRequestMerchantProfile;
  acquirerAccountId: string;
  acquirerAccount: MerchantAcquirerRequestAcquirerAccount;
  acceptedPaymentMethods: string[];
  processingCurrency: string[];
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantAcquirerRequestsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MerchantAcquirerRequestsResponse {
  success: boolean;
  data: MerchantAcquirerRequest[];
  meta: MerchantAcquirerRequestsMeta;
  message?: string;
}

export interface MerchantAcquirerRequestsParams {
  page?: number;
  limit?: number;
}

export interface UpdateMerchantAcquirerRequestStatusPayload {
  status: 'approved' | 'rejected';
}

export interface UpdateMerchantAcquirerRequestStatusResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

export interface GetMerchantAcquirerRequestResponse {
  success: boolean;
  data: MerchantAcquirerRequest;
  message?: string;
}

/**
 * Get merchant acquirer requests (paginated)
 */
export async function getMerchantAcquirerRequests(
  params: MerchantAcquirerRequestsParams = { page: 1, limit: 20 }
): Promise<ApiResponse<MerchantAcquirerRequestsResponse>> {
  try {
    const response = await http.get(adminAcquirerRoutes.merchantAcquirerRequests, {
      query: params as Record<string, string | number | boolean | null | undefined>,
    }) as MerchantAcquirerRequestsResponse;

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

/**
 * Get merchant acquirer request by ID
 */
export async function getMerchantAcquirerRequest(
  id: string | number
): Promise<ApiResponse<GetMerchantAcquirerRequestResponse>> {
  try {
    const response = await http.get(adminAcquirerRoutes.getMerchantAcquirerRequest(id)) as GetMerchantAcquirerRequestResponse;

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

/**
 * Update merchant acquirer request status (approve/reject)
 */
export async function updateMerchantAcquirerRequestStatus(
  id: string | number,
  payload: UpdateMerchantAcquirerRequestStatusPayload
): Promise<ApiResponse<UpdateMerchantAcquirerRequestStatusResponse>> {
  try {
    const response = await http.put(adminAcquirerRoutes.updateMerchantAcquirerRequestStatus(id), payload) as UpdateMerchantAcquirerRequestStatusResponse;

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

