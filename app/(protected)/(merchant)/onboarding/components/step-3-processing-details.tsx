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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronRight } from 'lucide-react';
import { MultiSelectField } from '@/app/(protected)/admin/acquirers/acquirer-accounts/[id]/edit/components/multi-select-field';
import { CountryCodeSelector } from './country-code-selector';
import {
  updateProcessingDetails,
  UpdateProcessingDetailsPayload,
  OnboardingData,
  getOnboardingStatus,
} from '@/lib/services/user/onboarding';
import { getIndustries, Industry } from '@/lib/services/admin/industries';
import { getCountries, Country } from '@/lib/services/admin/countries';
import { getCurrencies, Currency } from '@/lib/services/admin/currency';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

// Payment methods options
const PAYMENT_METHODS = [
  { value: 'Card', label: 'Card' },
  { value: 'Crypto', label: 'Crypto' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Digital Wallet', label: 'Digital Wallet' },
  { value: 'Other', label: 'Other' },
];

const processingDetailsSchema = z.object({
  acceptedPaymentMethods: z.array(z.string()).min(1, 'Please select at least one payment method'),
  industryId: z.number().min(1, 'Please select an industry'),
  processingCountryId: z.number().min(1, 'Please select a processing country'),
  processingCurrency: z.array(z.string()).min(1, 'Please select at least one currency'),
  monthlyVolume: z.number().min(0, 'Monthly volume must be 0 or greater'),
  licenseStatus: z.boolean(),
});

type ProcessingDetailsFormData = z.infer<typeof processingDetailsSchema>;

interface Step3ProcessingDetailsProps {
  onboardingData: OnboardingData;
  onNext: () => void;
  onUpdate: (data: UpdateProcessingDetailsPayload) => void;
}

export function Step3ProcessingDetails({
  onboardingData,
  onNext,
  onUpdate,
}: Step3ProcessingDetailsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const onboarding = onboardingData?.onboarding;

  // Fetch industries, countries, and currencies
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Fetch industries
        const industriesResponse = await getIndustries({
          page: 1,
          limit: 1000,
          sortBy: 'name',
          sortOrder: 'ASC',
        });

        // Fetch countries
        const countriesResponse = await getCountries({
          page: 1,
          limit: 1000,
          sortBy: 'countryName',
          sortOrder: 'ASC',
        });

        // Fetch currencies
        const currenciesResponse = await getCurrencies({
          page: 1,
          limit: 1000,
          sortBy: 'code',
          sortOrder: 'ASC',
        });

        handleApiResponse(industriesResponse, {
          onSuccess: (data) => {
            // New format: { success: true, data: [...] }
            if (data && data.success && data.data) {
              setIndustries(Array.isArray(data.data) ? data.data : []);
            }
          },
        });

        handleApiResponse(countriesResponse, {
          onSuccess: (data) => {
            // New format: { success: true, data: [...] }
            if (data && data.success && data.data) {
              setCountries(Array.isArray(data.data) ? data.data : []);
            }
          },
        });

        handleApiResponse(currenciesResponse, {
          onSuccess: (data) => {
            // New format: { success: true, data: [...] }
            if (data && data.success && data.data) {
              setCurrencies(Array.isArray(data.data) ? data.data : []);
            }
          },
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Parse existing data from onboarding
  const existingPaymentMethods = useMemo(() => {
    if (!onboarding?.acceptedPaymentMethods) return [];
    try {
      // Handle both string (JSON) and array formats
      if (typeof onboarding.acceptedPaymentMethods === 'string') {
        return JSON.parse(onboarding.acceptedPaymentMethods);
      }
      return Array.isArray(onboarding.acceptedPaymentMethods)
        ? onboarding.acceptedPaymentMethods
        : [];
    } catch {
      return [];
    }
  }, [onboarding?.acceptedPaymentMethods]);

  const existingCurrencies = useMemo(() => {
    if (!onboarding?.processingCurrency) return [];
    try {
      // Handle both string (JSON) and array formats
      if (typeof onboarding.processingCurrency === 'string') {
        return JSON.parse(onboarding.processingCurrency);
      }
      return Array.isArray(onboarding.processingCurrency)
        ? onboarding.processingCurrency
        : [];
    } catch {
      return [];
    }
  }, [onboarding?.processingCurrency]);

  // Find industry ID from onboarding data
  const existingIndustryId = useMemo(() => {
    if (!onboarding?.industry) return undefined;
    // industry might be an object with id or just an id string/number
    if (typeof onboarding.industry === 'object' && onboarding.industry !== null) {
      const industryObj = onboarding.industry as any;
      if (industryObj.id) {
        return Number(industryObj.id);
      }
    }
    if (typeof onboarding.industry === 'string' || typeof onboarding.industry === 'number') {
      return Number(onboarding.industry);
    }
    return undefined;
  }, [onboarding?.industry]);

  // Find processing country ID from onboarding data
  const existingProcessingCountryId = useMemo(() => {
    if (!onboarding?.processingCountry) return undefined;
    // processingCountry might be an object with id or just an id string/number
    if (typeof onboarding.processingCountry === 'object' && onboarding.processingCountry !== null) {
      const countryObj = onboarding.processingCountry as any;
      if (countryObj.id) {
        return Number(countryObj.id);
      }
    }
    if (
      typeof onboarding.processingCountry === 'string' ||
      typeof onboarding.processingCountry === 'number'
    ) {
      return Number(onboarding.processingCountry);
    }
    return undefined;
  }, [onboarding?.processingCountry]);

  const form = useForm<ProcessingDetailsFormData>({
    resolver: zodResolver(processingDetailsSchema),
    defaultValues: {
      acceptedPaymentMethods: existingPaymentMethods || [],
      industryId: existingIndustryId || (undefined as any),
      processingCountryId: existingProcessingCountryId || (undefined as any),
      processingCurrency: existingCurrencies || [],
      monthlyVolume: onboarding?.monthlyVolume ? Number(onboarding.monthlyVolume) : 0,
      licenseStatus: onboarding?.licenseStatus ?? false,
    },
    mode: 'onChange',
  });

  // Currency options for multi-select
  const currencyOptions = useMemo(() => {
    return currencies.map((currency) => ({
      value: currency.code,
      label: currency.code,
    }));
  }, [currencies]);

  const handleSubmit = async (data: ProcessingDetailsFormData) => {
    setIsSubmitting(true);
    try {
      const payload: UpdateProcessingDetailsPayload = {
        acceptedPaymentMethods: data.acceptedPaymentMethods,
        industryId: data.industryId,
        processingCountryId: data.processingCountryId,
        processingCurrency: data.processingCurrency,
        monthlyVolume: data.monthlyVolume,
        licenseStatus: data.licenseStatus,
      };

      const response = await updateProcessingDetails(payload);
      handleApiResponse(response, {
        onSuccess: (responseData) => {
          if (responseData && responseData.success) {
            toast.success('Processing details updated successfully');
            onUpdate(payload);
            onNext();
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update processing details');
        },
        onValidationError: (errors, messages) => {
          const errorMsg = Array.isArray(messages) ? messages.join(', ') : messages;
          toast.error(errorMsg || 'Validation error');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Update processing details error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Info</CardTitle>
        <CardDescription>
          Provide your business processing details and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Accepted Payment Methods */}
            <MultiSelectField
              control={form.control}
              name="acceptedPaymentMethods"
              label="Accepted Payment Methods *"
              options={PAYMENT_METHODS}
              placeholder="Select payment methods"
              disabled={loadingData}
            />

            {/* Industry */}
            <FormField
              control={form.control}
              name="industryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry *</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(val) => field.onChange(Number(val))}
                    disabled={loadingData}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry.id} value={industry.id}>
                          {industry.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Processing Country */}
            <FormField
              control={form.control}
              name="processingCountryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Processing Country *</FormLabel>
                  <FormControl>
                    <CountryCodeSelector
                      value={field.value}
                      onChange={field.onChange}
                      disabled={loadingData}
                      showPhoneCode={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Processing Currency */}
            <MultiSelectField
              control={form.control}
              name="processingCurrency"
              label="Processing Currency *"
              options={currencyOptions}
              placeholder="Select currencies"
              disabled={loadingData}
            />

            {/* Monthly Volume */}
            <FormField
              control={form.control}
              name="monthlyVolume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Volume (USD) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      placeholder="Enter monthly volume"
                      min="0"
                      step="0.01"
                    />
                  </FormControl>
                  <FormDescription>
                    Expected monthly transaction volume in USD
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* License Status */}
            <FormField
              control={form.control}
              name="licenseStatus"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>License Status</FormLabel>
                    <FormDescription>
                      Check if you have a valid business license
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" variant="primary" disabled={isSubmitting || loadingData} className="gap-2">
                {isSubmitting ? 'Saving...' : 'Continue'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

