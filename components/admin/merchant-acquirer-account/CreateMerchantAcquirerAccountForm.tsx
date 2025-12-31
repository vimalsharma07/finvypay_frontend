'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchSelect } from '@/components/ui/molecules/SearchSelect';
import { ContentLoader } from '@/components/common/content-loader';
import { toast } from 'sonner';
import { CONNECTOR_TYPES, CONNECTOR_RATES_TYPE, CRYPTO_FLOW } from '@/lib/constants/connector';
import {
  userCardConnectorRateSchema,
  userTieredConnectorRateSchema,
  userCryptoPayinConnectorRateSchema,
  userTieredPayinConnectorRateSchema,
} from '@/lib/validations/connector-validation';
import {
  fetchAdminProviderOptions,
  fetchAdminProviderConnectorsOptions,
  fetchListOfCurrencies,
} from '@/lib/fetch/fetch-options';
import {
  getMerchantProfiles,
  type MerchantProfile as AdminMerchantProfile,
} from '@/lib/services/admin/merchant-acquirer-account';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import type { Option } from '@/lib/types/common-types';

interface FormField {
  label: string;
  name: string;
  value: string;
  placeholder: string;
}

const formFields: FormField[] = [
  {
    label: 'Default MDR',
    name: 'base_mdr',
    value: '',
    placeholder: 'Enter Default MDR',
  },
  {
    label: 'Visa MDR',
    name: 'visa_mdr',
    value: '',
    placeholder: 'Enter Visa MDR',
  },
  {
    label: 'Master MDR',
    name: 'master_mdr',
    value: '',
    placeholder: 'Enter Master MDR',
  },
  {
    label: 'Rolling Reserve',
    name: 'rolling_reserve',
    value: '',
    placeholder: 'Enter Rolling Reserve',
  },
  {
    label: 'Success Transaction Fee',
    name: 'success_transaction_fee',
    value: '',
    placeholder: 'Enter Success Transaction Fee',
  },
  {
    label: 'Declined Transaction Fee',
    name: 'declined_transaction_fee',
    value: '',
    placeholder: 'Enter Declined Transaction Fee',
  },
  {
    label: 'Chargeback Fee',
    name: 'chargeback_fee',
    value: '',
    placeholder: 'Enter Chargeback Fee',
  },
  {
    label: 'Flagged Fee',
    name: 'flagged_fee',
    value: '',
    placeholder: 'Enter Flagged Fee',
  },
  {
    label: 'Setup Fee',
    name: 'setup_fee',
    value: '',
    placeholder: 'Enter Setup Fee',
  },
  {
    label: 'Refund Fee',
    name: 'refund_fee',
    value: '',
    placeholder: 'Enter Refund Fee',
  },
];

const tieredFormFields: FormField[] = [
  {
    label: 'Default MDR',
    name: 'default_mdr',
    value: '',
    placeholder: 'Enter Default MDR',
  },
  {
    label: 'Setup Fee',
    name: 'setup_fee',
    value: '',
    placeholder: 'Enter Setup Fee',
  },
  {
    label: 'Refund Fee',
    name: 'refund_fee',
    value: '',
    placeholder: 'Enter Refund Fee',
  },
  {
    label: 'Chargeback Fee',
    name: 'chargeback_fee',
    value: '',
    placeholder: 'Enter Chargeback Fee',
  },
  {
    label: 'Suspicious Fee',
    name: 'suspicious_fee',
    value: '',
    placeholder: 'Enter Suspicious Fee',
  },
  {
    label: 'Rolling Reserve',
    name: 'rolling_reserve',
    value: '',
    placeholder: 'Enter Rolling Reserve',
  },
  {
    label: 'Success Transaction Fee',
    name: 'success_transaction_fee',
    value: '',
    placeholder: 'Enter Success Transaction Fee',
  },
  {
    label: 'Declined Transaction Fee',
    name: 'declined_transaction_fee',
    value: '',
    placeholder: 'Enter Declined Transaction Fee',
  },
];

const DEFAULT_FORM_DATA = {
  base_mdr: '',
  visa_mdr: '',
  master_mdr: '',
  rolling_reserve: '',
  success_transaction_fee: '',
  declined_transaction_fee: '',
  chargeback_fee: '',
  flagged_fee: '',
  setup_fee: '',
  refund_fee: '',
  mdr: [{ min: '', max: '', rate: '' }],
};

interface CreateMerchantAcquirerAccountFormProps {
  userId: number;
  userProfileId?: number;
  onSubmit: (data: any) => Promise<void>;
}

export function CreateMerchantAcquirerAccountForm({
  userId,
  userProfileId,
  onSubmit,
}: CreateMerchantAcquirerAccountFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('CARD');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedConnector, setSelectedConnector] = useState<string>('');
  const [cryptoFlow, setCryptoFlow] = useState<number | undefined>();
  const [description, setDescription] = useState<string>('');
  const [filteredConnectorOptions, setFilteredConnectorOptions] = useState<Option[] | null>(null);
  const [schema, setSchema] = useState<any>(userCardConnectorRateSchema);
  const [selectedTab, setSelectedTab] = useState<string>('normal');
  const [formData, setFormData] = useState<FormField[]>(formFields);
  const [additionalError, setAdditionalError] = useState<string>('');
  const [providerOptions, setProviderOptions] = useState<Option[]>([]);
  const [currencyOptions, setCurrencyOptions] = useState<Option[]>([]);
  const [merchantProfileOptions, setMerchantProfileOptions] = useState<Option[]>([]);
  const [merchantProfiles, setMerchantProfiles] = useState<AdminMerchantProfile[]>([]);
  const [selectedMerchantProfile, setSelectedMerchantProfile] = useState<string>('');
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  type UserConnectorRateSchemaType = any;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    control,
    reset,
  } = useForm<UserConnectorRateSchemaType>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: DEFAULT_FORM_DATA,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'mdr',
  });

  // Fetch provider, currency, and merchant profile options
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const [providers, currencies, merchantProfilesResponse] = await Promise.all([
          fetchAdminProviderOptions(),
          fetchListOfCurrencies(),
          getMerchantProfiles(userId),
        ]);

        if (providers.length === 0) {
          console.warn('No providers found. Check if acquirers exist in the database.');
        }
        if (currencies.length === 0) {
          console.warn('No currencies found. Check if currencies exist in the database.');
        }

        setProviderOptions(providers);
        setCurrencyOptions(currencies);

        // Handle merchant profiles response
        console.log('Merchant profiles API response:', merchantProfilesResponse);
        handleApiResponse(merchantProfilesResponse, {
          onSuccess: (data) => {
            console.log('Merchant profiles onSuccess data:', data);
            if (data && data.success && data.data) {
              const profiles = (Array.isArray(data.data) ? data.data : []) as AdminMerchantProfile[];
              setMerchantProfiles(profiles);

              const profileOptions = profiles.map((profile) => ({
                value: profile.id.toString(),
                label:
                  profile.industry?.name ||
                  profile.merchantProfileName ||
                  `Profile ${profile.id}`,
              }));
              console.log('Mapped merchant profiles:', profileOptions);
              setMerchantProfileOptions(profileOptions);

              // Auto-select primary profile if available
              const primaryProfile = profiles.find((p) => p.isPrimary);
              if (primaryProfile && !userProfileId) {
                setSelectedMerchantProfile(primaryProfile.id.toString());
                setSelectedIndustryId(primaryProfile.industryId?.toString() || '');
              } else if (userProfileId) {
                const matchedProfile = profiles.find(
                  (profile) => profile.id.toString() === userProfileId.toString()
                );
                setSelectedMerchantProfile(userProfileId.toString());
                setSelectedIndustryId(matchedProfile?.industryId?.toString() || '');
              }
            } else {
              console.warn('Merchant profiles data structure unexpected:', data);
            }
          },
          onError: (errorMessage) => {
            console.error('Error fetching merchant profiles:', errorMessage);
            // Don't show toast error as merchant profiles might be optional
          },
        });
      } catch (error) {
        console.error('Error fetching options:', error);
        toast.error('Failed to load options');
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [userId, userProfileId]);

  // Update schema and form fields based on payment method, tab, and crypto flow
  useEffect(() => {
    if (selectedTab === 'normal') {
      let updatedFields = formFields;
      let selectedSchema: any = userCardConnectorRateSchema;

      // For CRYPTO payment method with CRYPTO_PAYIN flow
      if (selectedPaymentMethod === 'CRYPTO' && cryptoFlow === 1) {
        updatedFields = formFields.filter(
          (field: FormField) =>
            !['master_mdr', 'rolling_reserve', 'chargeback_fee', 'refund_fee', 'flagged_fee', 'visa_mdr'].includes(field.name)
        );
        selectedSchema = userCryptoPayinConnectorRateSchema;
      }

      setFormData(updatedFields);
      setSchema(selectedSchema);
      reset(DEFAULT_FORM_DATA);
    } else {
      let selectedSchema: any = userTieredConnectorRateSchema;
      let updatedFields = tieredFormFields;

      // For CRYPTO payment method with CRYPTO_PAYIN flow in tiered mode
      if (selectedPaymentMethod === 'CRYPTO' && cryptoFlow === 1) {
        updatedFields = tieredFormFields.filter(
          (field: FormField) =>
            !['refund_fee', 'chargeback_fee', 'suspicious_fee', 'rolling_reserve'].includes(field.name)
        );
        selectedSchema = userTieredPayinConnectorRateSchema;
      }

      setFormData(updatedFields);
      setSchema(selectedSchema);
      reset(DEFAULT_FORM_DATA);
    }
  }, [selectedTab, selectedPaymentMethod, cryptoFlow, reset]);

  // Fetch connectors when provider or payment method changes
  useEffect(() => {
    const getProviderConnectors = async () => {
      if (!selectedProvider || !selectedPaymentMethod) {
        setFilteredConnectorOptions(null);
        return;
      }

      try {
        const connectors = await fetchAdminProviderConnectorsOptions(
          '', // Token not needed, http handles auth
          selectedProvider,
          selectedPaymentMethod
        );
        const connectorAccountOptions: Option[] = connectors.map((conn: any) => ({
          label: conn.name || conn.label,
          value: conn.id?.toString() || conn.value,
        }));

        setFilteredConnectorOptions(connectorAccountOptions);
      } catch (error) {
        console.error('Error fetching provider connectors:', error);
        setFilteredConnectorOptions(null);
      }
    };

    getProviderConnectors();
  }, [selectedPaymentMethod, selectedProvider]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const value = e.target.value;

    // Allow empty value or single decimal point
    if (value === '' || value === '.') {
      register(field).onChange(e);
      return;
    }

    // Check if value has more than 2 decimal places
    const parts = value.split('.');
    if (parts.length > 1 && parts[1].length > 2) {
      setError(field as any, {
        type: 'manual',
        message: 'Maximum 2 decimal places allowed',
      });
      return;
    }

    // Only allow numbers and decimal point
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setError(field as any, { type: 'manual', message: '' }); // Clear error
      register(field).onChange(e);
    }
  };

  const onFormSubmit = async (data: UserConnectorRateSchemaType) => {
    if (!selectedPaymentMethod) {
      setAdditionalError('Payment method is required');
      return;
    }
    if (selectedPaymentMethod === 'CRYPTO' && cryptoFlow === undefined) {
      setAdditionalError('Crypto flow is required when payment method is CRYPTO');
      return;
    }
    if (!selectedCurrency) {
      setAdditionalError('Currency is required');
      return;
    }
    if (!selectedProvider) {
      setAdditionalError('Acquirer is required');
      return;
    }
    if (!selectedConnector) {
      setAdditionalError('Connector is required');
      return;
    }
    if (!description) {
      setAdditionalError('Connector description is required');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        userId,
        userProfileId,
        acquirerId: Number(selectedProvider),
        acquirerAccountId: Number(selectedConnector),
        currencyCode: selectedCurrency,
        description: description,
        rates: data,
        ratesType: selectedTab === 'normal' ? CONNECTOR_RATES_TYPE.NORMAL : CONNECTOR_RATES_TYPE.TIERED,
        ...(selectedPaymentMethod === 'CRYPTO' && cryptoFlow !== undefined && { cryptoFlow }),
        ...(selectedMerchantProfile && { merchantProfileId: Number(selectedMerchantProfile) }),
        ...(selectedIndustryId && { industryId: Number(selectedIndustryId) }),
      };

      await onSubmit(payload);
    } catch (error) {
      console.error('Error creating merchant acquirer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <ContentLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form id="connector-form" onSubmit={handleSubmit(onFormSubmit)}>
        <div className="my-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <Label className="text-foreground text-sm font-semibold">
              Payment Method<span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => {
                setSelectedPaymentMethod(value);
                setAdditionalError('');
                if (value !== 'CRYPTO') {
                  setCryptoFlow(undefined);
                }
              }}
              value={selectedPaymentMethod}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CONNECTOR_TYPES).map((key: string) => (
                  <SelectItem
                    key={`${key}-${CONNECTOR_TYPES[key as keyof typeof CONNECTOR_TYPES]}`}
                    value={key}
                  >
                    {CONNECTOR_TYPES[key as keyof typeof CONNECTOR_TYPES]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Crypto Flow - only show for CRYPTO payment method */}
          {selectedPaymentMethod === 'CRYPTO' && (
            <div className="flex flex-col gap-1">
              <Label className="text-foreground text-sm font-semibold">
                Crypto flow <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(value) => {
                  setCryptoFlow(Number(value));
                  setAdditionalError('');
                }}
                value={cryptoFlow?.toString() || ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select crypto flow" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(CRYPTO_FLOW).map((key: string) => (
                    <SelectItem
                      key={`${key}-${CRYPTO_FLOW[Number(key) as keyof typeof CRYPTO_FLOW]}`}
                      value={key}
                    >
                      {CRYPTO_FLOW[Number(key) as keyof typeof CRYPTO_FLOW]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <Label className="text-foreground text-sm font-semibold">
              Currency<span className="text-red-500">*</span>
            </Label>
            <SearchSelect
              options={currencyOptions || []}
              value={selectedCurrency}
              onChange={(newValue) => {
                setSelectedCurrency(newValue);
                setAdditionalError('');
              }}
              valueToShow="label"
              valueToSet="value"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-foreground text-sm font-semibold">
              Merchant Profile
            </Label>
            {merchantProfileOptions.length > 0 ? (
              <SearchSelect
                options={merchantProfileOptions}
                value={selectedMerchantProfile}
                onChange={(newValue) => {
                  setSelectedMerchantProfile(newValue);
                  const matchedProfile = merchantProfiles.find(
                    (profile) => profile.id.toString() === newValue
                  );
                  setSelectedIndustryId(matchedProfile?.industryId?.toString() || '');
                  setAdditionalError('');
                }}
                valueToShow="label"
                valueToSet="value"
              />
            ) : (
              <div className="text-sm text-muted-foreground py-2 px-3 border rounded-md bg-muted/50">
                {loading ? 'Loading merchant profiles...' : `No profiles available (count: ${merchantProfileOptions.length})`}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-foreground text-sm font-semibold">
              Assign Acquirer<span className="text-red-500">*</span>
            </Label>
            <SearchSelect
              options={providerOptions || []}
              value={selectedProvider}
              onChange={(newValue) => {
                setSelectedProvider(newValue);
                setAdditionalError('');
                setSelectedConnector(''); // Reset connector when provider changes
              }}
              valueToShow="label"
              valueToSet="value"
            />
          </div>

          {filteredConnectorOptions && selectedProvider && (
            <div className="flex flex-col gap-1">
              <Label className="text-foreground text-sm font-semibold">
                Connector<span className="text-red-500">*</span>
              </Label>
              <SearchSelect
                options={filteredConnectorOptions || []}
                value={selectedConnector}
                onChange={(newValue) => {
                  setSelectedConnector(newValue);
                  setAdditionalError('');
                }}
                valueToShow="label"
                valueToSet="value"
              />
            </div>
          )}
        </div>

        <div className="my-2 flex flex-col gap-1">
          <Label className="text-foreground font-semibold text-sm">
            Connector Description
          </Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter connector description"
          />
        </div>

        {additionalError && (
          <p className="text-red-500 text-xs my-2">{additionalError}</p>
        )}

        <div className="my-2">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="normal">Normal</TabsTrigger>
              <TabsTrigger value="tiered">Fee Tiered</TabsTrigger>
            </TabsList>
            <TabsContent value="normal">
              <div className="grid grid-cols-2 gap-4 mt-4">
                {formData.map((item: FormField, index: number) => (
                  <div key={index} className="col-span-2 md:col-span-1">
                    <Label
                      htmlFor={item.name}
                      className="text-sm font-semibold my-auto"
                    >
                      {item.label}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        type="text"
                        className="block w-full rounded-md shadow"
                        {...register(item.name as any)}
                        placeholder={item.placeholder}
                        onChange={(e) => handleInputChange(e, item.name)}
                      />
                      {(item.label.includes('MDR') || item.label === 'Rolling Reserve') && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          %
                        </span>
                      )}
                    </div>
                    {errors[item.name as any] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[item.name]?.message as string}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="tiered">
              <div className="grid grid-cols-2 gap-4 mt-4">
                {formData.map((item: FormField, index: number) => (
                  <div key={index} className="col-span-2 md:col-span-1">
                    <Label
                      htmlFor={item.name}
                      className="text-sm font-semibold my-auto"
                    >
                      {item.label}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        type="text"
                        className="block w-full rounded-md shadow"
                        {...register(item.name as any)}
                        placeholder={item.placeholder}
                        onChange={(e) => handleInputChange(e, item.name)}
                      />
                      {(item.label.includes('MDR') || item.label === 'Rolling Reserve') && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          %
                        </span>
                      )}
                    </div>
                    {errors[item.name as any] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[item.name]?.message as string}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 border p-4 rounded-md">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-semibold">Dynamic MDR Tiers</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ min: '', max: '', rate: '' })}
                    >
                      Add Tier
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-4 gap-4 items-start"
                    >
                      <div>
                        <Label className="text-sm font-semibold">Min.</Label>
                        <Input
                          type="text"
                          {...register(`mdr.${index}.min`)}
                          className="mt-1 block w-full rounded-md"
                        />
                        {errors.mdr &&
                          Array.isArray(errors.mdr) &&
                          errors.mdr[index]?.min && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.mdr[index]?.min?.message}
                            </p>
                          )}
                      </div>
                      <div>
                        <Label className="text-sm font-semibold">Max.</Label>
                        <Input
                          type="text"
                          {...register(`mdr.${index}.max`)}
                          className="mt-1 block w-full rounded-md"
                        />
                        {errors.mdr &&
                          Array.isArray(errors.mdr) &&
                          errors.mdr[index]?.max && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.mdr[index]?.max?.message}
                            </p>
                          )}
                      </div>
                      <div>
                        <Label className="text-sm font-semibold">Rate %</Label>
                        <Input
                          type="text"
                          {...register(`mdr.${index}.rate`)}
                          className="mt-1 block w-full rounded-md"
                        />
                        {errors.mdr &&
                          Array.isArray(errors.mdr) &&
                          errors.mdr[index]?.rate && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.mdr[index]?.rate?.message}
                            </p>
                          )}
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Submit button at the bottom */}
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Connector'}
          </Button>
        </div>
      </form>
    </div>
  );
}
