/**
 * Affiliate Profile API Service
 *
 * Fetches the current affiliate user's profile from GET /affiliate/profile.
 */

import { http, ApiError } from '../../api';
import { affiliateRoutes } from '../../routes/affiliate';
import type { ApiResponse } from '../types';

/** Affiliate profile as returned by GET /affiliate/profile */
export interface AffiliateProfile {
  id: string;
  parentId: string | null;
  email: string;
  name: string;
  role: string;
  roleId: number | null;
  otp: string | null;
  otpExpiry: string | null;
  emailVerifiedAt: string | null;
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
  kycStatus: string | null;
  videoKycRequired: boolean;
  videoKycSkipped: boolean;
  profileStep: number;
  agreementSignedAt: string | null;
  agreementStatus: number;
  agreementRemark: string | null;
  entityType: string | null;
  currentProfileId: string | null;
  encryptionKey: string | null;
  testSecretKey: string | null;
  liveSecretKey: string | null;
  referralPartnerId: number | null;
  referralPartnerCommission: number | null;
  settlementFee: string | null;
  ipEnabled: boolean;
  binEnabled: boolean;
  cardWlEnabled: boolean;
  webhookHash: string | null;
  isPasswordChanged: boolean | null;
  penaltyAmount: string;
  sendTransactionEmail: boolean;
  socialMediaInfo: unknown;
  notificationEmails: string | null;
  permissions: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateProfileResponse {
  success: boolean;
  data: AffiliateProfile;
  message?: string;
}

/**
 * Get current affiliate profile.
 */
export async function getAffiliateProfile(): Promise<
  ApiResponse<AffiliateProfileResponse>
> {
  try {
    const data = (await http.get(
      affiliateRoutes.profile.profile
    )) as AffiliateProfileResponse;
    return {
      status: 200,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status || 500,
        error: error.message,
        data: undefined,
      };
    }
    throw error;
  }
}
