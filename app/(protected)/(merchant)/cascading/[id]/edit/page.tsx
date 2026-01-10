'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, ArrowLeft } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Button } from '@/components/ui/button';
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
  getUserMerchantCascadingById,
  updateUserMerchantCascading,
  UserCascadingRule,
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

const CASCADING_TYPES = [
  { value: 'DECLINED', label: 'Declined Transactions' },
  { value: 'FAILED', label: 'Failed Transactions' },
  { value: 'TIMEOUT', label: 'Timeout Transactions' },
  { value: 'INSUFFICIENT_FUNDS', label: 'Insufficient Funds' },
];

export default function EditCascadingPage() {
  const params = useParams();
  const router = useRouter();
  const cascadingId = params.id as string;

  const [cascading, setCascading] = useState<UserCascadingRule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
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
      merchantProfileId: 0,
      merchantAcquirerAccountId: 0,
      type: 'DECLINED',
      cascadingFor: 0,
      status: true,
    },
  });

  const watchedPrimaryAccount = watch('merchantAcquirerAccountId');
  const watchedSecondaryAccount = watch('cascadingFor');

  // Fetch cascading data and acquirer accounts
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);

      try {
        // Fetch cascading data
        const cascadingResponse = await getUserMerchantCascadingById(cascadingId);
        handleApiResponse(cascadingResponse, {
          onSuccess: (data) => {
            if (data.success && data.data) {
              setCascading(data.data);

              // Find primary and fallback accounts from config
              const primaryAccount = data.data.config?.find(
                (item: { merchantAcquirerAccountId?: string; merchantAcquirerAccountName?: string }) =>
                  item.merchantAcquirerAccountName === 'Primary'
              );
              const fallbackAccount = data.data.config?.find(
                (item: { merchantAcquirerAccountId?: string; merchantAcquirerAccountName?: string }) =>
                  item.merchantAcquirerAccountName === 'Fallback'
              );

              // Set form values
              reset({
                name: data.data.name,
                merchantProfileId: parseInt(data.data.merchantProfileId || '0'), // Keep for form state but exclude from payload
                merchantAcquirerAccountId: parseInt(primaryAccount?.merchantAcquirerAccountId || '0'),
                type: data.data.type || 'DECLINED',
                cascadingFor: parseInt(fallbackAccount?.merchantAcquirerAccountId || data.data.cascadingFor?.toString() || '0'),
                status: data.data.status,
              });
            } else {
              toast.error('Cascading rule not found');
              router.push('/cascading');
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load cascading rule');
            router.push('/cascading');
          },
        });

        // Fetch acquirer accounts
        setLoadingAcquirers(true);
        const accountsResponse = await getUserAcquirerAccounts();
        handleApiResponse(accountsResponse, {
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
        toast.error('An unexpected error occurred');
        router.push('/cascading');
      } finally {
        setLoadingData(false);
        setLoadingAcquirers(false);
      }
    };

    fetchData();
  }, [cascadingId, router, reset]);

  const onSubmit = async (data: CreateCascadingFormData): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Updating cascading data:', data); // Debug log

      // Ensure all required fields are present and valid
      if (!data.cascadingFor || !data.merchantAcquirerAccountId || !data.name.trim()) {
        toast.error('Please fill in all required fields');
        return;
      }

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

      // Remove merchantProfileId from payload as it's not needed for update
      const { merchantProfileId, ...payloadData } = data;
      const payload = {
        ...payloadData,
        config
      };

      console.log('Final update payload:', payload); // Debug log

      const response = await updateUserMerchantCascading(cascadingId, payload);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Cascading rule updated successfully');
          router.push(`/cascading/${cascadingId}`);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update cascading rule');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Container>
        <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <ContentLoader />
          <span>Loading cascading rule data...</span>
        </div>
      </Container>
    );
  }

  if (!cascading) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Cascading rule not found</p>
          <Button onClick={() => router.push('/cascading')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cascading Rules
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title={`Edit: ${cascading.name}`}
            description="Update cascading rule configuration and settings"
            icon={Edit}
          />
          <ToolbarActions>
            <Button
              variant="outline"
              onClick={() => router.push(`/cascading/${cascadingId}`)}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
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
                    value={watch('type')}
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
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Account Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Primary Account <span className="text-red-500">*</span>
                  </Label>
                  {loadingAcquirers ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
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
            </div>

            {/* Submit Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/cascading/${cascadingId}`)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || loadingAcquirers}
              >
                {isLoading ? 'Updating...' : 'Update Cascading Rule'}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </>
  );
}
