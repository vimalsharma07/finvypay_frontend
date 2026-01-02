'use client';

import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  address: z.string().trim().min(1, 'Address is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  zip: z.string().trim().min(1, 'ZIP is required'),
  email: z
    .string()
    .trim()
    .email('Enter a valid email address')
    .min(1, 'Email is required'),
  orderId: z.string().trim().min(1, 'Order ID is required'),
  amount: z
    .string()
    .trim()
    .refine((value) => {
      if (value === '') return false;
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0;
    }, 'Amount must be a positive number'),
  currency: z
    .string()
    .trim()
    .min(1, 'Currency is required')
    .max(10, 'Currency is too long'),
  merchantProfileId: z
    .string()
    .trim()
    .min(1, 'Merchant profile ID is required'),
  webhookUrl: z
    .string()
    .trim()
    .min(1, 'Webhook URL is required')
    .url('Enter a valid URL'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const fieldLabels: Record<keyof CheckoutFormValues, string> = {
  firstName: 'First Name',
  lastName: 'Last Name',
  address: 'Address',
  city: 'City',
  state: 'State',
  zip: 'ZIP',
  email: 'Email',
  orderId: 'Order ID',
  amount: 'Amount',
  currency: 'Currency',
  merchantProfileId: 'Merchant Profile ID',
  webhookUrl: 'Webhook URL',
};

const getInitialValues = (
  params: ReturnType<typeof useSearchParams>,
): CheckoutFormValues => ({
  firstName: params.get('firstName') ?? '',
  lastName: params.get('lastName') ?? '',
  address: params.get('address') ?? '',
  city: params.get('city') ?? '',
  state: params.get('state') ?? '',
  zip: params.get('zip') ?? '',
  email: params.get('email') ?? '',
  orderId: params.get('orderId') ?? '',
  amount: params.get('amount') ?? '',
  currency: params.get('currency') ?? '',
  merchantProfileId: params.get('merchantProfileId') ?? '',
  webhookUrl: params.get('webhookUrl') ?? '',
});

export function CheckoutForm() {
  const searchParams = useSearchParams();

  const initialValues = useMemo(
    () => getInitialValues(searchParams),
    [searchParams],
  );

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: initialValues,
    mode: 'onBlur',
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  const prefilledFields = useMemo(
    () =>
      Object.entries(initialValues)
        .filter(([, value]) => value.trim() !== '')
        .map(([key]) => fieldLabels[key as keyof CheckoutFormValues]),
    [initialValues],
  );

  const handleSubmit = (values: CheckoutFormValues) => {
    console.log('Checkout submission payload', {
      ...values,
      amount: Number(values.amount),
      currency: values.currency.toUpperCase(),
    });
  };

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader className="pb-4">
        <div className="flex w-full flex-wrap items-center gap-4 justify-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              1
            </div>
            <div>
              <CardTitle className="text-base text-center md:text-left">Checkout details</CardTitle>
              <p className="text-sm text-muted-foreground text-center md:text-left">Your payer info</p>
            </div>
          </div>
          <div className="hidden h-px flex-1 bg-muted md:block" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              2
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-center md:text-left">Payment</p>
              <p className="text-xs text-muted-foreground text-center md:text-left">Card details</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
            noValidate
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Jane"
                        autoComplete="given-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Doe"
                        autoComplete="family-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="123 Main St, Suite 500"
                      autoComplete="street-address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="San Francisco" autoComplete="address-level2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="CA" autoComplete="address-level1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="94107" autoComplete="postal-code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="customer@company.com"
                      autoComplete="email"
                      inputMode="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="ORD-2024-0001"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="merchantProfileId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Merchant profile ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="merchant_12345"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        placeholder="99.99"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="USD"
                        autoComplete="off"
                        onChange={(event) =>
                          field.onChange(event.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="webhookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="url"
                        placeholder="https://example.com/webhook"
                        autoComplete="url"
                        inputMode="url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="min-w-48">
                Continue to payment
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


