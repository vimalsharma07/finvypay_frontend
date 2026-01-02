'use client';

import { useEffect, useState } from 'react';
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const otpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter a 6-digit code'),
});

type OtpValues = z.infer<typeof otpSchema>;

export function OtpForm() {
  const form = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
    mode: 'onBlur',
  });

  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const onSubmit = (values: OtpValues) => {
    toast.success('OTP verified successfully');
    console.log('OTP submission payload', values);
  };

  const handleResend = () => {
    setCooldown(30);
    toast.message('OTP resent', { description: 'Check your device for a new code' });
  };

  return (
    <div className="flex justify-center">
      <Card className="shadow-sm border border-muted w-full max-w-md">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              1
            </div>
            <div className="text-center">
              <CardTitle className="text-base leading-tight">Enter OTP</CardTitle>
              <p className="text-sm text-muted-foreground">6-digit card verification code</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center gap-2">
                    <FormLabel>6-digit code</FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={(val) => {
                          const numeric = val.replace(/\D/g, '').slice(0, 6);
                          field.onChange(numeric);
                        }}
                      >
                        <InputOTPGroup className="justify-center">
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={cooldown > 0}
                  onClick={handleResend}
                  className="text-sm"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </Button>
                <div className="flex gap-2">
                  <Button type="submit">Verify</Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}


