'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus } from 'lucide-react';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SearchSelect } from '@/components/ui/molecules/SearchSelect';
import { ContentLoader } from '@/components/common/content-loader';
import { toast } from 'sonner';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  createUserMerchantCascading,
} from '@/lib/services/user/cascading';
import {
  getUserAcquirerAccounts,
  UserAcquirerAccount,
} from '@/lib/services/user/acquirer-accounts';
import {
  createCascadingSchema,
  CreateCascadingFormData,
} from '@/lib/validations/routing-validation';
import type { Option } from '@/lib/types/common-types';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfileId } from '@/lib/services/user/merchant-profile';

const CASCADING_TYPES = [
  { value: 'DECLINED', label: 'Declined Transactions' },
  { value: 'FAILED', label: 'Failed Transactions' },
  { value: 'TIMEOUT', label: 'Timeout Transactions' },
  { value: 'INSUFFICIENT_FUNDS', label: 'Insufficient Funds' },
];

export function CascadingCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const urlProfileId = searchParams.get('profileId');
  
  // Get profileId using the centralized utility function
  const resolvedProfileId = getUserProfileId(urlProfileId, user);
  const [profileId, setProfileId] = useState<string | null>(resolvedProfileId);
  const [profileIdResolved, setProfileIdResolved] = useState(!!resolvedProfileId);

  const [isLoading, setIsLoading] = useState(false);
  const [acquirerAccounts, setAcquirerAccounts] = useState<UserAcquirerAccount[]>([]);
  const [acquirerOptions, setAcquirerOptions] = useState<Option[]>([]);
  const [loadingAcquirers, setLoadingAcquirers] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateCascadingFormData>({
    resolver: zodResolver(createCascadingSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      merchantProfileId: profileId ? parseInt(profileId) : 0,
      merchantAcquirerAccountId: 0,
      type: 'DECLINED',
      cascadingFor: 0,
      status: true,
    },
  });

  const watchedPrimaryAccount = watch('merchantAcquirerAccountId');
  const watchedSecondaryAccount = watch('cascadingFor');

  // Resolve profileId when user data becomes available
  useEffect(() => {
    if (profileIdResolved) {
      return;
    }

    // Get profileId using the utility function
    const resolved = getUserProfileId(urlProfileId, user);
    if (resolved) {
      setProfileId(resolved);
      setProfileIdResolved(true);
    } else {
      // If still no profileId after user data is available, mark as resolved
      setProfileIdResolved(true);
    }
  }, [user, urlProfileId, profileIdResolved]);

  // Update form when profileId changes
  useEffect(() => {
    if (profileId) {
      setValue('merchantProfileId', parseInt(profileId));
    }
  }, [profileId, setValue]);

  // Fetch acquirer accounts
  useEffect(() => {
    const fetchAcquirerAccounts = async () => {
      setLoadingAcquirers(true);
      try {
        const response = await getUserAcquirerAccounts();

        handleApiResponse(response, {
          onSuccess: (data) => {
            const accounts = Array.isArray(data.data)
              ? data.data
              : (data.data?.data ?? []);
            setAcquirerAccounts(accounts);

            const options = accounts.map((account: UserAcquirerAccount) => ({
              value: account.id.toString(),
              label: `${account.name} (${account.acquirerAccount?.name || 'Unknown'} - ${account.currencyCode || 'N/A'})`,
            }));
            setAcquirerOptions(options);
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load acquirer accounts');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred while loading acquirer accounts');
      } finally {
        setLoadingAcquirers(false);
      }
    };

    fetchAcquirerAccounts();
  }, []);

  const onSubmit = async (data: CreateCascadingFormData): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Submitting cascading data:', data); // Debug log

      // Find the selected accounts for config generation
      const primaryAccount = acquirerAccounts.find(acc => acc.id === data.merchantAcquirerAccountId.toString());
      const secondaryAccount = acquirerAccounts.find(acc => acc.id === data.cascadingFor.toString());

      // Generate config array
      const config = [
        {
          merchantAcquirerAccountId: data.merchantAcquirerAccountId.toString(),
          merchantAcquirerAccountName: 'Primary'
        },
        {
          merchantAcquirerAccountId: data.cascadingFor.toString(),
          merchantAcquirerAccountName: 'Fallback'
        }
      ];

      const payload = {
        ...data,
        config
      };

      console.log('Final payload:', payload); // Debug log

      const response = await createUserMerchantCascading(payload);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Cascading rule created successfully');
          router.push(`/cascading?profileId=${profileId}`);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to create cascading rule');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while determining profileId
  if (!profileIdResolved) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center py-12">
          <ContentLoader />
          <p className="text-muted-foreground mt-4">Loading profile information...</p>
        </div>
      </Container>
    );
  }

  // Show error if no profileId found after checking
  if (!profileId) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Profile ID is required. Please select a merchant profile first.</p>
          <Button onClick={() => router.push('/cascading')}>
            <X className="h-4 w-4 me-1" />
            Go Back
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>Cascading Rule Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Cascading Rule Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="e.g., Declined -> fallback chain"
                    className="w-full"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium">
                    Cascading Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue('type', value as any)}
                    defaultValue="DECLINED"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cascading type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CASCADING_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-red-500 text-xs">{errors.type.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Account Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Primary Account <span className="text-red-500">*</span>
                  </Label>
                  {loadingAcquirers ? (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ContentLoader />
                      <span>Loading acquirer accounts...</span>
                    </div>
                  ) : acquirerOptions.length > 0 ? (
                    <SearchSelect
                      options={acquirerOptions}
                      value={watch('merchantAcquirerAccountId')?.toString() || ''}
                      onChange={(value) => setValue('merchantAcquirerAccountId', parseInt(value))}
                      placeholder="Select primary account"
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground py-2 px-3 border rounded-md bg-muted/50">
                      No acquirer accounts available
                    </div>
                  )}
                  {errors.merchantAcquirerAccountId && (
                    <p className="text-red-500 text-xs">{errors.merchantAcquirerAccountId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Fallback Account <span className="text-red-500">*</span>
                  </Label>
                  {loadingAcquirers ? (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ContentLoader />
                      <span>Loading acquirer accounts...</span>
                    </div>
                  ) : acquirerOptions.length > 0 ? (
                    <SearchSelect
                      options={acquirerOptions}
                      value={watch('cascadingFor')?.toString() || ''}
                      onChange={(value) => setValue('cascadingFor', parseInt(value))}
                      placeholder="Select fallback account"
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground py-2 px-3 border rounded-md bg-muted/50">
                      No acquirer accounts available
                    </div>
                  )}
                  {errors.cascadingFor && (
                    <p className="text-red-500 text-xs">{errors.cascadingFor.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h3 className="text-lg font-semibold">Active Status</h3>
                <p className="text-sm text-muted-foreground">
                  Enable or disable this cascading rule
                </p>
              </div>
              <Switch
                checked={watch('status')}
                onCheckedChange={(checked) => setValue('status', checked)}
              />
            </div>

            {/* Submit Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                <X className="h-4 w-4 me-1" />
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || loadingAcquirers}
              >
                <Plus className="h-4 w-4 me-1" />
                {isLoading ? 'Creating...' : 'Create Cascading Rule'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

