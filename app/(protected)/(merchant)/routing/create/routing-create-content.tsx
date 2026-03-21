'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, X } from 'lucide-react';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SearchSelect } from '@/components/ui/molecules/SearchSelect';
import { MultiSelect } from '@/components/common/MultiSelect';
import { ContentLoader } from '@/components/common/content-loader';
import { toast } from 'sonner';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  createUserMerchantRouting,
} from '@/lib/services/user/routing';
import {
  getUserAcquirerAccounts,
  UserAcquirerAccount,
} from '@/lib/services/user/acquirer-accounts';
import {
  createRoutingSchema,
  CreateRoutingFormData,
} from '@/lib/validations/routing-validation';
import { formatConnectorLabel } from '@/lib/utils/connector-display';
import type { Option } from '@/lib/types/common-types';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfileId } from '@/lib/services/user/merchant-profile';
import { fetchListOfCurrencies, fetchListOfCountries } from '@/lib/fetch/fetch-options';
import {
  ROUTE_CONDITION_CATEGORIES,
  CONDITION_OPERATOR_MAP,
  CARD_TYPE_OPTIONS,
  CARD_BRAND_OPTIONS,
  CARD_WL_FT_OPTIONS,
} from '@/lib/constants/routing';
import {
  serializeRoutingConfig,
  type RoutingLeafCondition,
} from '@/lib/utils/routing-config';

const ROUTING_TYPES = [
  { value: 'CARD', label: 'Card Payments' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CRYPTO', label: 'Cryptocurrency' },
  { value: 'WALLET', label: 'Digital Wallet' },
];

import type { ConditionOperatorInputType } from '@/lib/constants/routing';

export function RoutingCreateContent() {
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
  const [currencyOptions, setCurrencyOptions] = useState<Option[]>([]);
  const [countryOptions, setCountryOptions] = useState<Option[]>([]);
  const [combineMode, setCombineMode] = useState<'AND' | 'OR'>('AND');

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
      merchantProfileId: profileId ? parseInt(profileId) : 0,
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
  const [, startTransition] = useTransition();

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

  // Fetch currencies for condition select
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const currencies = await fetchListOfCurrencies();
        setCurrencyOptions(
          currencies.map((c: { label?: string; code?: string; value?: string | number | null }) => ({
            label: c.label || c.code || String(c.value ?? ''),
            value: String(c.value ?? c.code ?? ''),
          })),
        );
      } catch {
        // swallow
      }
    };
    loadCurrencies();
  }, []);

  // Fetch countries for condition select
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countries = await fetchListOfCountries();
        setCountryOptions(countries);
      } catch {
        // swallow
      }
    };
    loadCountries();
  }, []);

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
              label: formatConnectorLabel(account),
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
  }, [profileId]);

  const getInputType = (category: string, operator: string): ConditionOperatorInputType => {
    const operators = CONDITION_OPERATOR_MAP[category] || [];
    return (operators.find((op) => op.value === operator)?.inputType || 'input') as ConditionOperatorInputType;
  };

  const normalizeConfigValue = (item: {
    category: string;
    operator: string;
    value: string | number | string[] | [number, number] | [string, string];
  }) => {
    if (item.operator === 'between' || item.operator === 'not_between') {
      const v = item.value;
      if (Array.isArray(v) && v.length === 2) {
        return [Number(v[0]), Number(v[1])] as [number, number];
      }
    }
    const inputType = getInputType(item.category, item.operator);
    const rawValue = item.value;
    const strVal = Array.isArray(rawValue) ? rawValue.join(',') : String(rawValue ?? '');

    if (inputType === 'multi-select' || inputType === 'multi-input') {
      return strVal
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    }
    if (item.category === 'amount') {
      const num = Number(rawValue);
      return Number.isNaN(num) ? rawValue : num;
    }
    return rawValue;
  };

  const onSubmit = async (data: CreateRoutingFormData): Promise<void> => {
    try {
      setIsLoading(true);

      if (!data.routingFor || !data.merchantAcquirerAccountId || !data.config?.length) {
        toast.error('Please fill in all required fields');
        return;
      }

      const leaves: RoutingLeafCondition[] = data.config.map((item) => {
        const ops = CONDITION_OPERATOR_MAP[item.category] || [];
        const validOperator = ops.some((o) => o.value === item.operator)
          ? item.operator
          : ops[0]?.value || '==';
        return {
          category: item.category,
          operator: validOperator,
          value: normalizeConfigValue(item),
        };
      });
      const finalConfig = serializeRoutingConfig(leaves, combineMode);

      const processedData = {
        ...data,
        config: finalConfig as typeof data.config,
      };

      const response = await createUserMerchantRouting(processedData as any);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Routing rule created successfully');
          router.push(`/routing?profileId=${profileId}`);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to create routing rule');
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

  const handleConfigCategoryChange = (index: number, category: string) => {
    const currentCategory = watch(`config.${index}.category`);
    if (currentCategory === category) return;
    const ops = CONDITION_OPERATOR_MAP[category] || [];
    const firstOp = ops[0]?.value || '==';
    setValue(`config.${index}.category`, category);
    setValue(`config.${index}.operator`, firstOp as any);
    setValue(`config.${index}.value`, '');
  };

  const handleConfigOperatorChange = (index: number, operator: string) => {
    const category = watch(`config.${index}.category`) || 'amount';
    const prev = watch(`config.${index}.operator`);
    if (prev === operator) return;
    setValue(`config.${index}.operator`, operator as any);
    const nextType = getInputType(category, operator);
    const prevType = getInputType(category, prev);
    if (nextType === 'range') {
      setValue(`config.${index}.value`, [0, 0] as any);
    } else if (prevType === 'range') {
      setValue(`config.${index}.value`, '');
    }
  };

  const renderConfigValueInput = (index: number) => {
    const category = watch(`config.${index}.category`);
    const operator = watch(`config.${index}.operator`);
    const value = watch(`config.${index}.value`);
    const inputType = getInputType(category, operator);

    const strValue = Array.isArray(value) ? value.join(',') : String(value ?? '');

    if (inputType === 'search-select') {
      const options =
        category === 'currency' ? currencyOptions
          : category === 'country' || category === 'bin_country' ? countryOptions
          : [];
      if (!options?.length) {
        return (
          <Input
            placeholder="Enter value"
            value={strValue}
            onChange={(e) => setValue(`config.${index}.value`, e.target.value)}
          />
        );
      }
      return (
        <SearchSelect
          options={options}
          value={strValue}
          onChange={(val) => setValue(`config.${index}.value`, val)}
          placeholder="Select value"
        />
      );
    }

    if (inputType === 'range') {
      const raw = watch(`config.${index}.value`);
      let min = 0;
      let max = 0;
      if (Array.isArray(raw) && raw.length === 2) {
        min = Number(raw[0]) || 0;
        max = Number(raw[1]) || 0;
      }
      return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <Input
            type="number"
            className="min-w-0"
            placeholder="Min"
            value={min === 0 && max === 0 ? '' : min}
            onChange={(e) => {
              const n = parseFloat(e.target.value);
              const hi = Array.isArray(raw) && raw.length === 2 ? Number(raw[1]) || 0 : max;
              setValue(`config.${index}.value`, [Number.isNaN(n) ? 0 : n, hi] as any);
            }}
          />
          <span className="text-muted-foreground text-sm shrink-0">to</span>
          <Input
            type="number"
            className="min-w-0"
            placeholder="Max"
            value={min === 0 && max === 0 ? '' : max}
            onChange={(e) => {
              const n = parseFloat(e.target.value);
              const lo = Array.isArray(raw) && raw.length === 2 ? Number(raw[0]) || 0 : min;
              setValue(`config.${index}.value`, [lo, Number.isNaN(n) ? 0 : n] as any);
            }}
          />
        </div>
      );
    }

    if (inputType === 'select') {
      const options =
        category === 'card_type' ? CARD_TYPE_OPTIONS
          : category === 'card_brand' ? CARD_BRAND_OPTIONS
          : category === 'card_wl_ft' ? CARD_WL_FT_OPTIONS
          : [];
      if (!options?.length) {
        return (
          <Input
            placeholder="Enter value"
            value={strValue}
            onChange={(e) => setValue(`config.${index}.value`, e.target.value)}
          />
        );
      }
      const validValue = options.some((o) => String(o.value) === strValue) ? strValue : '';
      return (
        <Controller
          name={`config.${index}.value`}
          control={control}
          render={({ field }) => (
            <Select
              value={validValue}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select value" />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      );
    }

    if (inputType === 'multi-input') {
      return (
        <Textarea
          placeholder="Comma separated values"
          value={strValue}
          onChange={(e) => setValue(`config.${index}.value`, e.target.value)}
        />
      );
    }

    if (inputType === 'multi-select') {
      const options =
        category === 'currency' ? currencyOptions
          : category === 'card_type' ? CARD_TYPE_OPTIONS
          : category === 'card_brand' ? CARD_BRAND_OPTIONS
          : category === 'country' || category === 'bin_country' ? countryOptions
          : [];
      if (!options?.length) {
        return (
          <Textarea
            placeholder="Comma separated values"
            value={strValue}
            onChange={(e) => setValue(`config.${index}.value`, e.target.value)}
          />
        );
      }
      const selectedValues = strValue
        ? strValue.split(',').map((v) => v.trim()).filter(Boolean)
        : [];
      return (
        <MultiSelect
          options={options}
          selected={selectedValues}
          onChange={(selected) => {
            const newVal = selected.join(',');
            startTransition(() => {
              setValue(`config.${index}.value`, newVal, { shouldValidate: false });
            });
          }}
          placeholder="Select one or more values"
        />
      );
    }

    return (
      <Input
        placeholder="Enter value"
        value={strValue}
        onChange={(e) => setValue(`config.${index}.value`, e.target.value)}
      />
    );
  };

  const removeConfigRule = (index: number) => {
    if (fields.length > 1) {
      remove(index);
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
          <Button onClick={() => router.push('/routing')}>
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
          <CardTitle>Routing Rule Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
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
                  <Controller
                    name="routingFor"
                    control={control}
                    defaultValue="CARD"
                    render={({ field }) => (
                      <Select value={field.value || 'CARD'} onValueChange={field.onChange}>
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
                    )}
                  />
                  {errors.routingFor && (
                    <p className="text-red-500 text-xs">{errors.routingFor.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Acquirer Account Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Acquirer Account</h3>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Select Acquirer Account <span className="text-red-500">*</span>
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
                    placeholder="Select an acquirer account"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground py-2 px-3 border rounded-md bg-muted/50">
                    No acquirer accounts available for this profile
                  </div>
                )}
                {errors.merchantAcquirerAccountId && (
                  <p className="text-red-500 text-xs">{errors.merchantAcquirerAccountId.message}</p>
                )}
              </div>
            </div>

            {/* Configuration Rules */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border p-4 bg-muted/30">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">How conditions combine</Label>
                  <Select
                    value={combineMode}
                    onValueChange={(v) => setCombineMode(v as 'AND' | 'OR')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">All must match (AND)</SelectItem>
                      <SelectItem value="OR">Any one matches (OR)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    AND requires every row to match. OR matches when any row matches (sent as a single OR group to the API).
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Configuration Rules</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addConfigRule}
                >
                  <Plus className="h-4 w-4 me-1" />
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
                        <Controller
                          name={`config.${index}.category`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value || 'amount'}
                              onValueChange={(value) => handleConfigCategoryChange(index, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {ROUTE_CONDITION_CATEGORIES.map((cat) => (
                                  <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Operator <span className="text-red-500">*</span>
                        </Label>
                        <Controller
                          name={`config.${index}.operator`}
                          control={control}
                          render={({ field }) => {
                            const category = watch(`config.${index}.category`) || 'amount';
                            const operators = CONDITION_OPERATOR_MAP[category] || [];
                            const validOperator = operators.some((o) => o.value === field.value)
                              ? field.value
                              : operators[0]?.value || '==';
                            return (
                              <Select
                                key={`operator-${index}-${category}`}
                                value={validOperator}
                                onValueChange={(value) => handleConfigOperatorChange(index, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select operator" />
                                </SelectTrigger>
                                <SelectContent>
                                  {operators.map((op) => (
                                    <SelectItem key={op.value} value={op.value}>
                                      {op.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            );
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Value <span className="text-red-500">*</span>
                        </Label>
                        {renderConfigValueInput(index)}
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
            <div className="flex items-center justify-between rounded-lg border p-4">
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
                {isLoading ? 'Creating...' : 'Create Routing Rule'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

