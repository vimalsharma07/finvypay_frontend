/**
 * Merchant Profile API Service
 * 
 * Centralized API calls for merchant profile operations
 */

import { http, ApiError } from '../../api';
import type { ApiResponse } from '../types';

// Merchant Profile types
export interface MerchantProfile {
  id: number;
  merchantProfileName: string;
  userId: number;
  industryId: number;
  isPrimary: boolean;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantProfileListResponse {
  success: boolean;
  data: MerchantProfile[];
  message?: string;
}

/**
 * Get all merchant profiles for the authenticated user
 */
export async function getMerchantProfiles(): Promise<ApiResponse<MerchantProfileListResponse>> {
  try {
    const data = await http.get('/merchant/profile/merchant-profiles');
    return {
      status: 200,
      data: data as MerchantProfileListResponse,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status || 500,
        error: error.message,
      };
    }
    throw error;
  }
}

/**
 * Get primary merchant profile for the authenticated user
 */
export async function getPrimaryMerchantProfile(): Promise<ApiResponse<MerchantProfile>> {
  try {
    const data = await http.get('/merchant/profile/merchant-profiles/primary');
    return {
      status: 200,
      data: data as MerchantProfile,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status || 500,
        error: error.message,
      };
    }
    throw error;
  }
}

/**
 * Merchant Profile interface with extended fields (for use in UI components)
 */
export interface MerchantProfileWithIndustry {
  id: number | string;
  merchantProfileName?: string;
  userId?: number;
  industryId?: number;
  isPrimary?: boolean;
  status?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  industry?: {
    id?: number;
    name?: string;
  };
}

/**
 * Get the current merchant profile ID from URL params, user object, or localStorage
 * 
 * This utility function provides a centralized way to get the profile ID in user-facing components.
 * It follows this priority:
 * 1. URL search params (if provided)
 * 2. User's merchantProfiles (primary profile preferred, otherwise first profile)
 * 3. localStorage user data (same logic as above)
 * 
 * @param urlProfileId - Optional profile ID from URL search params
 * @param user - Optional user object from useAuth hook
 * @returns The profile ID as a string, or null if not found
 * 
 * @example
 * ```tsx
 * const { user } = useAuth();
 * const searchParams = useSearchParams();
 * const profileId = getUserProfileId(searchParams.get('profileId'), user);
 * ```
 */
export function getUserProfileId(
  urlProfileId: string | null | undefined,
  user?: any
): string | null {
  // Priority 1: Use profileId from URL if provided
  if (urlProfileId) {
    return urlProfileId;
  }

  // Priority 2: Try to get from user's merchant profiles
  if (user?.merchantProfiles && Array.isArray(user.merchantProfiles) && user.merchantProfiles.length > 0) {
    const primaryProfile = user.merchantProfiles.find((p: MerchantProfileWithIndustry) => p?.isPrimary);
    const selectedProfile: MerchantProfileWithIndustry | undefined = primaryProfile || user.merchantProfiles[0];
    
    if (selectedProfile?.id) {
      return selectedProfile.id.toString();
    }
  }

  // Priority 3: Fallback to localStorage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.merchantProfiles) && parsed.merchantProfiles.length > 0) {
          const primaryProfile = parsed.merchantProfiles.find(
            (p: MerchantProfileWithIndustry) => p?.isPrimary
          );
          const selectedProfile: MerchantProfileWithIndustry | undefined = 
            primaryProfile || parsed.merchantProfiles[0];
          
          if (selectedProfile?.id) {
            return selectedProfile.id.toString();
          }
        }
      }
    } catch {
      // Silently ignore parse errors
    }
  }

  // No profile ID found
  return null;
}

