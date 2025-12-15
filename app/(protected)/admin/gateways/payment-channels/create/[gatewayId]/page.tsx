'use client';

import { Fragment, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  createPaymentChannel,
  CreatePaymentChannelPayload,
} from '@/lib/services/admin/payment-channels';
import {
  getGateways,
  getGatewayById,
  Gateway,
  GatewayListResponse,
} from '@/lib/services/admin/gateways';
import { getCountries, Country, CountryListResponse } from '@/lib/services/admin/countries';
import { getCurrencies, Currency, CurrencyListResponse } from '@/lib/services/admin/currency';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import {
  BasicInformationSection,
  LimitsSection,
  CountriesCardTypesSection,
  ConfigSection,
} from '../../[id]/edit/components/form-sections';

// Form schema
const createPaymentChannelSchema = z.object({
  gatewayId: z.string().min(1, 'Gateway is required'),
  name: z.string().min(1, 'Name is required'),
  currency: z.string().min(1, 'Currency is required'),
  providerType: z.string().min(1, 'Provider type is required'),
  flowType: z.string().min(1, 'Flow type is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  minTransactionAmount: z.string().min(1, 'Minimum transaction amount is required'),
  maxTransactionAmount: z.string().min(1, 'Maximum transaction amount is required'),
  perDaySuccessAmount: z.string().min(1, 'Per day success amount is required'),
  perDayCardLimit: z.number().min(0, 'Per day card limit must be 0 or greater'),
  perDayEmailLimit: z.number().min(0, 'Per day email limit must be 0 or greater'),
  perWeekCardLimit: z.number().min(0, 'Per week card limit must be 0 or greater'),
  perWeekEmailLimit: z.number().min(0, 'Per week email limit must be 0 or greater'),
  perMonthCardLimit: z.number().min(0, 'Per month card limit must be 0 or greater'),
  perMonthEmailLimit: z.number().min(0, 'Per month email limit must be 0 or greater'),
  dailyCardDeclineLimit: z.number().min(0, 'Daily card decline limit must be 0 or greater'),
  dailyEmailDeclineLimit: z.number().min(0, 'Daily email decline limit must be 0 or greater'),
  allowedCountries: z.array(z.string()),
  blockedCountries: z.array(z.string()),
  acceptedCardTypes: z.array(z.string()),
  config: z.array(
    z.object({
      fieldName: z.string().optional(),
      fieldValue: z.string().optional(),
    })
  ),
});

type CreatePaymentChannelFormData = z.infer<typeof createPaymentChannelSchema>;

// Helper to parse amounts safely
const parseAmount = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value || '0');
  return isNaN(parsed) ? 0 : parsed;
};

export default function CreatePaymentChannelPage() {
  const router = useRouter();
  const params = useParams();
  const gatewayId = params?.gatewayId as string;

  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [countries, setCountries] = useState<Array<{ code: string; name: string }>>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CreatePaymentChannelFormData>({
    resolver: zodResolver(createPaymentChannelSchema),
    defaultValues: {
      gatewayId: '',
      name: '',
      currency: 'USD',
      providerType: 'CARD',
      flowType: 'PAYIN',
      timezone: 'UTC',
      minTransactionAmount: '',
      maxTransactionAmount: '',
      perDaySuccessAmount: '',
      perDayCardLimit: 0,
      perDayEmailLimit: 0,
      perWeekCardLimit: 0,
      perWeekEmailLimit: 0,
      perMonthCardLimit: 0,
      perMonthEmailLimit: 0,
      dailyCardDeclineLimit: 0,
      dailyEmailDeclineLimit: 0,
      allowedCountries: [],
      blockedCountries: [],
      acceptedCardTypes: [],
      config: [{ fieldName: '', fieldValue: '' }],
    },
  });

  const { fields: configFields, append: appendConfig, remove: removeConfig, replace: replaceConfig } = useFieldArray({
    control: form.control,
    name: 'config',
  });

  // Fetch all dropdown data (gateway, gateways list, countries, currencies)
  useEffect(() => {
    const fetchAllData = async () => {
      if (!gatewayId) {
        toast.error('Gateway ID is missing');
        router.push('/admin/gateways/gateways');
        return;
      }

      setLoading(true);
      try {
        const [gatewayResponse, gatewaysResponse, countriesResponse, currenciesResponse] = await Promise.all([
          getGatewayById(gatewayId),
          getGateways({ page: 1, limit: 100 }),
          getCountries({ page: 1, limit: 500 }),
          getCurrencies({ page: 1, limit: 500 }),
        ]);

        // Handle Selected Gateway Data
        handleApiResponse<Gateway>(gatewayResponse, {
          onSuccess: (gatewayData) => {
            if (gatewayData) {
              form.setValue('gatewayId', gatewayId);

              // Pre-fill config fields from gateway's fields
              if (gatewayData.fields && Object.keys(gatewayData.fields).length > 0) {
                const configArray = Object.entries(gatewayData.fields).map(
                  ([fieldName, fieldValue]) => ({
                    fieldName,
                    fieldValue: String(fieldValue || ''),
                  })
                );
                replaceConfig(configArray);
              } else {
                replaceConfig([{ fieldName: '', fieldValue: '' }]);
              }
            }
          },
          onError: (errorMessage) => {
            console.error('Error fetching gateway:', errorMessage);
            toast.error('Failed to load gateway data');
            router.push('/admin/gateways/gateways');
          },
        });

        // Handle Gateways List Data
        handleApiResponse<GatewayListResponse>(gatewaysResponse, {
          onSuccess: (data) => {
            if (data && data.success && data.data) {
              setGateways(data.data.data);
            }
          },
          onError: (errorMessage) => {
            console.error('Error fetching gateways:', errorMessage);
            toast.error('Failed to load gateways for dropdown');
          },
        });

        // Handle Countries Data
        handleApiResponse<CountryListResponse>(countriesResponse, {
          onSuccess: (data) => {
            if (data && data.success && data.data && Array.isArray(data.data.data)) {
              const countryList: Country[] = data.data.data;
              const transformedCountries = countryList
                .filter((country) => country.status === 'active' && !country.isDeleted)
                .map((country) => ({
                  code: country.isoTwo,
                  name: country.countryName,
                }))
                .sort((a, b) => a.name.localeCompare(b.name));
              setCountries(transformedCountries);
            }
          },
          onError: (errorMessage) => {
            console.error('Error fetching countries:', errorMessage);
            toast.error('Failed to load countries for dropdown');
          },
        });

        // Handle Currencies Data
        handleApiResponse<CurrencyListResponse>(currenciesResponse, {
          onSuccess: (data) => {
            if (data && data.success && data.data && Array.isArray(data.data.data)) {
              const currencyList: Currency[] = data.data.data;
              const currencyCodes = currencyList
                .filter((currency) => !currency.isDeleted)
                .map((currency) => currency.code)
                .sort();
              setCurrencies(currencyCodes);
            }
          },
          onError: (errorMessage) => {
            console.error('Error fetching currencies:', errorMessage);
            toast.error('Failed to load currencies for dropdown');
          },
        });
      } catch (error) {
        console.error('Error fetching all data:', error);
        toast.error('An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gatewayId, router]);

  const onSubmit = async (data: CreatePaymentChannelFormData) => {
    if (!gatewayId) {
      toast.error('Gateway ID is missing');
      return;
    }

    setSubmitting(true);
    try {
      // Convert config array to object format (only include non-empty fields)
      const configObject: Record<string, string> = {};
      data.config?.forEach((field) => {
        if (field.fieldName?.trim() && field.fieldValue?.trim()) {
          configObject[field.fieldName.trim()] = field.fieldValue.trim();
        }
      });

      const payload: CreatePaymentChannelPayload = {
        gatewayId: Number(data.gatewayId),
        name: data.name.trim(),
        currency: data.currency,
        providerType: data.providerType,
        flowType: data.flowType,
        timezone: data.timezone,
        minTransactionAmount: parseAmount(data.minTransactionAmount),
        maxTransactionAmount: parseAmount(data.maxTransactionAmount),
        perDaySuccessAmount: parseAmount(data.perDaySuccessAmount),
        perDayCardLimit: data.perDayCardLimit,
        perDayEmailLimit: data.perDayEmailLimit,
        perWeekCardLimit: data.perWeekCardLimit,
        perWeekEmailLimit: data.perWeekEmailLimit,
        perMonthCardLimit: data.perMonthCardLimit,
        perMonthEmailLimit: data.perMonthEmailLimit,
        dailyCardDeclineLimit: data.dailyCardDeclineLimit,
        dailyEmailDeclineLimit: data.dailyEmailDeclineLimit,
        allowedCountries: data.allowedCountries,
        blockedCountries: data.blockedCountries,
        acceptedCardTypes: data.acceptedCardTypes,
        config: configObject,
      };

      const response = await createPaymentChannel(payload);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Payment channel created successfully!');
          router.push('/admin/gateways/payment-channels');
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to create payment channel');
        },
        onValidationError: (errors, messages) => {
          console.error('Validation errors:', errors);
          toast.error(Array.isArray(messages) ? messages.join(', ') : messages);
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      console.error('Error creating payment channel:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Create Payment Channel"
              description="Create a new payment channel for the gateway"
            />
          </Toolbar>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Loading form data...</p>
            </div>
          </div>
        </Container>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Create Payment Channel"
            description="Create a new payment channel for the gateway"
          />
          <div className="flex items-center">
            <Link
              href="/admin/gateways/gateways"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </div>
        </Toolbar>
      </Container>

      <Container>
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <BasicInformationSection
                control={form.control}
                gateways={gateways}
                currencies={currencies}
                submitting={submitting}
                disableGateway={true}
                showStatus={false}
              />

              <LimitsSection control={form.control} submitting={submitting} />

              <CountriesCardTypesSection
                control={form.control}
                countries={countries}
                submitting={submitting}
              />

              <ConfigSection
                control={form.control}
                configFields={configFields}
                appendConfig={() => appendConfig({ fieldName: '', fieldValue: '' })}
                removeConfig={removeConfig}
                submitting={submitting}
                disableFieldName={true}
              />

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/gateways/gateways')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Payment Channel'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Container>
    </Fragment>
  );
}

