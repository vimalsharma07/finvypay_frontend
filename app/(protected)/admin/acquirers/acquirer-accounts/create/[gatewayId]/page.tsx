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
  createAcquirerAccount,
  CreateAcquirerAccountPayload,
} from '@/lib/services/admin/acquirer-accounts';
import {
  getAcquirers,
  getAcquirerById,
  Acquirer,
  AcquirerListResponse,
} from '@/lib/services/admin/acquirers';
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
const createAcquirerAccountSchema = z.object({
  acquirerId: z.string().min(1, 'Acquirer is required'),
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

type CreateAcquirerAccountFormData = z.infer<typeof createAcquirerAccountSchema>;

// Helper to parse amounts safely
const parseAmount = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value || '0');
  return isNaN(parsed) ? 0 : parsed;
};

export default function CreateAcquirerAccountPage() {
  const router = useRouter();
  const params = useParams();
  // Route parameter is named 'gatewayId' but represents acquirerId
  const acquirerId = (params?.gatewayId || params?.acquirerId) as string;

  const [acquirers, setAcquirers] = useState<Acquirer[]>([]);
  const [countries, setCountries] = useState<Array<{ code: string; name: string }>>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CreateAcquirerAccountFormData>({
    resolver: zodResolver(createAcquirerAccountSchema),
    defaultValues: {
      acquirerId: '',
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

  // Fetch all dropdown data (acquirer, acquirers list, countries, currencies)
  useEffect(() => {
    const fetchAllData = async () => {
      if (!acquirerId) {
        toast.error('Acquirer ID is missing');
        router.push('/admin/acquirers');
        return;
      }

      setLoading(true);
      try {
        const [acquirerResponse, acquirersResponse, countriesResponse, currenciesResponse] = await Promise.all([
          getAcquirerById(acquirerId),
          getAcquirers({ page: 1, limit: 100 }),
          getCountries({ page: 1, limit: 500 }),
          getCurrencies({ page: 1, limit: 500 }),
        ]);

        // Handle Selected Acquirer Data
        handleApiResponse<Acquirer>(acquirerResponse, {
          onSuccess: (acquirerData) => {
            if (acquirerData) {
              form.setValue('acquirerId', acquirerId);

              // Pre-fill config fields from acquirer's fields
              if (acquirerData.fields && Object.keys(acquirerData.fields).length > 0) {
                const configArray = Object.entries(acquirerData.fields).map(
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
            console.error('Error fetching acquirer:', errorMessage);
            toast.error('Failed to load acquirer data');
            router.push('/admin/acquirers');
          },
        });

        // Handle Acquirers List Data
        handleApiResponse<AcquirerListResponse>(acquirersResponse, {
          onSuccess: (data) => {
            if (data && data.success && data.data) {
              setAcquirers(data.data.data);
            }
          },
          onError: (errorMessage) => {
            console.error('Error fetching acquirers:', errorMessage);
            toast.error('Failed to load acquirers for dropdown');
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
  }, [acquirerId, router]);

  const onSubmit = async (data: CreateAcquirerAccountFormData) => {
    if (!acquirerId) {
      toast.error('Acquirer ID is missing');
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

      const payload: CreateAcquirerAccountPayload = {
        acquirerId: Number(data.acquirerId),
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

      const response = await createAcquirerAccount(payload);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Acquirer account created successfully!');
          router.push('/admin/acquirers/acquirer-accounts');
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to create acquirer account');
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
      console.error('Error creating acquirer account:', error);
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
              title="Create Acquirer Account"
              description="Create a new acquirer account for the acquirer"
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
            title="Create Acquirer Account"
            description="Create a new acquirer account for the acquirer"
          />
          <div className="flex items-center">
            <Link
              href="/admin/acquirers"
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
                acquirers={acquirers}
                currencies={currencies}
                submitting={submitting}
                disableAcquirer={true}
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
                  onClick={() => router.push('/admin/acquirers')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Acquirer Account'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Container>
    </Fragment>
  );
}

