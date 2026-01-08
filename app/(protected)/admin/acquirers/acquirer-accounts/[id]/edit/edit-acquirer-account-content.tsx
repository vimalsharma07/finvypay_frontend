'use client';

import { Fragment, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save } from 'lucide-react';
import { Container } from '@/components/common/container';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  getAcquirerAccountById,
  updateAcquirerAccount,
  UpdateAcquirerAccountPayload,
  AcquirerAccount,
} from '@/lib/services/admin/acquirer-accounts';
import { getAcquirers, Acquirer } from '@/lib/services/admin/acquirers';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import {
  BasicInformationSection,
  LimitsSection,
  CountriesCardTypesSection,
  ConfigSection,
} from './components/form-sections';

// Form schema
const updateAcquirerAccountSchema = z.object({
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
  status: z.string().min(1, 'Status is required'),
  descriptor: z.string().optional(),
});

type UpdateAcquirerAccountFormData = z.infer<typeof updateAcquirerAccountSchema>;

export function EditAcquirerAccountContent() {
  const router = useRouter();
  const params = useParams();
  const channelId = params?.id as string;

  const [acquirerAccount, setAcquirerAccount] = useState<AcquirerAccount | null>(null);
  const [acquirers, setAcquirers] = useState<Acquirer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<UpdateAcquirerAccountFormData>({
    resolver: zodResolver(updateAcquirerAccountSchema),
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
      config: [],
      status: 'active',
      descriptor: '',
    },
  });

  const { fields: configFields, append: appendConfig, remove: removeConfig, replace: replaceConfig } = useFieldArray({
    control: form.control,
    name: 'config',
  });

  // Fetch acquirers for dropdown
  useEffect(() => {
    const fetchAcquirers = async () => {
      try {
        const response = await getAcquirers({ page: 1, limit: 100 });
        handleApiResponse(response, {
          onSuccess: (data) => {
            // New format: { success: true, data: [...] }
            if (data && data.success && data.data) {
              setAcquirers(Array.isArray(data.data) ? data.data : []);
            }
          },
        });
      } catch (error) {
        console.error('Error fetching acquirers:', error);
      }
    };
    fetchAcquirers();
  }, []);

  // Fetch acquirer account on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!channelId) {
        toast.error('Acquirer account ID is missing');
        router.push('/admin/acquirers/acquirer-accounts');
        return;
      }

      setLoading(true);
      try {
        const response = await getAcquirerAccountById(channelId);

        handleApiResponse<AcquirerAccount>(response, {
          onSuccess: (channelData) => {
            if (channelData) {
              setAcquirerAccount(channelData);

              // Convert config object to array format
              const configArray = Object.entries(channelData.config || {}).map(
                ([fieldName, fieldValue]) => ({
                  fieldName,
                  fieldValue: String(fieldValue || ''),
                })
              );

              // If no config, show one empty field
              const formConfig = configArray.length > 0 
                ? configArray 
                : [{ fieldName: '', fieldValue: '' }];

              // Populate form with acquirer account data
              const formData = {
                acquirerId: String(channelData.acquirerId || ''),
                name: channelData.name || '',
                currency: channelData.currency || 'USD',
                providerType: channelData.providerType || 'CARD',
                flowType: channelData.flowType || 'PAYIN',
                timezone: channelData.timezone || 'UTC',
                minTransactionAmount: channelData.minTransactionAmount || '',
                maxTransactionAmount: channelData.maxTransactionAmount || '',
                perDaySuccessAmount: channelData.perDaySuccessAmount || '',
                perDayCardLimit: channelData.perDayCardLimit || 0,
                perDayEmailLimit: channelData.perDayEmailLimit || 0,
                perWeekCardLimit: channelData.perWeekCardLimit || 0,
                perWeekEmailLimit: channelData.perWeekEmailLimit || 0,
                perMonthCardLimit: channelData.perMonthCardLimit || 0,
                perMonthEmailLimit: channelData.perMonthEmailLimit || 0,
                dailyCardDeclineLimit: channelData.dailyCardDeclineLimit || 0,
                dailyEmailDeclineLimit: channelData.dailyEmailDeclineLimit || 0,
                allowedCountries: channelData.allowedCountries || [],
                blockedCountries: channelData.blockedCountries || [],
                acceptedCardTypes: channelData.acceptedCardTypes || [],
                config: formConfig,
                status: channelData.status || 'active',
                descriptor: '',
              };

              form.reset(formData);
              replaceConfig(formConfig);
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load acquirer account');
            router.push('/admin/acquirers/acquirer-accounts');
          },
        });
      } catch (error) {
        console.error('Error fetching acquirer account:', error);
        toast.error('An error occurred while loading acquirer account');
        router.push('/admin/acquirers/acquirer-accounts');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, router]);

  const onSubmit = async (data: UpdateAcquirerAccountFormData) => {
    if (!channelId) {
      toast.error('Acquirer account ID is missing');
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

      // Convert string amounts to numbers with proper validation
      const parseAmount = (value: string): number => {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      };

      const payload: UpdateAcquirerAccountPayload = {
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
        status: data.status,
      };

      const response = await updateAcquirerAccount(channelId, payload);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Acquirer account updated successfully!');
          router.push('/admin/acquirers/acquirer-accounts');
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update acquirer account');
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
      console.error('❌ Error updating acquirer account:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Loading acquirer account data...</p>
        </div>
      </div>
    );
  }

  if (!acquirerAccount) {
    return (
      <Fragment>
        <Container>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Acquirer account not found</p>
              <Button
                variant="outline"
                onClick={() => router.push('/admin/acquirers/acquirer-accounts')}
                className="mt-4"
              >
                Back to Acquirer Accounts
              </Button>
            </div>
          </div>
        </Container>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Container>
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <BasicInformationSection
                control={form.control}
                acquirers={acquirers}
                submitting={submitting}
              />

              <LimitsSection control={form.control} submitting={submitting} />

              <CountriesCardTypesSection control={form.control} submitting={submitting} />

              <ConfigSection
                control={form.control}
                configFields={configFields}
                appendConfig={() => appendConfig({ fieldName: '', fieldValue: '' })}
                removeConfig={removeConfig}
                submitting={submitting}
              />

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/acquirers/acquirer-accounts')}
                  disabled={submitting}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  <Save className="h-4 w-4" />
                  {submitting ? 'Updating...' : 'Update Connector'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Container>
    </Fragment>
  );
}

