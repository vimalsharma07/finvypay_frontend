'use client';

import { useEffect, useMemo } from 'react';
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
  cardNumber: numericString(13, 19, 'Enter a valid card number'),
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

export function CardForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const onSubmit = (values: CardFormValues) => {
    const parsed = parseExpiry(values.cardExpiry);
    const normalizedPayload = {
      cardNumber: values.cardNumber,
      cardExpiryMonth: parsed?.month ?? null,
      cardExpiryYear: parsed?.year ?? null,
      cvv: values.cvv,
    };

    toast.success('Card details captured', {
      description: 'Ready to complete payment.',
    });
    console.log('Card submission payload', normalizedPayload);
  };

  const formatPreviewNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    const padded = (digits + '•'.repeat(16)).slice(0, 16);
    return padded.replace(/(.{4})/g, '$1 ').trim();
  };

  const previewExpiry = () => {
    const parsed = parseExpiry(watched.cardExpiry || '');
    if (!parsed) return 'MM/YY';
    const yy = String(parsed.year).slice(-2);
    const mm = String(parsed.month).padStart(2, '0');
    return `${mm}/${yy}`;
  };

  return (
    <div className="relative grid gap-8 md:grid-cols-2 items-start">
      <div className="relative z-10">
        <Card className="shadow-sm border border-muted">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                1
              </div>
              <div>
                <CardTitle className="text-base leading-tight">Card details</CardTitle>
                <p className="text-sm text-muted-foreground">Enter your payment info</p>
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
                          maxLength={19}
                        />
                      </FormControl>
                      <FormMessage />
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between gap-2 pt-2">
                  <Button variant="outline" type="button" onClick={() => router.back()}>
                    Back
                  </Button>
                  <Button type="submit">Complete payment</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <div className="absolute inset-0 right-[-10%] top-[-12%] rotate-3 bg-gradient-to-br from-primary to-primary/70 rounded-3xl blur-sm opacity-80" />
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 shadow-xl p-5 text-white min-h-[240px] max-w-xl ml-auto">
          <div className="absolute -right-10 -top-14 h-32 w-28 rotate-9 bg-white/12 blur-2xl" />
          <div className="absolute -left-8 bottom-0 h-28 w-28 -rotate-3 bg-white/10 blur-2xl" />
          <div className="relative flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-12 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center text-[11px] font-semibold">
                  P4
                </div>
                <div className="text-xs">
                  <p className="font-semibold">Pay4Tech</p>
                  <p className="text-white/80">Checkout</p>
                </div>
              </div>
              <div className="text-right text-[11px]">
                <p className="text-white/80">STEP 2</p>
                <p className="font-semibold tracking-wide">CARD</p>
              </div>
            </div>

            <div className="flex justify-between items-center text-base font-semibold tracking-widest">
              {formatPreviewNumber(watched.cardNumber || '')}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-white/80 text-[10px] uppercase tracking-wide">Name</p>
                <p className="font-semibold">Pay4Tech User</p>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-[10px] uppercase tracking-wide">Expiry</p>
                <p className="font-semibold">{previewExpiry()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="h-8 w-12 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center text-[11px] font-semibold">
                CVV
              </div>
              <div className="text-sm font-semibold tracking-widest">
                {watched.cvv ? '•••' : '***'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


