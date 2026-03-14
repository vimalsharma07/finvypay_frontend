/**
 * Applications API Service
 *
 * Provides counts and overview data for admin applications dashboard.
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';

export interface ApplicationCounts {
  applicationCount: number;
  merchantAcquirerRequestPendingCount: number;
}

export interface ApplicationCountsResponse {
  success: boolean;
  data: ApplicationCounts;
  message?: string;
}

export interface MerchantApplication {
  id: string;
  email: string | null;
  name: string | null;
  kycStatus: string | null;
  profileStep: number | null;
  entityType: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  onboardingId?: string | null;
  kycType?: string | null;
  phoneNumber?: string | null;
  registrationNumber?: string | null;
  companyWebsite?: string | null;
  processingCountryId?: string | null;
  industryName?: string | null;
}

export interface MerchantApplicationsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RawMerchantApplication {
  id: string;
  email: string | null;
  name: string | null;
  kycstatus: string | null;
  profilestep: number | null;
  entitytype: string | null;
  createdat: string | null;
  updatedat: string | null;
  onboardingid?: string | null;
  kyctype?: string | null;
  phonenumber?: string | null;
  registrationnumber?: string | null;
  companywebsite?: string | null;
  processingcountryid?: string | null;
  industryname?: string | null;
}

export interface MerchantApplicationsResponse {
  success: boolean;
  data: RawMerchantApplication[];
  meta: MerchantApplicationsMeta;
  message?: string;
}

// Application detail types
export interface ApplicationDetailResponse {
  success: boolean;
  data: {
    user: {
      kycStatus: string;
      profileStep: number;
      entityType: string;
      videoKycSkipped: boolean;
    };
    onboarding: {
      id: string;
      kycType: string;
      name: string | null;
      email: string | null;
      phoneNumber: string | null;
      address: string | null;
      countryCode: {
        id: string;
        countryName: string;
        phoneCode: string;
      } | null;
      identityProofPath: string | null;
      proofOfAddressPath: string | null;
      registrationNumber: string | null;
      dateOfIncorporation: string | null;
      doingBusinessAs: string | null;
      countryOfIncorporation: {
        id: string;
        countryName: string;
      } | null;
      companyWebsite: string | null;
      registeredAddress: string | null;
      certificateOfIncorporationPath: string | null;
      memorandumOfAssociationPath: string | null;
      articlesOfAssociationPath: string | null;
      domainOwnershipPath: string | null;
      directors: Array<{
        id: string;
        name: string | null;
        email: string | null;
        phoneNumber: string | null;
        address: string | null;
        countryCode: {
          id: string;
          countryName: string;
          phoneCode: string;
        } | null;
        identityProofPath: string | null;
        proofOfAddressPath: string | null;
        registerOfDirectorPath: string | null;
      }>;
      acceptedPaymentMethods: string[] | null;
      industry: {
        id: string;
        name: string;
      } | null;
      processingCountry: {
        id: string;
        countryName: string;
      } | null;
      processingCurrency: string[] | null;
      monthlyVolume: string | null;
      licenseStatus: boolean;
      signedAgreement: string | null;
      videoKycPath: string | null;
      videoKycCompletedAt: string | null;
      createdAt: string;
      updatedAt: string;
    };
    currentStep: number;
    kycType: string;
    totalSteps: number;
  };
}

export interface MerchantApplicationsParams {
  page?: number;
  limit?: number;
}

export type ApplicationKycStatus = 'approved' | 'rejected';

export interface ChangeApplicationStatusPayload {
  userId: number;
  kycStatus: ApplicationKycStatus;
}

export interface ChangeApplicationStatusResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

/**
 * Get application counts (applications + pending acquirer requests)
 */
export async function getApplicationCounts(): Promise<ApiResponse<ApplicationCountsResponse>> {
  try {
    const response = await http.get(adminRoutes.applications.counts) as ApplicationCountsResponse;

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
 * Change application status (approve / reject)
 */
export async function changeApplicationStatus(
  payload: ChangeApplicationStatusPayload
): Promise<ApiResponse<ChangeApplicationStatusResponse>> {
  try {
    const response = await http.post(adminRoutes.applications.changeStatus, payload) as ChangeApplicationStatusResponse;
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
 * Get merchant applications (paginated)
 */
export async function getMerchantApplications(
  params: MerchantApplicationsParams = { page: 1, limit: 20 }
): Promise<ApiResponse<{ success: boolean; data: MerchantApplication[]; meta: MerchantApplicationsMeta; message?: string }>> {
  try {
    const response = await http.get(adminRoutes.applications.merchants, {
      query: params as Record<string, string | number | boolean | null | undefined>,
    }) as MerchantApplicationsResponse;

    const normalizedData: MerchantApplication[] = Array.isArray(response.data)
      ? response.data.map((item) => ({
          id: item.id,
          email: item.email,
          name: item.name,
          kycStatus: item.kycstatus,
          profileStep: item.profilestep,
          entityType: item.entitytype,
          createdAt: item.createdat,
          updatedAt: item.updatedat,
          onboardingId: item.onboardingid,
          kycType: item.kyctype,
          phoneNumber: item.phonenumber,
          registrationNumber: item.registrationnumber,
          companyWebsite: item.companywebsite,
          processingCountryId: item.processingcountryid,
          industryName: item.industryname,
        }))
      : [];

    return {
      status: 200,
      data: {
        success: response.success,
        data: normalizedData,
        meta: response.meta,
        message: response.message,
      },
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
 * Get application detail for a merchant
 */
export async function getApplicationDetail(
  merchantId: string | number
): Promise<ApiResponse<ApplicationDetailResponse>> {
  try {
    const response = await http.get(
      adminRoutes.applications.merchantDetails(merchantId)
    ) as ApplicationDetailResponse;

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

// --- Affiliate application types and APIs ---

export interface AffiliateApplicationUser {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  kycStatus: string | null;
  profileStep: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AffiliateApplicationAgreement {
  id: string;
  name: string;
  type: string;
  desc: string;
  status: string;
}

export interface AffiliateApplication {
  id: string;
  userId: string;
  user: AffiliateApplicationUser;
  rpName: string;
  phoneCountryCode: string;
  phoneNumber: string;
  email: string;
  country: string;
  poiPath: string | null;
  poaPath: string | null;
  agreementId: string;
  agreement: AffiliateApplicationAgreement | null;
  signedAgreementPath: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateApplicationCountResponseBody {
  success: boolean;
  data: { count: number };
  message?: string;
}

export interface AffiliateApplicationListResponse {
  success: boolean;
  data: AffiliateApplication[];
  message?: string;
}

export interface AffiliateApplicationDetailResponse {
  success: boolean;
  data: AffiliateApplication;
  message?: string;
}

export interface AffiliateApplicationApproveResponse {
  success: boolean;
  data?: unknown;
  message?: string;
}

export async function getAffiliateApplicationCount(): Promise<
  ApiResponse<AffiliateApplicationCountResponseBody>
> {
  try {
    const response = await http.get(
      adminRoutes.applications.affiliateCount
    ) as AffiliateApplicationCountResponseBody;
    return { status: 200, data: response };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: error.status, error: error.message, data: error.data };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getAffiliatePendingApplications(): Promise<
  ApiResponse<AffiliateApplicationListResponse>
> {
  try {
    const response = await http.get(
      adminRoutes.applications.affiliatePending
    ) as AffiliateApplicationListResponse;
    return { status: 200, data: response };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: error.status, error: error.message, data: error.data };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getAffiliateApplicationById(
  id: string | number
): Promise<ApiResponse<AffiliateApplicationDetailResponse>> {
  try {
    const response = await http.get(
      adminRoutes.applications.affiliateById(id)
    ) as AffiliateApplicationDetailResponse;
    return { status: 200, data: response };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: error.status, error: error.message, data: error.data };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function approveAffiliateApplication(
  id: string | number
): Promise<ApiResponse<AffiliateApplicationApproveResponse>> {
  try {
    const response = await http.post(
      adminRoutes.applications.affiliateApprove(id)
    ) as AffiliateApplicationApproveResponse;
    return { status: 200, data: response };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: error.status, error: error.message, data: error.data };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


