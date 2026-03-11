'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
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

const CASCADING_FOR_OPTIONS = [
  { label: 'Card', value: 1 },
  { label: 'UPI', value: 2 },
  { label: 'Crypto', value: 3 },
  { label: 'APM', value: 4 },
];

const DURATION_OPTIONS = [
  { value: '30 mins', label: '30 minutes' },
  { value: '1 hour', label: '1 hour' },
  { value: '2 hours', label: '2 hours' },
  { value: '4 hours', label: '4 hours' },
  { value: '6 hours', label: '6 hours (default)' },
  { value: '8 hours', label: '8 hours' },
  { value: '12 hours', label: '12 hours' },
  { value: '24 hours', label: '24 hours' },
];

export function CascadingCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const urlProfileId = searchParams.get('profileId');

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
  } = useForm<CreateCascadingFormData>({
    resolver: zodResolver(createCascadingSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      merchantProfileId: profileId ? parseInt(profileId) : 0,
      merchantAcquirerAccountId: 0,
      type: 'DECLINED',
      duration: '6 hours',
      cascadingFor: 1,
      status: true,
      config: [{ merchantAcquirerAccountId: '', merchantAcquirerAccountName: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'config',
  });

  const watchedPrimaryAccount = watch('merchantAcquirerAccountId');

  useEffect(() => {
    if (profileIdResolved) return;
    const resolved = getUserProfileId(urlProfileId, user);
    if (resolved) setProfileId(resolved);
    setProfileIdResolved(true);
  }, [user, urlProfileId, profileIdResolved]);

  useEffect(() => {
    if (profileId) setValue('merchantProfileId', parseInt(profileId));
  }, [profileId, setValue]);

  // Fetch acquirer accounts for the current merchant profile
  useEffect(() => {
    const fetchAcquirerAccounts = async () => {
      if (!profileId) {
        setAcquirerAccounts([]);
        setAcquirerOptions([]);
        return;
      }
      setLoadingAcquirers(true);
      try {
        const response = await getUserAcquirerAccounts({
          merchantProfileId: profileId,
        });
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
      } catch {
        toast.error('An unexpected error occurred while loading acquirer accounts');
      } finally {
        setLoadingAcquirers(false);
      }
    };
    fetchAcquirerAccounts();
  }, [profileId]);

  const onSubmit = async (data: CreateCascadingFormData): Promise<void> => {
    try {
      setIsLoading(true);
      const config = data.config
        .filter((c) => c.merchantAcquirerAccountId && c.merchantAcquirerAccountName)
        .map((c) => ({
          merchantAcquirerAccountId: c.merchantAcquirerAccountId,
          merchantAcquirerAccountName: c.merchantAcquirerAccountName,
        }));
      if (config.length === 0) {
        toast.error('At least one fallback connector is required');
        return;
      }
      const hasPrimaryAsFallback = config.some(
        (c) => c.merchantAcquirerAccountId === String(data.merchantAcquirerAccountId)
      );
      if (hasPrimaryAsFallback) {
        toast.error('Fallback connector cannot be the same as Primary Connector');
        return;
      }
      const payload = {
        name: data.name,
        merchantProfileId: data.merchantProfileId,
        merchantAcquirerAccountId: data.merchantAcquirerAccountId,
        type: data.type,
        duration: data.duration || '6 hours',
        cascadingFor: data.cascadingFor,
        status: data.status,
        config,
      };
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
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Cascading For</Label>
                  <Select
                    value={watch('cascadingFor')?.toString() || '1'}
                    onValueChange={(value) => setValue('cascadingFor', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {CASCADING_FOR_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value.toString()}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Duration</Label>
                  <Select
                    value={watch('duration') || '6 hours'}
                    onValueChange={(value) => setValue('duration', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Account Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Primary Account <span className="text-red-500">*</span>
                  </Label>
                  {loadingAcquirers ? (
                    <div className="flex gap-1 text-sm text-muted-foreground">
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
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Fallback Connectors (order matters)</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ merchantAcquirerAccountId: '', merchantAcquirerAccountName: '' })}
                >
                  Add Fallback
                </Button>
              </div>
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-6 gap-3 border rounded-md p-3"
                >
                  <div className="md:col-span-5 space-y-2">
                    <Label className="text-sm font-medium">Fallback Connector</Label>
                    <Select
                      value={watch(`config.${idx}.merchantAcquirerAccountId`) || ''}
                      onValueChange={(val) => {
                        const label = acquirerOptions.find((o) => o.value === val)?.label || '';
                        setValue(`config.${idx}.merchantAcquirerAccountId`, val);
                        setValue(`config.${idx}.merchantAcquirerAccountName`, label);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fallback connector" />
                      </SelectTrigger>
                      <SelectContent>
                        {acquirerOptions.map((opt) => {
                          const optVal = opt.value == null ? '' : String(opt.value);
                          const isPrimary = optVal === String(watchedPrimaryAccount);
                          return (
                            <SelectItem
                              key={optVal || opt.label}
                              value={optVal}
                              disabled={isPrimary}
                            >
                              {opt.label}
                              {isPrimary ? ' (Primary)' : ''}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(idx)}
                      disabled={fields.length === 1}
                      className="w-full"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              {errors.config?.root && (
                <p className="text-red-500 text-xs">{errors.config.root.message}</p>
              )}
            </div>

            <div className="flex justify-between items-center rounded-lg border p-4">
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
