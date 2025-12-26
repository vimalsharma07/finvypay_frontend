/**
 * User - Onboarding API Service
 * 
 * Centralized API calls for user onboarding operations
 */

import { http, ApiError } from '../../api';
import { userOnboardingRoutes } from '../../routes/user/onboarding-routes';
import type { ApiResponse } from '../types';

// Onboarding types matching the API response structure
export interface OnboardingUser {
  kycStatus: string;
  profileStep: number;
  entityType: string | null;
  videoKycSkipped: boolean;
}

export interface OnboardingDetails {
  id: string;
  kycType: 'individual' | 'company' | 'partnership' | null;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  address: string | null;
  countryCode: string | null;
  identityProofPath: string | null;
  proofOfAddressPath: string | null;
  registrationNumber: string | null;
  dateOfIncorporation: string | null;
  doingBusinessAs: string | null;
  countryOfIncorporation: string | null;
  companyWebsite: string | null;
  registeredAddress: string | null;
  certificateOfIncorporationPath: string | null;
  memorandumOfAssociationPath: string | null;
  articlesOfAssociationPath: string | null;
  domainOwnershipPath: string | null;
  directors: Director[];
  acceptedPaymentMethods: string | null;
  industry: string | null;
  processingCountry: string | null;
  processingCurrency: string | null;
  monthlyVolume: string | null;
  licenseStatus: boolean;
  signedAgreement: string | null;
  videoKycPath: string | null;
  videoKycCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingData {
  onboarding: OnboardingDetails | null;
  currentStep: number;
  kycType: 'individual' | 'company' | 'partnership' | null;
  totalSteps: number;
  user: OnboardingUser;
}

export interface OnboardingResponse {
  success: boolean;
  data: OnboardingData;
  message?: string;
}

export interface InitializeOnboardingPayload {
  kycType: 'individual' | 'company' | 'partnership';
}

export interface InitializeOnboardingResponse {
  success: boolean;
  data: OnboardingData;
  message?: string;
}

// Basic Details Types
export interface UpdateBasicDetailsPayload {
  // Common fields
  name: string;
  email: string;
  countryCodeId: number;
  phoneNumber: string;
  address: string;
  // Company/Partnership fields
  registrationNumber?: string;
  dateOfIncorporation?: string; // YYYY-MM-DD
  countryOfIncorporationId?: number;
  doingBusinessAs?: string;
  companyWebsite?: string;
  registeredAddress?: string;
}

export interface UpdateBasicDetailsResponse {
  success: boolean;
  data: OnboardingData;
  message?: string;
}

// File Upload Types
export type FileUploadType =
  | 'identity_proof'
  | 'proof_of_address'
  | 'certificate_of_incorporation'
  | 'memorandum_of_association'
  | 'articles_of_association'
  | 'domain_ownership'
  | 'register_of_director'
  | 'video_kyc'
  | 'signed_agreement';

export interface UploadFileResponse {
  success: boolean;
  data: {
    filePath: string;
    s3Id: string;
    type: FileUploadType;
  };
  message?: string;
}

// Processing Details Types
export interface UpdateProcessingDetailsPayload {
  acceptedPaymentMethods: string[];
  industryId: number;
  processingCountryId: number;
  processingCurrency: string[];
  monthlyVolume: number;
  licenseStatus: boolean;
}

export interface UpdateProcessingDetailsResponse {
  success: boolean;
  data: OnboardingData;
  message?: string;
}

// Director Types
export interface Director {
  id: string;
  name: string;
  email: string;
  countryCodeId: number;
  phoneNumber: string;
  address: string;
  registerOfDirectorPath?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddDirectorPayload {
  name: string;
  email: string;
  countryCodeId: number;
  phoneNumber: string;
  address: string;
}

export interface UpdateDirectorPayload {
  name?: string;
  email?: string;
  countryCodeId?: number;
  phoneNumber?: string;
  address?: string;
}

export interface DirectorResponse {
  success: boolean;
  data: Director;
  message?: string;
}

export interface DirectorsListResponse {
  success: boolean;
  data: Director[];
  message?: string;
}

// Agreement Types
export interface Agreement {
  id: string;
  name: string;
  type: string;
  desc: string;
  status: string;
}

export interface AgreementResponse {
  success: boolean;
  data: {
    agreement: Agreement;
    userKycStatus: string;
    canSign: boolean;
  };
  message?: string;
}

export interface SignAgreementResponse {
  success: boolean;
  data: OnboardingData;
  message?: string;
}

/**
 * Get user onboarding status
 */
export async function getOnboardingStatus(): Promise<ApiResponse<OnboardingResponse>> {
  try {
    const response = await http.get(userOnboardingRoutes.getOnboarding) as OnboardingResponse;
    
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
 * Initialize onboarding
 */
export async function initializeOnboarding(
  payload: InitializeOnboardingPayload
): Promise<ApiResponse<InitializeOnboardingResponse>> {
  try {
    const response = await http.post(
      userOnboardingRoutes.initialize,
      payload
    ) as InitializeOnboardingResponse;
    
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
 * Update basic details
 */
export async function updateBasicDetails(
  payload: UpdateBasicDetailsPayload
): Promise<ApiResponse<UpdateBasicDetailsResponse>> {
  try {
    const response = await http.put(
      userOnboardingRoutes.updateBasicDetails,
      payload
    ) as UpdateBasicDetailsResponse;
    
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
 * Upload file
 */
export async function uploadFile(
  file: File,
  type: FileUploadType,
  directorId?: string
): Promise<ApiResponse<UploadFileResponse>> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // For video KYC, use the specific endpoint
    if (type === 'video_kyc') {
      const response = await http.post(
        userOnboardingRoutes.uploadVideoKyc,
        formData,
        {
          json: false, // Important: Don't JSON stringify FormData
        }
      ) as UploadFileResponse;
      
      return {
        status: 200,
        data: response,
      };
    }
    
    // For other file types, use the generic upload endpoint
    formData.append('type', type);
    
    // Add directorId if provided (for director documents)
    if (directorId) {
      formData.append('directorId', directorId);
    }

    // Don't set Content-Type header - browser will set it automatically with boundary
    const response = await http.post(
      userOnboardingRoutes.uploadFile,
      formData,
      {
        json: false, // Important: Don't JSON stringify FormData
      }
    ) as UploadFileResponse;
    
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
 * Update processing details
 */
export async function updateProcessingDetails(
  payload: UpdateProcessingDetailsPayload
): Promise<ApiResponse<UpdateProcessingDetailsResponse>> {
  try {
    const response = await http.put(
      userOnboardingRoutes.updateProcessingDetails,
      payload
    ) as UpdateProcessingDetailsResponse;
    
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
 * Add director
 */
export async function addDirector(
  payload: AddDirectorPayload
): Promise<ApiResponse<DirectorResponse>> {
  try {
    const response = await http.post(
      userOnboardingRoutes.addDirector,
      payload
    ) as DirectorResponse;
    
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
 * Get all directors
 */
export async function getDirectors(): Promise<ApiResponse<DirectorsListResponse>> {
  try {
    const response = await http.get(userOnboardingRoutes.getDirectors);
    
    // Handle both wrapped and direct array responses
    if (response && typeof response === 'object') {
      // If it's a wrapped response with success and data
      if ('success' in response && response.success && 'data' in response) {
        return {
          status: 200,
          data: response as DirectorsListResponse,
        };
      }
      // If it's directly an array
      if (Array.isArray(response)) {
        return {
          status: 200,
          data: {
            success: true,
            data: response,
          } as DirectorsListResponse,
        };
      }
    }
    
    return {
      status: 200,
      data: response as DirectorsListResponse,
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
 * Update director
 */
export async function updateDirector(
  id: string,
  payload: UpdateDirectorPayload
): Promise<ApiResponse<DirectorResponse>> {
  try {
    const response = await http.put(
      userOnboardingRoutes.updateDirector(id),
      payload
    ) as DirectorResponse;
    
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
 * Delete director
 */
export async function deleteDirector(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await http.delete(userOnboardingRoutes.removeDirector(id));
    
    // Handle 204 No Content response
    if (response && typeof response === 'object' && (response as any).__noContent) {
      return {
        status: 204,
      };
    }
    
    return {
      status: 204,
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
 * Get agreement
 */
export async function getAgreement(type: string = 'user'): Promise<ApiResponse<AgreementResponse>> {
  try {
    const response = await http.get(userOnboardingRoutes.getAgreement, {
      query: { type },
    }) as AgreementResponse;
    
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
 * Sign agreement
 */
export async function signAgreement(file: File): Promise<ApiResponse<SignAgreementResponse>> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await http.post(
      userOnboardingRoutes.signAgreement,
      formData,
      {
        json: false, // Important: Don't JSON stringify FormData
      }
    ) as SignAgreementResponse;
    
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

