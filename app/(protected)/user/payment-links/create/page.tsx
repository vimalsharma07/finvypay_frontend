'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link2, ArrowLeft } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentLoader } from '@/components/common/content-loader';
import { toast } from 'sonner';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  createUserPaymentLink,
} from '@/lib/services/user/payment-links';
import {
  getCurrencies,
  Currency,
} from '@/lib/services/admin/currency';
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
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);

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

  // Fetch currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      setLoadingCurrencies(true);
      try {
        const response = await getCurrencies();

        handleApiResponse(response, {
          onSuccess: (data) => {
            if (data.success && data.data) {
              // Handle both array format and nested data format
              const currenciesArray = Array.isArray(data.data) ? data.data : (data.data.data || []);
              setCurrencies(currenciesArray);
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load currencies');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred while loading currencies');
      } finally {
        setLoadingCurrencies(false);
      }
    };

    fetchCurrencies();
  }, []);

  const onSubmit = async (data: CreatePaymentLinkFormData): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Creating payment link:', data); // Debug log

      const response = await createUserPaymentLink(data);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Payment link created successfully');
          router.push('/user/payment-links');
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
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Create Payment Link"
            description="Create a new payment link for customers to make secure payments"
            icon={Link2}
          />
          <ToolbarActions>
            <Button
              variant="outline"
              onClick={() => router.push('/user/payment-links')}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Payment Link Details</CardTitle>
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
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ContentLoader />
                      <span>Loading currencies...</span>
                    </div>
                  ) : currencyOptions.length > 0 ? (
                    <Select
                      onValueChange={(value) => setValue('currency', value)}
                      value={watch('currency')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/user/payment-links')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading || loadingCurrencies}
                  >
                    {isLoading ? 'Creating...' : 'Create Payment Link'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </Container>
    </>
  );
}
