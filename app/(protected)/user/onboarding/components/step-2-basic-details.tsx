'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CountryCodeSelector } from './country-code-selector';
import { FileUploadCard } from './file-upload-card';
import {
  updateBasicDetails,
  UpdateBasicDetailsPayload,
  FileUploadType,
  OnboardingData,
  OnboardingDetails,
  getOnboardingStatus,
} from '@/lib/services/user/onboarding';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { getCountries, Country } from '@/lib/services/admin/countries';

type KycType = 'individual' | 'company' | 'partnership';

// Base schema for all types
const baseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  email: z.string().email('Invalid email address').max(255, 'Email is too long'),
  countryCodeId: z.number().min(1, 'Country code is required'),
  phoneNumber: z.string().min(1, 'Phone number is required').max(50, 'Phone number is too long'),
  address: z.string().min(1, 'Address is required'),
});

// Company/Partnership schema
const companySchema = baseSchema.extend({
  registrationNumber: z.string().min(1, 'Registration number is required').max(255),
  dateOfIncorporation: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  countryOfIncorporationId: z.number().min(1, 'Country of incorporation is required'),
  doingBusinessAs: z.string().max(255).optional(),
  companyWebsite: z.string().url('Invalid URL').max(255).optional().or(z.literal('')),
  registeredAddress: z.string().max(500).optional(),
});

interface Step2BasicDetailsProps {
  onboardingData: OnboardingData;
  onNext: () => void;
  onUpdate: (data: UpdateBasicDetailsPayload) => void;
}

// Get required documents based on KYC type from API
const getRequiredDocuments = (kycType: KycType | null): FileUploadType[] => {
  if (!kycType) return [];
  
  if (kycType === 'individual') {
    return ['identity_proof', 'proof_of_address'];
  }
  
  return [
    'certificate_of_incorporation',
    'memorandum_of_association',
    'articles_of_association',
    'domain_ownership',
  ];
};

// Map file upload types to onboarding path fields
const fileTypeToPathMap: Partial<Record<FileUploadType, keyof OnboardingDetails>> = {
  identity_proof: 'identityProofPath',
  proof_of_address: 'proofOfAddressPath',
  certificate_of_incorporation: 'certificateOfIncorporationPath',
  memorandum_of_association: 'memorandumOfAssociationPath',
  articles_of_association: 'articlesOfAssociationPath',
  domain_ownership: 'domainOwnershipPath',
  register_of_director: 'signedAgreement', // Placeholder, adjust if needed
  video_kyc: 'videoKycPath',
  signed_agreement: 'signedAgreement',
};

export function Step2BasicDetails({ onboardingData, onNext, onUpdate }: Step2BasicDetailsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<FileUploadType, boolean>>(
    {} as Record<FileUploadType, boolean>
  );
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  // Get kycType from onboarding data
  const kycType = useMemo(() => {
    return (onboardingData?.kycType || onboardingData?.onboarding?.kycType) as KycType | null;
  }, [onboardingData]);

  const onboarding = onboardingData?.onboarding;

  const isCompanyOrPartnership = kycType === 'company' || kycType === 'partnership';
  const schema = isCompanyOrPartnership ? companySchema : baseSchema;

  type FormData = z.infer<typeof baseSchema> | z.infer<typeof companySchema>;

  // Fetch countries for country code mapping
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await getCountries({
          page: 1,
          limit: 100,
          sortBy: 'countryName',
          sortOrder: 'ASC',
        });

        handleApiResponse(response, {
          onSuccess: (data) => {
            if (data && data.success && data.data?.data) {
              setCountries(data.data.data);
            }
          },
          onError: (errorMessage) => {
            console.error('Failed to fetch countries:', errorMessage);
          },
        });
      } catch (error) {
        console.error('Countries fetch error:', error);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // Find country code ID from country code string
  const findCountryCodeId = (countryCode: string | null): number | undefined => {
    if (!countryCode || countries.length === 0) return undefined;
    const country = countries.find((c) => c.phoneCode === countryCode);
    return country ? Number(country.id) : undefined;
  };

  // Find country code ID for incorporation country
  const findCountryOfIncorporationId = (countryCode: string | null): number | undefined => {
    if (!countryCode || countries.length === 0) return undefined;
    const country = countries.find((c) => c.isoTwo === countryCode || c.isoThree === countryCode);
    return country ? Number(country.id) : undefined;
  };

  // Initialize form with existing data
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: useMemo(() => {
      const countryCodeId = findCountryCodeId(onboarding?.countryCode || null);
      const countryOfIncorporationId = findCountryOfIncorporationId(
        onboarding?.countryOfIncorporation || null
      );

      if (isCompanyOrPartnership) {
        return {
          name: onboarding?.name || '',
          email: onboarding?.email || '',
          countryCodeId: countryCodeId || (undefined as any),
          phoneNumber: onboarding?.phoneNumber || '',
          address: onboarding?.address || '',
          registrationNumber: onboarding?.registrationNumber || '',
          dateOfIncorporation: onboarding?.dateOfIncorporation || '',
          countryOfIncorporationId: countryOfIncorporationId || (undefined as any),
          doingBusinessAs: onboarding?.doingBusinessAs || '',
          companyWebsite: onboarding?.companyWebsite || '',
          registeredAddress: onboarding?.registeredAddress || '',
        };
      }

      return {
        name: onboarding?.name || '',
        email: onboarding?.email || '',
        countryCodeId: countryCodeId || (undefined as any),
        phoneNumber: onboarding?.phoneNumber || '',
        address: onboarding?.address || '',
      };
    }, [onboarding, isCompanyOrPartnership, countries]),
    mode: 'onChange',
  });

  // Check which documents are already uploaded
  useEffect(() => {
    if (!onboarding || !kycType) return;

    const requiredDocs = getRequiredDocuments(kycType);
    const uploaded: Record<FileUploadType, boolean> = {} as Record<FileUploadType, boolean>;

    requiredDocs.forEach((docType) => {
      const pathField = fileTypeToPathMap[docType];
      if (pathField && onboarding) {
        const path = onboarding[pathField] as string | null;
        uploaded[docType] = !!path;
      }
    });

    setUploadedFiles(uploaded);
  }, [onboarding, kycType]);

  // Refresh onboarding data after file upload
  const refreshOnboardingData = async () => {
    try {
      const response = await getOnboardingStatus();
      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data && data.success && data.data?.onboarding) {
            const updatedOnboarding = data.data.onboarding;
            const requiredDocs = getRequiredDocuments(kycType);
            const uploaded: Record<FileUploadType, boolean> = {} as Record<FileUploadType, boolean>;

            requiredDocs.forEach((docType) => {
              const pathField = fileTypeToPathMap[docType];
              if (pathField && updatedOnboarding) {
                const path = updatedOnboarding[pathField] as string | null;
                uploaded[docType] = !!path;
              }
            });

            setUploadedFiles(uploaded);
          }
        },
      });
    } catch (error) {
      console.error('Failed to refresh onboarding data:', error);
    }
  };

  const handleFileUploadSuccess = async (type: FileUploadType) => {
    // Optimistically update state
    setUploadedFiles((prev) => ({ ...prev, [type]: true }));
    // Refresh onboarding data to get updated paths and sync state
    await refreshOnboardingData();
  };

  // Check if all required documents are uploaded (check both state and onboarding data)
  const checkAllDocumentsUploaded = useMemo(() => {
    if (!kycType || !onboarding) return false;
    
    const requiredDocs = getRequiredDocuments(kycType);
    return requiredDocs.every((docType) => {
      // Check local state first
      if (uploadedFiles[docType]) return true;
      
      // Fallback to checking onboarding data paths
      const pathField = fileTypeToPathMap[docType];
      if (pathField && onboarding) {
        const path = onboarding[pathField] as string | null;
        return !!path;
      }
      return false;
    });
  }, [kycType, onboarding, uploadedFiles]);

  const handleSubmit = async (data: FormData) => {
    if (!kycType) {
      toast.error('KYC type is not set. Please complete step 1 first.');
      return;
    }

    // Check if required documents are uploaded
    if (!checkAllDocumentsUploaded) {
      const requiredDocs = getRequiredDocuments(kycType);
      const missingDocs = requiredDocs.filter((docType) => {
        if (uploadedFiles[docType]) return false;
        const pathField = fileTypeToPathMap[docType];
        if (pathField && onboarding) {
          const path = onboarding[pathField] as string | null;
          return !path;
        }
        return true;
      });
      
      toast.error(
        `Please upload all required documents: ${missingDocs.map(getDocumentLabel).join(', ')}`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const basePayload = {
        name: data.name,
        email: data.email,
        countryCodeId: data.countryCodeId,
        phoneNumber: data.phoneNumber,
        address: data.address,
      };

      const payload: UpdateBasicDetailsPayload = isCompanyOrPartnership
        ? {
            ...basePayload,
            registrationNumber: (data as z.infer<typeof companySchema>).registrationNumber,
            dateOfIncorporation: (data as z.infer<typeof companySchema>).dateOfIncorporation,
            countryOfIncorporationId: (data as z.infer<typeof companySchema>).countryOfIncorporationId,
            doingBusinessAs: (data as z.infer<typeof companySchema>).doingBusinessAs || undefined,
            companyWebsite: (data as z.infer<typeof companySchema>).companyWebsite || undefined,
            registeredAddress: (data as z.infer<typeof companySchema>).registeredAddress || undefined,
          }
        : basePayload;

      const response = await updateBasicDetails(payload);
      handleApiResponse(response, {
        onSuccess: (responseData) => {
          if (responseData && responseData.success) {
            toast.success('Basic details updated successfully');
            onUpdate(payload);
            onNext();
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update basic details');
        },
        onValidationError: (errors, messages) => {
          const errorMsg = Array.isArray(messages) ? messages.join(', ') : messages;
          toast.error(errorMsg || 'Validation error');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Update basic details error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!kycType) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            Please complete step 1 to select your account type first.
          </div>
        </CardContent>
      </Card>
    );
  }

  const requiredDocs = getRequiredDocuments(kycType);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Fill in your basic details and upload required documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Common Fields */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {isCompanyOrPartnership ? 'Company Name' : 'Full Name'} *
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} placeholder="Enter email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="countryCodeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country Code *</FormLabel>
                        <FormControl>
                          <CountryCodeSelector
                            value={field.value}
                            onChange={field.onChange}
                            disabled={loadingCountries}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter phone number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Company/Partnership Specific Fields */}
              {isCompanyOrPartnership && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold">Company Information</h3>

                  <FormField
                    control={form.control}
                    name="registrationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Number *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter registration number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dateOfIncorporation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Incorporation *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} placeholder="YYYY-MM-DD" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="countryOfIncorporationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country of Incorporation *</FormLabel>
                          <FormControl>
                            <CountryCodeSelector
                              value={field.value}
                              onChange={field.onChange}
                              disabled={loadingCountries}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="doingBusinessAs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doing Business As (DBA)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter trading name (optional)" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyWebsite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Website</FormLabel>
                        <FormControl>
                          <Input type="url" {...field} placeholder="https://example.com (optional)" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registeredAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registered Office Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter registered address (optional)" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex flex-col items-end gap-2 pt-4">
                {!checkAllDocumentsUploaded && (
                  <p className="text-sm text-destructive">
                    Please upload all required documents to continue
                  </p>
                )}
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={isSubmitting || !checkAllDocumentsUploaded}
                >
                  {isSubmitting ? 'Saving...' : 'Continue'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Document Upload Section */}
      <div className="space-y-4">
        <h3 className="font-semibold">Required Documents</h3>
        {requiredDocs.map((docType) => {
          const pathField = fileTypeToPathMap[docType];
          const existingPath = pathField && onboarding ? onboarding[pathField] as string | null : null;
          // Check both onboarding data and uploadedFiles state
          const isAlreadyUploaded = !!existingPath || !!uploadedFiles[docType];

          return (
            <FileUploadCard
              key={docType}
              type={docType}
              label={getDocumentLabel(docType)}
              description={getDocumentDescription(docType, kycType)}
              required
              onUploadSuccess={() => handleFileUploadSuccess(docType)}
              disabled={isAlreadyUploaded}
            />
          );
        })}
      </div>
    </div>
  );
}

function getDocumentLabel(type: FileUploadType): string {
  const labels: Record<FileUploadType, string> = {
    identity_proof: 'Identity Proof',
    proof_of_address: 'Proof of Address',
    certificate_of_incorporation: 'Certificate of Incorporation',
    memorandum_of_association: 'Memorandum of Association',
    articles_of_association: 'Articles of Association',
    domain_ownership: 'Domain Ownership',
    register_of_director: 'Register of Director',
    video_kyc: 'Video KYC',
    signed_agreement: 'Signed Agreement',
  };
  return labels[type];
}

function getDocumentDescription(type: FileUploadType, kycType: KycType): string {
  const descriptions: Record<FileUploadType, string> = {
    identity_proof: 'Upload a valid government-issued ID (Passport, Driver License, etc.)',
    proof_of_address: 'Upload a recent utility bill or bank statement showing your address',
    certificate_of_incorporation: 'Upload your company certificate of incorporation',
    memorandum_of_association: 'Upload your company memorandum of association',
    articles_of_association: 'Upload your company articles of association',
    domain_ownership: 'Upload proof of domain ownership for your company website',
    register_of_director: 'Upload register of directors document',
    video_kyc: 'Upload video KYC verification',
    signed_agreement: 'Upload signed agreement document',
  };
  return descriptions[type] || '';
}
