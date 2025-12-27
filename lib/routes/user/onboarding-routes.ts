/**
 * User - Onboarding Routes
 * All endpoints related to user onboarding operations
 */

export const userOnboardingRoutes = {
  getOnboarding: `/user-onboarding`,
  initialize: `/user-onboarding`,
  uploadFile: `/user-onboarding/upload-file`,
  updateBasicDetails: `/user-onboarding/basic-details`,
  updateProcessingDetails: `/user-onboarding/processing-details`,
  addDirector: `/user-onboarding/directors`,
  getDirectors: `/user-onboarding/directors`,
  updateDirector: (id: string) => `/user-onboarding/director/${id}`,
  removeDirector: (id: string) => `/user-onboarding/director/${id}`,
  uploadVideoKyc: `/user-onboarding/video-kyc`,
  skipVideoKyc: `/user-onboarding/video-kyc/skip`,
  getAgreement: `/user-onboarding/agreement`,
  signAgreement: `/user-onboarding/agreement/sign`,
} as const;
