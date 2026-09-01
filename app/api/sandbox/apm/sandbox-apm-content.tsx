'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, QrCode, Smartphone, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/utils/get-api-error-message';

interface SandboxApmData {
  amount?: number;
  currency: string;
  order_id?: string;
  txn_id: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  email?: string;
}

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function parsePaymentData(searchParams: URLSearchParams, transactionId: string): SandboxApmData {
  const amountParam = searchParams.get('amount');
  const parsedAmount = amountParam ? Number.parseFloat(amountParam) : undefined;

  return {
    amount: parsedAmount !== undefined && !Number.isNaN(parsedAmount) ? parsedAmount : undefined,
    currency: searchParams.get('currency') ?? 'USD',
    order_id: searchParams.get('order_id') ?? searchParams.get('orderId') ?? undefined,
    txn_id: transactionId,
    firstName: searchParams.get('firstName') ?? undefined,
    lastName: searchParams.get('lastName') ?? undefined,
    country: searchParams.get('country') ?? undefined,
    email: searchParams.get('email') ?? undefined,
  };
}

function buildQrImageUrl(payload: SandboxApmData) {
  const qrData = JSON.stringify({
    provider: 'cashapp',
    txn_id: payload.txn_id,
    order_id: payload.order_id,
    amount: payload.amount,
    currency: payload.currency,
  });

  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(qrData)}`;
}

export function SandboxApmContent() {
  const searchParams = useSearchParams();

  const transactionId =
    searchParams.get('transactionId') ?? searchParams.get('transaction_id') ?? '';
  const [submitting, setSubmitting] = useState<'success' | 'failed' | null>(null);

  const paymentData = useMemo(
    () => (transactionId ? parsePaymentData(searchParams, transactionId) : null),
    [searchParams, transactionId]
  );

  const qrImageUrl = useMemo(
    () => (paymentData ? buildQrImageUrl(paymentData) : ''),
    [paymentData]
  );

  const completePayment = useCallback(
    async (success: boolean, action: 'success' | 'failed') => {
      if (!transactionId) {
        toast.error('Transaction ID is missing. Cannot complete payment.');
        return;
      }

      setSubmitting(action);
      try {
        const res = await fetch('/api/sandbox/apm/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionId,
            success,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || data?.success === false) {
          toast.error(getApiErrorMessage(data, 'Failed to complete payment'));
          return;
        }

        const redirectUrl = data?.redirectUrl ?? data?.data?.redirectUrl;
        if (redirectUrl && typeof redirectUrl === 'string') {
          window.location.href = redirectUrl;
          return;
        }

        toast.error('No redirect URL received from the server.');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setSubmitting(null);
      }
    },
    [transactionId]
  );

  if (!transactionId) {
    return (
      <main className="min-h-screen w-full bg-muted/20 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-lg border border-border rounded-xl bg-card">
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-lg font-semibold text-foreground">Invalid payment link</p>
            <p className="text-sm text-muted-foreground">
              Transaction ID is missing from the URL.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-muted/20 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">APM Sandbox</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete your alternative payment method
          </p>
        </div>

        <Card className="shadow-lg border border-border overflow-hidden rounded-xl bg-card">
          <CardHeader className="bg-gradient-to-r from-[#00D632] to-[#00B82C] text-white px-5 py-4 rounded-t-xl border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium opacity-90 uppercase tracking-wide">
                  Sandbox Payment
                </p>
                <CardTitle className="text-lg font-semibold mt-0.5 text-white">
                  Pay via Cash App
                </CardTitle>
              </div>
              <Smartphone className="h-8 w-8 shrink-0 opacity-90" />
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                {qrImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrImageUrl}
                    alt="Cash App payment QR code"
                    width={220}
                    height={220}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="h-[220px] w-[220px] flex items-center justify-center rounded-lg bg-muted">
                    <QrCode className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">Pay via Cash App</p>
                <CardDescription className="text-sm">
                  Scan the QR code with Cash App to complete this sandbox payment.
                </CardDescription>
              </div>
            </div>

            {paymentData && (
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 text-sm">
                {paymentData.amount !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold text-foreground">
                      {formatAmount(paymentData.amount, paymentData.currency)}
                    </span>
                  </div>
                )}
                {paymentData.order_id && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-medium text-foreground truncate">{paymentData.order_id}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-medium text-foreground truncate">{paymentData.txn_id}</span>
                </div>
                {(paymentData.firstName || paymentData.lastName) && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Customer</span>
                    <span className="font-medium text-foreground truncate">
                      {[paymentData.firstName, paymentData.lastName].filter(Boolean).join(' ')}
                    </span>
                  </div>
                )}
                {paymentData.email && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium text-foreground truncate">{paymentData.email}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="flex-1 gap-2 bg-[#00D632] hover:bg-[#00B82C] text-white"
                onClick={() => completePayment(true, 'success')}
                disabled={submitting !== null}
              >
                {submitting === 'success' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Success
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 gap-2 text-destructive hover:text-destructive"
                onClick={() => completePayment(false, 'failed')}
                disabled={submitting !== null}
              >
                {submitting === 'failed' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Failed
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
