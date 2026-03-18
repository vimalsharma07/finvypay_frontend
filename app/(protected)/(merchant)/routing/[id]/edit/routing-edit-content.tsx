'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
import { fetchListOfCurrencies, fetchListOfCountries } from '@/lib/fetch/fetch-options';
import {
  ROUTE_CONDITION_CATEGORIES,
  CONDITION_OPERATOR_MAP,
  CARD_TYPE_OPTIONS,
  CARD_BRAND_OPTIONS,
  CARD_WL_FT_OPTIONS,
} from '@/lib/constants/routing';
import type { ConditionOperatorInputType } from '@/lib/constants/routing';
import {
  serializeRoutingConfig,
  parseRoutingConfig,
  leafConditionToFormRow,
  type RoutingLeafCondition,
} from '@/lib/utils/routing-config';
import { formatConnectorLabel } from '@/lib/utils/connector-display';

const ROUTING_TYPES = [
  { value: 'CARD', label: 'Card Payments' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CRYPTO', label: 'Cryptocurrency' },
  { value: 'WALLET', label: 'Digital Wallet' },
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
  const [, startTransition] = useTransition();

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

              const { combineMode: parsedMode, leaves } = parseRoutingConfig(routing.config);
              const configItems =
                leaves.length > 0
                  ? leaves.map((leaf) => {
                      const row = leafConditionToFormRow(leaf);
                      let category = row.category || 'amount';
                      if (category === 'country_customer') category = 'country';
                      if (category === 'country_issuer') category = 'bin_country';
                      const ops = CONDITION_OPERATOR_MAP[category] || [];
                      const rawOp = row.operator || '>=';
                      const validOperator = ops.some((o) => o.value === rawOp)
                        ? rawOp
                        : ops[0]?.value || '==';
                      return {
                        category,
                        operator: validOperator,
                        value: row.value as string | number | string[] | [number, number],
                      };
                    })
                  : [{ category: 'amount', operator: '>=', value: '' }];

              setCombineMode(parsedMode);

              reset({
                name: routing.name || '',
                routingFor: (routing.routingFor || 'CARD') as CreateRoutingFormData['routingFor'],
                merchantProfileId: routing.merchantProfileId
                  ? parseInt(routing.merchantProfileId.toString())
                  : 0,
                merchantAcquirerAccountId: connectorId,
                config: configItems as CreateRoutingFormData['config'],
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
              label: formatConnectorLabel(account),
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

  // Fetch currencies and countries for condition select
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
    const loadCountries = async () => {
      try {
        const countries = await fetchListOfCountries();
        setCountryOptions(countries);
      } catch {
        // swallow
      }
    };
    loadCurrencies();
    loadCountries();
  }, []);

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
      return strVal.split(',').map((v) => v.trim()).filter(Boolean);
    }
    if (item.category === 'amount') {
      const num = Number(rawValue);
      return Number.isNaN(num) ? rawValue : num;
    }
    return rawValue;
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
            <Select value={validValue} onValueChange={field.onChange}>
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
      const selectedValues = strValue ? strValue.split(',').map((v) => v.trim()).filter(Boolean) : [];
      return (
        <MultiSelect
          options={options}
          selected={selectedValues}
          onChange={(selected) => {
            startTransition(() => {
              setValue(`config.${index}.value`, selected.join(','), { shouldValidate: false });
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

  const onSubmit = async (data: CreateRoutingFormData): Promise<void> => {
    if (!routingId) {
      toast.error('Routing ID is missing');
      return;
    }

    try {
      setIsLoading(true);
      // Ensure all required fields are present and valid
      if (!data.routingFor || !data.merchantAcquirerAccountId || !data.config?.length) {
        toast.error('Please fill in all required fields');
        return;
      }

      const { merchantProfileId, ...updatePayload } = data;
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
        ...updatePayload,
        config: finalConfig as (typeof data)['config'],
      };

      const response = await updateUserMerchantRouting(routingId, processedData as any);

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
            <ArrowLeft className="h-4 w-4 mr-1" />
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
              <ArrowLeft className="h-4 w-4 mr-1" />
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
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Acquirer Account</h3>
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
              <div className="mb-4 rounded-lg border p-4 bg-muted/30">
                <div className="space-y-2 max-w-md">
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Configuration Rules</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addConfigRule}
                >
                  <Plus className="h-4 w-4 mr-1" />
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

