'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, X, Plus } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { createUserAcquirerRequest } from '@/lib/services/user/acquirer-requests';
import { getUserProfileId } from '@/lib/services/user/merchant-profile';
import { useAuth } from '@/hooks/use-auth';
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
  processingVolume: z.number({ invalid_type_error: 'Processing volume is required' }).min(1, 'Processing volume must be at least 1'),
  acceptedPaymentMethods: z.array(z.string()).min(1, 'Select at least one payment method'),
  processingCurrency: z.array(z.string()).min(1, 'Select at least one currency'),
  description: z.string().optional(),
});

export default function CreateAcquirerRequestPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const profileId = getUserProfileId(null, user);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      processingVolume: 50000,
      acceptedPaymentMethods: ['card'],
      processingCurrency: ['USD'],
      description: 'Need acquirer for USD/EUR processing',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!profileId) {
      toast.error('Merchant profile not found. Please ensure you have an active profile.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        merchantProfileId: Number(profileId),
        processingVolume: values.processingVolume,
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
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Apply for Acquirer"
            description="Submit a request to add a new payment gateway acquirer account with required documentation and configuration details"
            icon={FileText}
          />
          <ToolbarActions />
        </Toolbar>
      </Container>
      <Container>
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle>Acquirer Request Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="processingVolume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Processing Volume</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      placeholder="e.g. 50000"
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === '') {
                          field.onChange(undefined as any);
                          return;
                        }
                        const n = Number(v);
                        if (!Number.isNaN(n)) field.onChange(n);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <MultiSelectField
              control={form.control}
              name="acceptedPaymentMethods"
              label="Accepted Payment Methods"
              options={PAYMENT_METHOD_OPTIONS}
              placeholder="Select payment methods"
            />

            <MultiSelectField
              control={form.control}
              name="processingCurrency"
              label="Processing Currency"
              options={CURRENCY_OPTIONS}
              placeholder="Select currencies"
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

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/acquirer-requests')}
                    disabled={isSubmitting || !profileId}
                  >
                    <X className="h-4 w-4 me-1" />
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSubmitting || !profileId}>
                    <Plus className="h-4 w-4 me-1" />
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}


