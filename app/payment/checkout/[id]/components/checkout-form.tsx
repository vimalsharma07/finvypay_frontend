'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { getUserPaymentLinkById, PaymentLink } from '@/lib/services/user/payment-links';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

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
};

interface CheckoutFormProps {
  paymentLinkId: string;
}

const getInitialValues = (
  paymentLinkData?: PaymentLink | null,
): CheckoutFormValues => ({
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  email: '',
  orderId: `ORDER_${Date.now()}`,
  amount: paymentLinkData?.amount?.toString() ?? '',
  currency: paymentLinkData?.currency ?? '',
});

export function CheckoutForm({ paymentLinkId }: CheckoutFormProps) {
  const router = useRouter();
  const [paymentLinkData, setPaymentLinkData] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);


  // Fetch payment link data
  useEffect(() => {
    const fetchPaymentLink = async () => {
      if (!paymentLinkId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        console.log('🔄 Fetching payment link with ID:', paymentLinkId);
        const response = await getUserPaymentLinkById(paymentLinkId);
        console.log('📥 API response:', response);

        if (response.status === 200 && response.data) {
          console.log('Payment link API response data:', response.data);
          if (response.data.success && response.data.data) {
            console.log('✅ Pre-filling form with payment link data:', {
              amount: response.data.data.amount,
              currency: response.data.data.currency
            });
            setPaymentLinkData(response.data.data);
            setLoading(false);
          } else {
            console.log('Payment link not found in API response');
            toast.warning('Payment link data not found. Please fill the form manually.');
            setLoading(false);
          }
        } else {
          console.log('❌ API call failed with status:', response.status, 'Response:', response);
          toast.warning('Unable to load payment link data. Please fill the form manually.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Exception during API call:', error);
        toast.warning('Unable to load payment link data. Please fill the form manually.');
        setLoading(false);
      }
    };

    fetchPaymentLink();
  }, [paymentLinkId]);

  const initialValues = useMemo(
    () => getInitialValues(paymentLinkData),
    [paymentLinkData],
  );

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: getInitialValues(null), // Start with empty values
    mode: 'onBlur',
  });

  useEffect(() => {
    if (paymentLinkData) {
      console.log('🔄 Resetting form with payment link data:', initialValues);
      form.reset(initialValues);
    }
  }, [form, paymentLinkData, initialValues]);

  const prefilledFields = useMemo(
    () =>
      Object.entries(initialValues)
        .filter(([, value]) => value.trim() !== '')
        .map(([key]) => fieldLabels[key as keyof CheckoutFormValues]),
    [initialValues],
  );


  const handleSubmit = (values: CheckoutFormValues) => {
    // No payment API is called on this page. We only:
    // 1) GET payment link details via getUserPaymentLinkById(paymentLinkId) above
    // 2) Redirect to /payment/card with form data in query params.
    // The actual payment API (POST with payload + returnUrl) is called on the card page.
    const queryParams = new URLSearchParams({
      paymentLinkId,
      firstName: values.firstName,
      lastName: values.lastName,
      address: values.address,
      city: values.city,
      state: values.state,
      zip: values.zip,
      email: values.email,
      orderId: values.orderId,
      amount: values.amount,
      currency: values.currency,
      source: 'link', // Indicate payment source is from payment link
    });

    router.push(`/payment/card?${queryParams.toString()}`);
  };

  if (loading) {
    return (
      <Card className="shadow-lg border-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading payment details...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader className="pb-4">
        <div className="flex w-full flex-wrap items-center gap-4 justify-center md:justify-between">
          <div className="flex items-center gap-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              1
            </div>
            <div>
              <CardTitle className="text-base text-center md:text-left">Checkout details</CardTitle>
              <p className="text-sm text-muted-foreground text-center md:text-left">Your payer info</p>
            </div>
          </div>
          <div className="hidden h-px flex-1 bg-muted md:block" />
          <div className="flex items-center gap-1 text-muted-foreground">
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

            {/* Order ID is auto-generated and passed in background; not shown to user */}

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
                        readOnly={!!paymentLinkData?.amount}
                        className={paymentLinkData?.amount ? 'bg-muted' : ''}
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
                        readOnly={!!paymentLinkData?.currency}
                        className={paymentLinkData?.currency ? 'bg-muted' : ''}
                        onChange={(event) =>
                          field.onChange(event.target.value.toUpperCase())
                        }
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


