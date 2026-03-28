'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SearchSelect } from '@/components/ui/molecules/SearchSelect';
import { Percent } from 'lucide-react';
import { Container } from '@/components/common/container';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/layouts/main/components/toolbar';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { getMerchantRates, upsertMerchantRates, type MerchantRates } from '@/lib/services/admin/merchant-rates';
import { getAllMerchantsPaginated, type Merchant } from '@/lib/services/admin/users';
import { toast } from 'sonner';

const ratesSchema = z.object({
  defaultMdr: z.number({ invalid_type_error: 'Default MDR is required' }).min(0),
  visaMdr: z.number({ invalid_type_error: 'Visa MDR is required' }).min(0),
  masterMdr: z.number({ invalid_type_error: 'Master MDR is required' }).min(0),
  rollingReserve: z.number({ invalid_type_error: 'Rolling reserve is required' }).min(0),
  successTransactionFee: z.number({ invalid_type_error: 'Success transaction fee is required' }).min(0),
  declinedTransactionFee: z.number({ invalid_type_error: 'Declined transaction fee is required' }).min(0),
  chargebackFee: z.number({ invalid_type_error: 'Chargeback fee is required' }).min(0),
  flaggedFee: z.number({ invalid_type_error: 'Flagged fee is required' }).min(0),
  setupFee: z.number({ invalid_type_error: 'Setup fee is required' }).min(0),
  refundFee: z.number({ invalid_type_error: 'Refund fee is required' }).min(0),
  minTxnAmount: z.number({ invalid_type_error: 'Min transaction amount is required' }).min(0),
  maxTxnAmount: z.number({ invalid_type_error: 'Max transaction amount is required' }).min(0),
  referralPartnerId: z.union([z.number(), z.string()]).nullable().optional(),
  referralPartnerCommission: z.number().min(0).nullable().optional(),
});

type RatesFormData = z.infer<typeof ratesSchema>;

export default function AssignRatesPage() {
  const router = useRouter();
  const params = useParams();
  const merchantId = useMemo(() => Number(params?.id), [params]);

  const [loading, setLoading] = useState(true);
  const [affiliates, setAffiliates] = useState<Merchant[]>([]);

  const form = useForm<RatesFormData>({
    resolver: zodResolver(ratesSchema),
    defaultValues: {
      defaultMdr: undefined as any,
      visaMdr: undefined as any,
      masterMdr: undefined as any,
      rollingReserve: undefined as any,
      successTransactionFee: undefined as any,
      declinedTransactionFee: undefined as any,
      chargebackFee: undefined as any,
      flaggedFee: undefined as any,
      setupFee: undefined as any,
      refundFee: undefined as any,
      minTxnAmount: undefined as any,
      maxTxnAmount: undefined as any,
      referralPartnerId: null,
      referralPartnerCommission: null,
    },
    mode: 'onChange',
  });

  // Fetch affiliates (RPs) for the Affiliate dropdown
  useEffect(() => {
    const fetchAffiliates = async () => {
      try {
        const rows = await getAllMerchantsPaginated({
          role: 'affiliate',
          sortBy: 'createdAt',
          sortOrder: 'DESC',
        });
        setAffiliates(rows);
      } catch (error) {
        console.error('Failed to fetch affiliates:', error);
      }
    };
    fetchAffiliates();
  }, []);

  // Fetch existing rates
  useEffect(() => {
    const fetchRates = async () => {
      if (!merchantId || Number.isNaN(merchantId)) {
        toast.error('Invalid merchant ID');
        return;
      }
      setLoading(true);
      try {
        const response = await getMerchantRates(merchantId);
        handleApiResponse(response, {
          onSuccess: (data) => {
            if (data?.data) {
              const rates = data.data as MerchantRates;
              const rpId = rates.referralPartnerId;
              form.reset({
                defaultMdr: Number(rates.defaultMdr ?? 0),
                visaMdr: Number(rates.visaMdr ?? 0),
                masterMdr: Number(rates.masterMdr ?? 0),
                rollingReserve: Number(rates.rollingReserve ?? 0),
                successTransactionFee: Number(rates.successTransactionFee ?? 0),
                declinedTransactionFee: Number(rates.declinedTransactionFee ?? 0),
                chargebackFee: Number(rates.chargebackFee ?? 0),
                flaggedFee: Number(rates.flaggedFee ?? 0),
                setupFee: Number(rates.setupFee ?? 0),
                refundFee: Number(rates.refundFee ?? 0),
                minTxnAmount: Number(rates.minTxnAmount ?? 0),
                maxTxnAmount: Number(rates.maxTxnAmount ?? 0),
                referralPartnerId: rpId != null && rpId !== '' ? rpId : null,
                referralPartnerCommission:
                  rates.referralPartnerCommission != null ? Number(rates.referralPartnerCommission) : null,
              });
            } else {
              form.reset({
                defaultMdr: undefined as any,
                visaMdr: undefined as any,
                masterMdr: undefined as any,
                rollingReserve: undefined as any,
                successTransactionFee: undefined as any,
                declinedTransactionFee: undefined as any,
                chargebackFee: undefined as any,
                flaggedFee: undefined as any,
                setupFee: undefined as any,
                refundFee: undefined as any,
                minTxnAmount: undefined as any,
                maxTxnAmount: undefined as any,
                referralPartnerId: null,
                referralPartnerCommission: null,
              });
            }
          },
        });
      } catch (error) {
        console.error('Failed to fetch merchant rates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId]);

  const onSubmit = async (values: RatesFormData) => {
    if (!merchantId || Number.isNaN(merchantId)) {
      toast.error('Invalid merchant ID');
      return;
    }

    try {
      setLoading(true);
      const rpId = values.referralPartnerId;
      const rpIdNumber =
        rpId !== undefined && rpId !== null && rpId !== ''
          ? (typeof rpId === 'string' ? parseInt(rpId, 10) : rpId)
          : null;
      const rpCommission =
        values.referralPartnerCommission !== undefined && values.referralPartnerCommission !== null
          ? Number(values.referralPartnerCommission)
          : null;

      const payload: MerchantRates = {
        merchantId,
        defaultMdr: values.defaultMdr,
        visaMdr: values.visaMdr,
        masterMdr: values.masterMdr,
        rollingReserve: values.rollingReserve,
        successTransactionFee: values.successTransactionFee,
        declinedTransactionFee: values.declinedTransactionFee,
        chargebackFee: values.chargebackFee,
        flaggedFee: values.flaggedFee,
        setupFee: values.setupFee,
        refundFee: values.refundFee,
        minTxnAmount: values.minTxnAmount,
        maxTxnAmount: values.maxTxnAmount,
        referralPartnerId: rpIdNumber,
        referralPartnerCommission: rpCommission,
      };
      const response = await upsertMerchantRates(payload);
      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data?.success) {
            toast.success(data.message || 'Rates saved successfully');
            router.back();
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to save rates');
        },
      });
    } catch (error) {
      console.error('Failed to save merchant rates:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const numberField = (
    name: keyof RatesFormData,
    label: string,
    step = '0.01'
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              step={step}
              value={field.value ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  field.onChange(undefined);
                  return;
                }
                const parsed = Number(val);
                if (!Number.isNaN(parsed)) {
                  field.onChange(parsed);
                }
              }}
              onBlur={() => {
                // Normalize to remove leading zeros on blur
                if (field.value === undefined || field.value === null) return;
                const normalized = Number(field.value);
                if (!Number.isNaN(normalized)) {
                  field.onChange(normalized);
                }
              }}
              onFocus={() => {
                if (field.value === 0) {
                  field.onChange(undefined);
                }
              }}
              placeholder={`Enter ${label}`}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Assign Rates"
          description="Configure and assign default processing rates including MDR, transaction fees, chargeback fees, and reserve percentages for this merchant"
          icon={Percent}
        />
        <ToolbarActions>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </ToolbarActions>
      </Toolbar>

      <Card>
        <CardHeader>
          <CardTitle>Merchant Rates</CardTitle>
          <CardDescription>
            {loading ? 'Loading rates...' : 'Configure MDR and fees for this merchant'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {numberField('defaultMdr', 'Default MDR (%)')}
                {numberField('visaMdr', 'Visa MDR (%)')}
                {numberField('masterMdr', 'Master MDR (%)')}
                {numberField('rollingReserve', 'Rolling Reserve (%)')}
                {numberField('successTransactionFee', 'Success Transaction Fee (amount)', '0.01')}
                {numberField('declinedTransactionFee', 'Declined Transaction Fee (amount)', '0.01')}
                {numberField('chargebackFee', 'Chargeback Fee (amount)', '0.01')}
                {numberField('flaggedFee', 'Flagged Fee (amount)', '0.01')}
                {numberField('setupFee', 'Setup Fee (amount)', '0.01')}
                {numberField('refundFee', 'Refund Fee (amount)', '0.01')}
                {numberField('minTxnAmount', 'Min Transaction Amount', '0.01')}
                {numberField('maxTxnAmount', 'Max Transaction Amount', '0.01')}
                <FormField
                  control={form.control}
                  name="referralPartnerId"
                  render={({ field }) => {
                    const selectValue =
                      field.value !== null && field.value !== undefined && field.value !== ''
                        ? String(field.value)
                        : '__none__';
                    const affiliateOptions = [
                      { label: 'None', value: '__none__' },
                      ...affiliates.map((a) => ({
                        label: String(a.name || a.email || a.id),
                        value: String(a.id),
                      })),
                    ];
                    return (
                      <FormItem>
                        <FormLabel>Affiliate (optional)</FormLabel>
                        <FormControl>
                          <SearchSelect
                            options={affiliateOptions}
                            value={selectValue}
                            onChange={(val) =>
                              field.onChange(val === '__none__' ? null : val)
                            }
                            placeholder="Search or select Affiliate"
                            valueToShow="label"
                            valueToSet="value"
                            maxHeight="320px"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="referralPartnerCommission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Affiliate Commission (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') {
                              field.onChange(null);
                              return;
                            }
                            const parsed = Number(val);
                            if (!Number.isNaN(parsed)) field.onChange(parsed);
                          }}
                          placeholder="Enter commission"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Rates'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </Container>
  );
}


