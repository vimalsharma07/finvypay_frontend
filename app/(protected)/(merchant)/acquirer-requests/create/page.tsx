'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SearchSelect } from '@/components/ui/molecules/SearchSelect';
import { toast } from 'sonner';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  createUserAcquirerRequest,
} from '@/lib/services/user/acquirer-requests';
import {
  getUserAcquirerAccounts,
  UserAcquirerAccount,
  UserAcquirerAccountListResponse,
} from '@/lib/services/user/acquirer-accounts';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { MultiSelectField } from '@/app/(protected)/admin/acquirers/acquirer-accounts/[id]/edit/components/multi-select-field';

const PAYMENT_METHOD_OPTIONS = [
  { value: 'card', label: 'Card' },
  { value: 'apm', label: 'APM' },
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
];

const formSchema = z.object({
  acceptedPaymentMethods: z.array(z.string()).min(1, 'Select at least one payment method'),
  processingCurrency: z.array(z.string()).min(1, 'Select at least one currency'),
  description: z.string().optional(),
});

export default function CreateAcquirerRequestPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [accounts, setAccounts] = useState<UserAcquirerAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      acceptedPaymentMethods: ['card'],
      processingCurrency: ['USD'],
      description: 'Need acquirer for USD/EUR processing',
    },
  });

  // Fetch acquirer accounts to populate select
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const response = await getUserAcquirerAccounts({ page: 1, limit: 50 });
        handleApiResponse<UserAcquirerAccountListResponse>(response, {
          onSuccess: (data) => {
            const list = Array.isArray(data.data) ? data.data : (data.data?.data ?? []);
            const normalized = list.map((item: any) => ({
              ...item,
              industryName: item.merchantProfile?.industry?.name,
            }));
            setAccounts(normalized as UserAcquirerAccount[]);

            const first = normalized[0];
            if (first) {
              setSelectedAccountId(String(first.id));
              if (first.merchantProfileId) {
                setSelectedProfileId(String(first.merchantProfileId));
              }
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load acquirer accounts');
          },
        });
      } catch {
        toast.error('An unexpected error occurred');
      } finally {
        setLoadingAccounts(false);
      }
    };
    fetchAccounts();
  }, []);

  const accountOptions = useMemo(
    () =>
      accounts.map((acc) => ({
        value: acc.id.toString(),
        label: acc.name || `Account ${acc.id}`,
        profileId: acc.merchantProfileId,
        subtitle: acc.merchantProfile?.industry?.name || acc.merchantProfile?.merchantProfileName || '',
      })),
    [accounts],
  );

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedAccountId || !selectedProfileId) {
      toast.error('Please select an acquirer account.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        merchantProfileId: Number(selectedProfileId),
        acquirerAccountId: Number(selectedAccountId),
        acceptedPaymentMethods: values.acceptedPaymentMethods,
        processingCurrency: values.processingCurrency,
        description: values.description || undefined,
      };
      const response = await createUserAcquirerRequest(payload);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Acquirer request submitted successfully');
          router.push('/acquirer-requests');
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to submit request');
        },
      });
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Apply for Acquirer"
          description="Submit a request to add a new payment gateway acquirer account with required documentation and configuration details"
          icon={FileText}
        />
        <ToolbarActions />
      </Toolbar>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Acquirer Account</Label>
              <SearchSelect
                options={accountOptions.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                  description: opt.subtitle,
                }))}
                value={selectedAccountId}
                onChange={(val) => {
                  setSelectedAccountId(val);
                  const matched = accountOptions.find((opt) => opt.value === val);
                  if (matched?.profileId) {
                    setSelectedProfileId(String(matched.profileId));
                  }
                }}
                placeholder={loadingAccounts ? 'Loading accounts...' : 'Select acquirer account'}
                disabled={loadingAccounts}
              />
              {selectedProfileId && (
                <p className="text-xs text-muted-foreground">
                  Profile ID: {selectedProfileId}
                </p>
              )}
            </div>

            <MultiSelectField
              control={form.control}
              name="acceptedPaymentMethods"
              label="Accepted Payment Methods"
              options={PAYMENT_METHOD_OPTIONS}
              placeholder="Select payment methods"
              disabled={loadingAccounts}
            />

            <MultiSelectField
              control={form.control}
              name="processingCurrency"
              label="Processing Currency"
              options={CURRENCY_OPTIONS}
              placeholder="Select currencies"
              disabled={loadingAccounts}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Provide any additional details"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" disabled={isSubmitting || loadingAccounts}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.push('/acquirer-requests')}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </Container>
  );
}


