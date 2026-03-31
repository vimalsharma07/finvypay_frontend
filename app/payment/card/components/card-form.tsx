'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { toast } from 'sonner';
import { getUserPaymentLinkById } from '@/lib/services/user/payment-links';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { getPaymentReturnUrl } from '@/lib/utils/payment-return-url';
import { http } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';

const numericString = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .regex(/^\d+$/, message)
    .min(min, message)
    .max(max, message);

const expiryPattern = /^(0[1-9]|1[0-2])\s*\/\s*(\d{2}|\d{4})$/;

const formatExpiryInput = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 6); // MM + YYYY (max)
  if (digits.length <= 2) return digits;
  const month = digits.slice(0, 2);
  const year = digits.slice(2);
  return year ? `${month}/${year}` : month;
};

const parseExpiry = (value: string) => {
  const match = value.trim().match(expiryPattern);
  if (!match) return null;
  const month = Number(match[1]);
  let year = Number(match[2]);
  if (match[2].length === 2) {
    year += 2000;
  }
  return { month, year };
};

const cardSchema = z.object({
  cardNumber: z.string().trim().refine((v) => {
    const digits = v.replace(/\D/g, '');
    return digits.length >= 13 && digits.length <= 19;
  }, 'Enter a valid card number'),
  cardExpiry: z
    .string()
    .trim()
    .refine((val) => expiryPattern.test(val), {
      message: 'Use MM/YY or MM/YYYY',
    })
    .refine((val) => {
      const parsed = parseExpiry(val);
      if (!parsed) return false;
      const now = new Date();
      const thisMonth = now.getMonth() + 1;
      const thisYear = now.getFullYear();
      if (parsed.year < thisYear) return false;
      if (parsed.year === thisYear && parsed.month < thisMonth) return false;
      return parsed.year <= thisYear + 15;
    }, 'Expiry must be valid and in the future'),
  cvv: numericString(3, 4, 'CVV must be 3-4 digits'),
});

type CardFormValues = z.infer<typeof cardSchema>;

const getInitialValues = (params: ReturnType<typeof useSearchParams>): CardFormValues => {
  const month = params.get('cardExpiryMonth');
  const year = params.get('cardExpiryYear');
  const expiry = params.get('cardExpiry');

  const combined =
    expiry ??
    (month && year ? `${month.padStart(2, '0')}/${year.length === 2 ? year : year}` : '');

  return {
    cardNumber: params.get('cardNumber') ?? '',
    cardExpiry: formatExpiryInput(combined),
    cvv: params.get('cvv') ?? '',
  };
};

const getCardBrand = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'VISA';
  if (/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-6]|7[01]|720)/.test(digits)) return 'MASTERCARD';
  if (/^3[47]/.test(digits)) return 'AMEX';
  if (/^6(?:011|5)/.test(digits)) return 'DISCOVER';
  return 'CARD';
};

const formatCardNumberInput = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();

const hexToRgb = (hex: string) => {
  const value = hex.replace('#', '').trim();
  if (value.length !== 6) return { r: 23, g: 184, b: 166 };
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return { r: 23, g: 184, b: 166 };
  return { r, g, b };
};

export function CardForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [paymentLinkData, setPaymentLinkData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Fetch payment link data
  useEffect(() => {
    const paymentLinkId = searchParams.get('paymentLinkId');
    if (!paymentLinkId) {
      toast.error('Payment link ID is required');
      router.push('/');
      return;
    }

    const fetchPaymentLink = async () => {
      try {
        const response = await getUserPaymentLinkById(paymentLinkId);
        handleApiResponse(response, {
          onSuccess: (data) => {
            if (data.success && data.data) {
              setPaymentLinkData(data.data);
            } else {
              toast.error('Payment link not found');
              router.push('/');
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load payment link');
            router.push('/');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentLink();
  }, [searchParams, router]);

  const initialValues = useMemo(() => getInitialValues(searchParams), [searchParams]);

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: initialValues,
    mode: 'onBlur',
  });

  const watched = form.watch();

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  const onSubmit = async (values: CardFormValues) => {
    if (!paymentLinkData) {
      toast.error('Payment link data not available');
      return;
    }

    setProcessing(true);

    try {
      const parsed = parseExpiry(values.cardExpiry);

      // Get customer data from query params
      const customerData = {
        firstName: searchParams.get('firstName') || '',
        lastName: searchParams.get('lastName') || '',
        address: searchParams.get('address') || '',
        city: searchParams.get('city') || '',
        state: searchParams.get('state') || '',
        zip: searchParams.get('zip') || '',
        country: 'US', // Default country
        email: searchParams.get('email') || '',
      };

      const paymentLinkId = searchParams.get('paymentLinkId');

      const checkoutAmount = searchParams.get('amount');
      const resolvedAmount =
        paymentLinkData.amountType === 'custom'
          ? Number(checkoutAmount || 0)
          : Number(paymentLinkData.amount || 0);

      const paymentPayload = {
        orderId: searchParams.get('orderId') || `ORD_${Date.now()}`,
        amount: resolvedAmount,
        currency: paymentLinkData.currency,
        cardNumber: values.cardNumber.replace(/\D/g, ''),
        cardExpiryMonth: parsed?.month || 0,
        cardExpiryYear: parsed?.year || 0,
        cvv: values.cvv,
        cardholderName: `${customerData.firstName} ${customerData.lastName}`,
        source: searchParams.get('source') || 'link', // Payment source (link, api, etc.)
        token: paymentLinkId || '', // Payment link ID passed as token
        returnUrl: getPaymentReturnUrl(),
        ...customerData,
      };

      // Process payment via API (production); same payload shape for sandbox/card with returnUrl
      const response = await http.post('/api/v1/production/card', paymentPayload);

      // Check if 3DS redirect is required
      if (response.status === 'REDIRECT' && response.is3DS) {
        toast.info('Redirecting for 3D Secure authentication...');
        // Redirect to 3DS URL
        window.location.href = response.is3DS;
        return;
      }

      // Check if payment was successful
      const isSuccess = response.success === true && response.status === 'SUCCESS';

      if (isSuccess && response.data) {
        const paymentData = response.data;
        const amount = paymentData.amount || paymentLinkData?.amount || '';
        const currency = paymentData.currency || paymentLinkData?.currency || '';
        const transactionId =
          paymentData.transactionId ??
          paymentData.transaction_id ??
          paymentData.id ??
          '';

        toast.success('Payment processed successfully!', {
          description: 'Your payment has been completed.',
        });

        const queryParams = new URLSearchParams({
          status: 'success',
          ...(transactionId && { transactionId: String(transactionId) }),
          ...(amount && { amount: String(amount) }),
          ...(currency && { currency: String(currency) }),
        });

        router.push(`/payment/status?${queryParams.toString()}`);
      } else {
        toast.error('Payment failed', {
          description: response.message || 'Please check your card details and try again.',
        });

        router.push('/payment/status?status=failed');
      }
    } catch (error: any) {
      console.error('Payment processing error:', error);
      toast.error('Payment processing failed', {
        description: error?.message || 'Please try again or contact support.',
      });

      router.push('/payment/status?status=failed');
    } finally {
      setProcessing(false);
    }
  };

  const formatPreviewNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    const padded = (digits + '•'.repeat(16)).slice(0, 16);
    return padded.replace(/(.{4})/g, '$1 ').trim();
  };

  const brand = getCardBrand(watched.cardNumber || '');
  const primaryColor = paymentLinkData?.paymentTemplate?.primaryColor || '#17B8A6';
  const logoUrl =
    searchParams.get('logoUrl') ||
    paymentLinkData?.paymentTemplate?.logoUrl ||
    '/media/app/mini-logo.svg';
  const inputClassName =
    'h-11 rounded-xl border-slate-200 bg-slate-50/70 focus-visible:ring-2 focus-visible:ring-offset-0';

  const previewExpiry = () => {
    const parsed = parseExpiry(watched.cardExpiry || '');
    if (!parsed) return 'MM/YY';
    const yy = String(parsed.year).slice(-2);
    const mm = String(parsed.month).padStart(2, '0');
    return `${mm}/${yy}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      {paymentLinkData && (
        <Card
          className="border-0 shadow-md"
          style={{
            background: `linear-gradient(to right, ${primaryColor}14, ${primaryColor}1F)`,
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Amount</p>
                <p className="text-2xl font-bold text-primary">
                  {paymentLinkData.currency} {Number(searchParams.get('amount') || paymentLinkData.amount || 0).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{paymentLinkData.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                <p className="text-sm font-mono">{searchParams.get('orderId') || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative grid gap-8 md:grid-cols-[1fr_1fr] items-start">
        <div className="relative z-10">
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-2 border-b bg-slate-50">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-primary-foreground text-xs font-semibold"
                  style={{ backgroundColor: primaryColor }}
                >
                  1
                </div>
                <div>
                  <CardTitle className="text-base leading-tight">Card details</CardTitle>
                  <p className="text-sm text-muted-foreground">Enter your card details</p>
                </div>
              </div>
            </CardHeader>

          <CardContent className="pt-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          inputMode="numeric"
                          placeholder="4111 1111 1111 1111"
                          maxLength={23}
                          className={inputClassName}
                          onChange={(event) => field.onChange(formatCardNumberInput(event.target.value))}
                        />
                      </FormControl>
                      <div className="flex justify-between">
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">{brand}</p>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 grid-cols-[1.3fr,0.7fr]">
                  <FormField
                    control={form.control}
                    name="cardExpiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            inputMode="numeric"
                            placeholder="MM / YY"
                            maxLength={7}
                            className={inputClassName}
                            onChange={(event) => {
                              const formatted = formatExpiryInput(event.target.value);
                              field.onChange(formatted);
                            }}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Format: MM/YY or MM/YYYY</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            inputMode="numeric"
                            type="password"
                            placeholder="123"
                            maxLength={4}
                            className={inputClassName}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between gap-2 pt-2">
                  <Button variant="outline" type="button" onClick={() => router.back()} disabled={processing}>
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={processing}
                    style={{ backgroundColor: primaryColor }}
                  >
                    {processing ? 'Processing...' : 'Complete payment'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          </Card>
        </div>

      <div className="relative">
        {(() => {
          const accent = hexToRgb(primaryColor);
          const holderName =
            `${searchParams.get('firstName') || ''} ${searchParams.get('lastName') || ''}`.trim() ||
            'Card Holder';
          const cvvDots = watched.cvv ? '•'.repeat(Math.min(watched.cvv.length, 4)) : '***';
          const brandLabel =
            brand === 'MASTERCARD' ? 'Mastercard' : brand === 'VISA' ? 'Visa' : brand;

          return (
            <>
              <div
                className="absolute inset-0 right-[-6%] top-[-8%] rounded-[30px] blur-2xl opacity-75"
                style={{
                  background: `radial-gradient(circle at 30% 30%, rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.55), rgba(15, 23, 42, 0.65) 65%)`,
                }}
              />
              <motion.div
                initial={{ opacity: 0, y: 14, rotateX: 6 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.35 }}
                className="relative ml-auto max-w-xl rounded-[28px] p-6 shadow-2xl border border-white/10 overflow-hidden"
                style={{
                  background: `linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.94) 50%, rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.55) 100%)`,
                }}
              >
                <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

                <div className="relative flex flex-col gap-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="Logo"
                          className="h-8 max-w-20 object-contain rounded bg-white/90 px-1.5"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/media/app/mini-logo.svg';
                          }}
                        />
                      ) : (
                        <div className="h-8 w-12 rounded-md bg-white/15 flex items-center justify-center text-[11px] font-semibold tracking-wide">FP</div>
                      )}
                      <div className="h-9 w-12 rounded-md border border-white/30 bg-gradient-to-br from-slate-200/80 to-slate-400/60" />
                    </div>
                    <Badge className="bg-white/10 text-white border-white/20">{brandLabel}</Badge>
                  </div>

                  <motion.div
                    key={formatPreviewNumber(watched.cardNumber || '')}
                    initial={{ opacity: 0.35, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-mono text-[22px] tracking-[0.22em] leading-none"
                  >
                    {formatPreviewNumber(watched.cardNumber || '')}
                  </motion.div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-white/65">Card Holder</p>
                      <p className="text-sm font-semibold truncate">{holderName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-white/65">Expiry</p>
                      <p className="text-sm font-semibold">{previewExpiry()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-white/65">CVV</p>
                      <p className="text-sm font-semibold tracking-[0.24em]">{cvvDots}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {brand === 'MASTERCARD' && (
                        <>
                          <span className="h-5 w-5 rounded-full bg-red-500/90" />
                          <span className="-ml-2 h-5 w-5 rounded-full bg-yellow-400/90" />
                        </>
                      )}
                      {brand === 'VISA' && <p className="text-xl font-black italic tracking-tight">VISA</p>}
                      {brand !== 'VISA' && brand !== 'MASTERCARD' && (
                        <p className="text-sm font-semibold">{brandLabel}</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
        </div>
      </div>
    </div>
  );
}


