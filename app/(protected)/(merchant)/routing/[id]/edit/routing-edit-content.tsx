'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
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
  getUserMerchantRoutingById,
  updateUserMerchantRouting,
  UserRouteRule,
} from '@/lib/services/user/routing';
import {
  getUserAcquirerAccounts,
  UserAcquirerAccount,
} from '@/lib/services/user/acquirer-accounts';
import {
  createRoutingSchema,
  CreateRoutingFormData,
} from '@/lib/validations/routing-validation';
import type { Option } from '@/lib/types/common-types';

const ROUTING_TYPES = [
  { value: 'CARD', label: 'Card Payments' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CRYPTO', label: 'Cryptocurrency' },
  { value: 'WALLET', label: 'Digital Wallet' },
];

const OPERATORS = [
  { value: '>=', label: 'Greater than or equal (>=)' },
  { value: '<=', label: 'Less than or equal (<=)' },
  { value: '>', label: 'Greater than (>)' },
  { value: '<', label: 'Less than (<)' },
  { value: '==', label: 'Equal (==)' },
  { value: '!=', label: 'Not equal (!=)' },
];

const CONFIG_CATEGORIES = [
  { value: 'amount', label: 'Transaction Amount' },
  { value: 'currency', label: 'Currency' },
  { value: 'country', label: 'Country' },
  { value: 'card_type', label: 'Card Type' },
  { value: 'payment_method', label: 'Payment Method' },
];

export function RoutingEditContent() {
  const router = useRouter();
  const params = useParams();
  const routingId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [loadingRouting, setLoadingRouting] = useState(true);
  const [routingData, setRoutingData] = useState<UserRouteRule | null>(null);
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
  } = useForm<CreateRoutingFormData>({
    resolver: zodResolver(createRoutingSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      routingFor: 'CARD',
      merchantProfileId: 0,
      merchantAcquirerAccountId: undefined,
      config: [{ category: 'amount', operator: '>=', value: '' }],
      splitEnable: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'config',
  });

  const watchedSplitEnable = watch('splitEnable');

  // Fetch routing data and acquirer accounts
  useEffect(() => {
    const fetchData = async () => {
      if (!routingId) {
        toast.error('Routing ID is missing');
        router.push('/routing');
        return;
      }

      setLoadingRouting(true);
      setLoadingAcquirers(true);

      try {
        // Fetch routing data
        const routingResponse = await getUserMerchantRoutingById(routingId);
        handleApiResponse(routingResponse, {
          onSuccess: (data) => {
            if (data.success && data.data) {
              const routing = data.data;
              setRoutingData(routing);

              // Extract connector ID from merchantConnector
              const connectorId = routing.merchantConnector?.id
                ? parseInt(routing.merchantConnector.id.toString())
                : routing.connectorId
                ? parseInt(routing.connectorId.toString())
                : undefined;

              // Pre-populate form with existing data
              reset({
                name: routing.name || '',
                routingFor: routing.routingFor || 'CARD',
                merchantProfileId: routing.merchantProfileId
                  ? parseInt(routing.merchantProfileId.toString())
                  : 0,
                merchantAcquirerAccountId: connectorId,
                config: routing.config && Array.isArray(routing.config) && routing.config.length > 0
                  ? routing.config.map((item: any) => ({
                      category: item.category || 'amount',
                      operator: item.operator || '>=',
                      value: item.value?.toString() || '',
                    }))
                  : [{ category: 'amount', operator: '>=', value: '' }],
                splitEnable: routing.splitEnable || false,
              });
            } else {
              toast.error('Routing rule not found');
              router.push('/routing');
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load routing rule');
            router.push('/routing');
          },
        });

        // Fetch acquirer accounts
        const acquirerResponse = await getUserAcquirerAccounts();
        handleApiResponse(acquirerResponse, {
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
        router.push('/routing');
      } finally {
        setLoadingRouting(false);
        setLoadingAcquirers(false);
      }
    };

    fetchData();
  }, [routingId, router, reset]);

  const onSubmit = async (data: CreateRoutingFormData): Promise<void> => {
    if (!routingId) {
      toast.error('Routing ID is missing');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Updating routing data:', data);

      // Ensure all required fields are present and valid
      if (!data.routingFor || !data.merchantAcquirerAccountId || !data.config?.length) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Convert config values to appropriate types and exclude merchantProfileId
      const { merchantProfileId, ...updatePayload } = data;
      const processedData = {
        ...updatePayload,
        config: data.config.map(item => ({
          ...item,
          value: item.category === 'amount' && typeof item.value === 'string'
            ? parseFloat(item.value) || item.value
            : item.value
        }))
      };

      const response = await updateUserMerchantRouting(routingId, processedData);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Routing rule updated successfully');
          router.push('/routing');
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update routing rule');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const addConfigRule = () => {
    append({ category: 'amount', operator: '>=', value: '' });
  };

  const removeConfigRule = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  if (loadingRouting) {
    return (
      <Container>
        <Toolbar>
          <ToolbarHeading title="Edit Routing Rule" icon={ArrowLeft} />
        </Toolbar>
        <div className="max-w-4xl mx-auto py-12">
          <ContentLoader />
        </div>
      </Container>
    );
  }

  if (!routingData) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Routing rule not found</p>
          <Button onClick={() => router.push('/routing')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarActions>
            <Button
              variant="outline"
              onClick={() => router.back()}
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
                    Routing Rule Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="e.g., Amount >= 1000 -> Use Connector"
                    className="w-full"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routingFor" className="text-sm font-medium">
                    Routing Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue('routingFor', value as any)}
                    value={watch('routingFor')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select routing type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROUTING_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.routingFor && (
                    <p className="text-red-500 text-xs">{errors.routingFor.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Acquirer Account Selection */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Acquirer Account</h3>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Select Acquirer Account <span className="text-red-500">*</span>
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
                    placeholder="Select an acquirer account"
                    disabled={loadingAcquirers}
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

            {/* Configuration Rules */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Configuration Rules</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addConfigRule}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-sm">Rule #{index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeConfigRule(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Category <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            setValue(`config.${index}.category`, value)
                          }
                          value={watch(`config.${index}.category`)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CONFIG_CATEGORIES.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Operator <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            setValue(`config.${index}.operator`, value as any)
                          }
                          value={watch(`config.${index}.operator`)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {OPERATORS.map((operator) => (
                              <SelectItem key={operator.value} value={operator.value}>
                                {operator.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Value <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          {...register(`config.${index}.value`)}
                          placeholder="Enter value"
                          className="w-full"
                        />
                      </div>
                    </div>

                    {errors.config?.[index] && (
                      <div className="mt-2">
                        {errors.config[index]?.category && (
                          <p className="text-red-500 text-xs">
                            Category: {errors.config[index]?.category?.message}
                          </p>
                        )}
                        {errors.config[index]?.operator && (
                          <p className="text-red-500 text-xs">
                            Operator: {errors.config[index]?.operator?.message}
                          </p>
                        )}
                        {errors.config[index]?.value && (
                          <p className="text-red-500 text-xs">
                            Value: {errors.config[index]?.value?.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {errors.config && typeof errors.config.message === 'string' && (
                <p className="text-red-500 text-xs mt-2">{errors.config.message}</p>
              )}
            </div>

            {/* Split Enable Toggle */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Split Payments</h3>
                  <p className="text-sm text-muted-foreground">
                    Enable split payment processing across multiple acquirers
                  </p>
                </div>
                <Switch
                  checked={watchedSplitEnable}
                  onCheckedChange={(checked) => setValue('splitEnable', checked)}
                />
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || loadingAcquirers}
              >
                {isLoading ? 'Updating...' : 'Update Routing Rule'}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </>
  );
}

