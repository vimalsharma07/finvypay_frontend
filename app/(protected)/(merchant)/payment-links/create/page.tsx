'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Fragment } from 'react';
import { Link2, Plus, X } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchSelect } from '@/components/ui/molecules/SearchSelect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentLoader } from '@/components/common/content-loader';
import { toast } from 'sonner';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  createUserPaymentLink,
} from '@/lib/services/user/payment-links';
import { useCurrencies } from '@/lib/hooks/use-currencies';
import { z } from 'zod';

const createPaymentLinkSchema = z.object({
  name: z.string()
    .min(1, 'Payment link name is required')
    .max(255, 'Payment link name must be less than 255 characters')
    .refine((val) => !/^\s*$/.test(val), 'Payment link name cannot contain only spaces'),

  amount: z.number()
    .positive('Amount must be greater than 0')
    .max(999999.99, 'Amount cannot exceed 999,999.99'),

  currency: z.string()
    .min(1, 'Currency is required')
    .max(10, 'Currency code is too long'),

  expiryValidity: z.string()
    .min(1, 'Expiry validity is required')
    .refine((val) => ['1hr', '6hr', '12hr', '24hr', '7d', '30d'].includes(val),
      'Invalid expiry validity. Must be one of: 1hr, 6hr, 12hr, 24hr, 7d, 30d'),
});

type CreatePaymentLinkFormData = z.infer<typeof createPaymentLinkSchema>;

const EXPIRY_OPTIONS = [
  { value: '1hr', label: '1 Hour' },
  { value: '6hr', label: '6 Hours' },
  { value: '12hr', label: '12 Hours' },
  { value: '24hr', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

export default function CreatePaymentLinkPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const { currencies, loading: loadingCurrencies } = useCurrencies();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreatePaymentLinkFormData>({
    resolver: zodResolver(createPaymentLinkSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      amount: 0,
      currency: '',
      expiryValidity: '24hr',
    },
  });

  const onSubmit = async (data: CreatePaymentLinkFormData): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Creating payment link:', data); // Debug log

      const response = await createUserPaymentLink(data);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Payment link created successfully');
          router.push('/payment-links');
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to create payment link');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const currencyOptions = currencies.map((currency) => ({
    value: currency.code,
    label: currency.code,
  }));

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Create Payment Link"
            description="Create a new payment link for customers to make secure payments"
            icon={Link2}
          />
        </Toolbar>
      </Container>
      <Container>
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle>Payment Link Information</CardTitle>
          </CardHeader>
          <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Payment Link Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Payment Link Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="e.g., Product Purchase, Service Payment"
                    className="w-full"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs">{errors.name.message}</p>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium">
                    Amount <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    {...register('amount', { valueAsNumber: true })}
                    placeholder="0.00"
                    className="w-full"
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-xs">{errors.amount.message}</p>
                  )}
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium">
                    Currency <span className="text-red-500">*</span>
                  </Label>
                  {loadingCurrencies ? (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ContentLoader />
                      <span>Loading currencies...</span>
                    </div>
                  ) : currencyOptions.length > 0 ? (
                    <SearchSelect
                      options={currencyOptions}
                      value={watch('currency') || ''}
                      onChange={(value) => setValue('currency', value)}
                      placeholder="Search and select currency..."
                      disabled={loadingCurrencies}
                      maxHeight="200px"
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground py-2 px-3 border rounded-md bg-muted/50">
                      No currencies available
                    </div>
                  )}
                  {errors.currency && (
                    <p className="text-red-500 text-xs">{errors.currency.message}</p>
                  )}
                </div>

                {/* Expiry Validity */}
                <div className="space-y-2">
                  <Label htmlFor="expiryValidity" className="text-sm font-medium">
                    Expiry Validity <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue('expiryValidity', value)}
                    value={watch('expiryValidity')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select expiry time" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPIRY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.expiryValidity && (
                    <p className="text-red-500 text-xs">{errors.expiryValidity.message}</p>
                  )}
                </div>

            {/* Submit Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/payment-links')}
                disabled={isLoading}
              >
                <X className="h-4 w-4 me-1" />
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || loadingCurrencies}
              >
                <Plus className="h-4 w-4 me-1" />
                {isLoading ? 'Creating...' : 'Create Payment Link'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Container>
    </Fragment>
  );
}
