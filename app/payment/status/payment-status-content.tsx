'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react';
import { getProductionPaymentStatus } from '@/lib/services/user/production-payment-status';

type DisplayStatus = 'loading' | 'success' | 'failed' | 'declined' | 'unknown' | 'missing_id' | 'error';

function resolveTransactionId(searchParams: URLSearchParams): string {
  return (
    searchParams.get('transactionId')?.trim() ||
    searchParams.get('transaction_id')?.trim() ||
    searchParams.get('txnId')?.trim() ||
    searchParams.get('id')?.trim() ||
    ''
  );
}

function inferSuccessFromStatusResponse(data: any): boolean | null {
  if (data == null) return null;
  const status = (data.status ?? data.data?.status ?? '').toString().toUpperCase();
  if (status === 'SUCCESS' || status === 'SUCCEEDED' || status === 'COMPLETED' || status === 'APPROVED') {
    return true;
  }
  if (
    status === 'FAILED' ||
    status === 'DECLINED' ||
    status === 'CANCELLED' ||
    status === 'ERROR'
  ) {
    return false;
  }
  if (data.success === true && (data.status === 'SUCCESS' || data.data?.status === 'SUCCESS')) {
    return true;
  }
  if (data.success === false) return false;
  return null;
}

export function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const [display, setDisplay] = useState<DisplayStatus>('loading');
  const [message, setMessage] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('');

  const transactionId = useMemo(() => resolveTransactionId(searchParams), [searchParams]);
  const queryStatus = (searchParams.get('status') || '').toLowerCase();

  useEffect(() => {
    const run = async () => {
      if (!transactionId) {
        if (queryStatus === 'failed') {
          setDisplay('failed');
          setMessage('Payment could not be completed.');
          return;
        }
        if (queryStatus === 'success') {
          setDisplay('success');
          setMessage('Payment completed.');
          const a = searchParams.get('amount') || '';
          const c = (searchParams.get('currency') || '').toUpperCase();
          if (a) setAmount(a);
          if (c) setCurrency(c);
          return;
        }
        setDisplay('missing_id');
        setMessage('Missing transaction reference. Cannot verify payment status.');
        return;
      }

      setDisplay('loading');
      try {
        const res = await getProductionPaymentStatus(transactionId);
        const inferred = inferSuccessFromStatusResponse(res);
        const msg =
          res?.message ||
          res?.data?.message ||
          res?.error ||
          '';

        const amt = res?.data?.amount ?? res?.amount ?? searchParams.get('amount') ?? '';
        const cur =
          (res?.data?.currency ?? res?.currency ?? searchParams.get('currency') ?? '').toString().toUpperCase();

        if (amt) setAmount(String(amt));
        if (cur) setCurrency(cur);

        if (inferred === true) {
          setDisplay('success');
          setMessage(msg || 'Your payment was successful.');
        } else if (inferred === false) {
          setDisplay('failed');
          setMessage(msg || 'Payment was not successful.');
        } else if (res?.success === true) {
          setDisplay('success');
          setMessage(msg || 'Your payment was successful.');
        } else {
          setDisplay('unknown');
          setMessage(msg || 'Could not determine payment status.');
        }
      } catch (e: any) {
        setDisplay('error');
        setMessage(e?.message || 'Unable to verify payment status. Please try again or contact support.');
      }
    };

    run();
  }, [transactionId, queryStatus, searchParams]);

  const config = useMemo(() => {
    if (display === 'loading') {
      return {
        title: 'Verifying payment',
        description: 'Checking your transaction status…',
        tone: 'muted' as const,
        icon: Loader2,
        iconClass: 'animate-spin text-muted-foreground',
      };
    }
    if (display === 'success') {
      return {
        title: 'Payment successful',
        description: message || 'Your payment has been processed.',
        tone: 'success' as const,
        icon: CheckCircle2,
        iconClass: 'text-green-600',
      };
    }
    if (display === 'failed' || display === 'declined') {
      return {
        title: display === 'declined' ? 'Payment declined' : 'Payment failed',
        description: message || 'We could not complete this payment.',
        tone: 'error' as const,
        icon: display === 'declined' ? AlertTriangle : XCircle,
        iconClass: display === 'declined' ? 'text-amber-600' : 'text-red-600',
      };
    }
    if (display === 'missing_id' || display === 'error' || display === 'unknown') {
      return {
        title:
          display === 'missing_id'
            ? 'Missing transaction'
            : display === 'error'
              ? 'Status check failed'
              : 'Status unclear',
        description: message,
        tone: 'warning' as const,
        icon: Info,
        iconClass: 'text-slate-600',
      };
    }
    return {
      title: 'Payment status',
      description: '',
      tone: 'muted' as const,
      icon: Info,
      iconClass: 'text-slate-600',
    };
  }, [display, message]);

  const Icon = config.icon;

  return (
    <main className="min-h-screen w-full bg-muted/20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl mx-auto">
        <Card className="shadow-lg border bg-white overflow-hidden">
          <CardHeader className="flex flex-col justify-center text-center space-y-3 py-8 [&>*]:mx-auto">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className={`h-6 w-6 ${config.iconClass}`} />
            </div>
            <CardTitle className="text-xl font-semibold text-foreground">{config.title}</CardTitle>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">{config.description}</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 text-center pb-8">
            {transactionId ? (
              <p className="text-xs text-muted-foreground">
                Transaction ID:{' '}
                <span className="font-mono font-medium text-foreground">{transactionId}</span>
              </p>
            ) : null}
            {amount || currency ? (
              <div className="text-2xl font-semibold text-foreground">
                {currency ? `${currency} ` : ''}
                {amount || '--'}
              </div>
            ) : null}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Link href="/">
                <Button variant="outline">Go home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
