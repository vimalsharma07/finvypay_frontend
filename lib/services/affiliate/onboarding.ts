/**
 * Affiliate Onboarding API Service
 *
 * Status, step1 (details + POI/POA), step2 (signed agreement).
 */

import { http, ApiError } from '../../api';
import { affiliateRoutes } from '../../routes/affiliate';
import type { ApiResponse } from '../types';

export interface AffiliateOnboardingStatusData {
  currentStep: number;
  nextStep: number;
  totalSteps: number;
  status: string;
  message: string;
}

export interface AffiliateOnboardingStatusResponse {
  success: boolean;
  data: AffiliateOnboardingStatusData;
  message?: string;
}

/**
 * GET /affiliate/onboarding/status
 */
export async function getAffiliateOnboardingStatus(): Promise<
  ApiResponse<AffiliateOnboardingStatusResponse>
> {
  try {
    const data = (await http.get(
      affiliateRoutes.onboarding.status
    )) as AffiliateOnboardingStatusResponse;
    return { status: 200, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status || 500,
        error: error.message,
        data: undefined,
      };
    }
    return {
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: undefined,
    };
  }
}

/**
 * POST /affiliate/onboarding/step1
 * Body: FormData with rpName, phoneCountryCode, phoneNumber, email, country, poiFile, poaFile
 */
export async function submitAffiliateOnboardingStep1(
  formData: FormData
): Promise<ApiResponse<{ success: boolean; data?: unknown; message?: string }>> {
  try {
    const data = (await http.post(
      affiliateRoutes.onboarding.step1,
      formData,
      { json: false }
    )) as { success: boolean; data?: unknown; message?: string };
    return { status: 200, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status || 500,
        error: error.message,
        data: undefined,
      };
    }
    return {
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: undefined,
    };
  }
}

/**
 * POST /affiliate/onboarding/step2
 * Body: FormData with signedAgreementFile (File)
 */
export async function submitAffiliateOnboardingStep2(
  signedAgreementFile: File
): Promise<ApiResponse<{ success: boolean; data?: unknown; message?: string }>> {
  try {
    const formData = new FormData();
    formData.append('signedAgreementFile', signedAgreementFile);
    const data = (await http.post(
      affiliateRoutes.onboarding.step2,
      formData,
      { json: false }
    )) as { success: boolean; data?: unknown; message?: string };
    return { status: 200, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status || 500,
        error: error.message,
        data: undefined,
      };
    }
    return {
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: undefined,
    };
  }
}
