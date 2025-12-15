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
  getPaymentChannelById,
  updatePaymentChannel,
  UpdatePaymentChannelPayload,
  PaymentChannel,
} from '@/lib/services/admin/payment-channels';
import { getGateways, Gateway } from '@/lib/services/admin/gateways';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import {
  BasicInformationSection,
  LimitsSection,
  CountriesCardTypesSection,
  ConfigSection,
} from './components/form-sections';

// Form schema
const updatePaymentChannelSchema = z.object({
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
  status: z.string().min(1, 'Status is required'),
  descriptor: z.string().optional(),
});

type UpdatePaymentChannelFormData = z.infer<typeof updatePaymentChannelSchema>;

export default function EditPaymentChannelPage() {
  const router = useRouter();
  const params = useParams();
  const channelId = params?.id as string;

  const [paymentChannel, setPaymentChannel] = useState<PaymentChannel | null>(null);
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<UpdatePaymentChannelFormData>({
    resolver: zodResolver(updatePaymentChannelSchema),
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
      config: [],
      status: 'active',
      descriptor: '',
    },
  });

  const { fields: configFields, append: appendConfig, remove: removeConfig, replace: replaceConfig } = useFieldArray({
    control: form.control,
    name: 'config',
  });

  // Fetch gateways for dropdown
  useEffect(() => {
    const fetchGateways = async () => {
      try {
        const response = await getGateways({ page: 1, limit: 100 });
        handleApiResponse(response, {
          onSuccess: (data) => {
            if (data && data.success && data.data) {
              setGateways(data.data.data);
            }
          },
        });
      } catch (error) {
        console.error('Error fetching gateways:', error);
      }
    };
    fetchGateways();
  }, []);

  // Fetch payment channel on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!channelId) {
        toast.error('Payment channel ID is missing');
        router.push('/admin/gateways/payment-channels');
        return;
      }

      setLoading(true);
      try {
        const response = await getPaymentChannelById(channelId);

        handleApiResponse<PaymentChannel>(response, {
          onSuccess: (channelData) => {
            if (channelData) {
              setPaymentChannel(channelData);

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

              // Populate form with payment channel data
              const formData = {
                gatewayId: String(channelData.gatewayId || ''),
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
            toast.error(errorMessage || 'Failed to load payment channel');
            router.push('/admin/gateways/payment-channels');
          },
        });
      } catch (error) {
        console.error('Error fetching payment channel:', error);
        toast.error('An error occurred while loading payment channel');
        router.push('/admin/gateways/payment-channels');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, router]);

  const onSubmit = async (data: UpdatePaymentChannelFormData) => {
    if (!channelId) {
      toast.error('Payment channel ID is missing');
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

      const payload: UpdatePaymentChannelPayload = {
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
        status: data.status,
      };

      const response = await updatePaymentChannel(channelId, payload);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Payment channel updated successfully!');
          router.push('/admin/gateways/payment-channels');
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update payment channel');
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
      console.error('❌ Error updating payment channel:', error);
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
              title="Update Connector"
              description="Update payment channel details"
            />
          </Toolbar>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Loading payment channel data...</p>
            </div>
          </div>
        </Container>
      </Fragment>
    );
  }

  if (!paymentChannel) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Update Connector"
              description="Update payment channel details"
            />
          </Toolbar>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Payment channel not found</p>
              <Button
                variant="outline"
                onClick={() => router.push('/admin/gateways/payment-channels')}
                className="mt-4"
              >
                Back to Payment Channels
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
        <Toolbar>
          <ToolbarHeading
            title="Update Connector"
            description="Update payment channel details"
          />
          <div className="flex items-center">
            <Link
              href="/admin/gateways/payment-channels"
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
                  onClick={() => router.push('/admin/gateways/payment-channels')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
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

