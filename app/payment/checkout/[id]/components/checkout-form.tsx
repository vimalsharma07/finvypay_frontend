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
import { Badge } from '@/components/ui/badge';
import { SearchSelect } from '@/components/ui/molecules/SearchSelect';
import countriesJson from '@/data/countries.json';

const COUNTRY_OPTIONS = (
  countriesJson as Array<{
    country_name: string;
    iso_two: string;
    flag: string;
    status: string;
    is_deleted: boolean;
  }>
)
  .filter((c) => c.status === 'active' && !c.is_deleted)
  .sort((a, b) => a.country_name.localeCompare(b.country_name))
  .map((c) => ({
    value: c.iso_two,
    label: `${c.country_name} ${c.flag}`,
  }));

const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  address: z.string().trim().min(1, 'Address is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  zip: z.string().trim().min(1, 'ZIP is required'),
  country: z.string().trim().min(2, 'Country is required'),
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
  country: '',
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
      country: values.country,
      email: values.email,
      orderId: values.orderId,
      amount: values.amount,
      currency: values.currency,
      source: 'link', // Indicate payment source is from payment link
      primaryColor: paymentLinkData?.paymentTemplate?.primaryColor || '',
      logoUrl: paymentLinkData?.paymentTemplate?.logoUrl || '',
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

  const primaryColor = paymentLinkData?.paymentTemplate?.primaryColor || '#17B8A6';
  const brandLogoUrl = paymentLinkData?.paymentTemplate?.logoUrl || '/media/app/mini-logo.svg';
  const inputClassName =
    'h-11 rounded-xl border-slate-200 bg-slate-50/70 focus-visible:ring-2 focus-visible:ring-offset-0';

  return (
    <div className="space-y-6">
      <Card
        className="border-0 shadow-xl overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${primaryColor}, ${primaryColor}CC 55%, #0f172a 120%)`,
        }}
      >
        <CardContent className="p-6 md:p-7 text-white">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-24 rounded-lg bg-white/90 p-2 flex items-center justify-center">
                <img
                  src={brandLogoUrl}
                  alt="Brand logo"
                  className="h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/media/app/mini-logo.svg';
                  }}
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/75">Secure Checkout</p>
                <p className="text-2xl font-semibold leading-tight">{paymentLinkData?.name || 'Payment Link'}</p>
                <p className="text-xs text-white/75 mt-1">Fill your details and continue to card payment</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/70">Order ID</p>
              <p className="font-mono text-sm">{form.watch('orderId')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
      <Card className="shadow-xl border-0">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Checkout details</CardTitle>
              <p className="text-xs text-muted-foreground">Step 1 of 2</p>
            </div>
            <Badge variant="outline" className="font-mono">
              {paymentLinkData?.currency} {Number(initialValues.amount || 0).toFixed(2)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-5">
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
                        className={inputClassName}
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
                        className={inputClassName}
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
                      className={inputClassName}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="San Francisco" autoComplete="address-level2" className={inputClassName} />
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
                      <Input {...field} placeholder="CA" autoComplete="address-level1" className={inputClassName} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <div className="[&_button]:h-11 [&_button]:rounded-xl [&_button]:border-slate-200 [&_button]:bg-slate-50/70">
                        <SearchSelect
                          options={COUNTRY_OPTIONS}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select country"
                        />
                      </div>
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
                      <Input {...field} placeholder="94107" autoComplete="postal-code" className={inputClassName} />
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
                      className={inputClassName}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
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
                        readOnly={paymentLinkData?.amountType === 'fixed'}
                        className={`${inputClassName} ${paymentLinkData?.amount ? 'bg-slate-100' : ''}`}
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
                        className={`${inputClassName} ${paymentLinkData?.currency ? 'bg-slate-100' : ''}`}
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

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                className="min-w-48 h-11 rounded-xl"
                style={{ backgroundColor: primaryColor }}
              >
                Continue to payment
              </Button>
            </div>
          </form>
        </Form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent
          className="p-6 text-white h-full min-h-[280px] flex flex-col justify-between"
          style={{
            background: `linear-gradient(155deg, ${primaryColor}, ${primaryColor}B3 60%, #0f172a 100%)`,
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Payment summary</p>
            <Badge className="bg-white/20 text-white border-white/30">Secure</Badge>
          </div>
          <div>
            <p className="text-xs text-white/80">Amount</p>
            <p className="text-3xl font-bold">
              {paymentLinkData?.currency} {Number(form.watch('amount') || 0).toFixed(2)}
            </p>
            <p className="text-xs text-white/80 mt-2">{paymentLinkData?.name || 'Payment Link'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-white/70">Order ID</p>
              <p className="font-mono truncate">{form.watch('orderId')}</p>
            </div>
            <div>
              <p className="text-white/70">Currency</p>
              <p className="font-semibold">{form.watch('currency') || paymentLinkData?.currency}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}


