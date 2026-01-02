'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

type StatusKey = 'success' | 'failed' | 'declined';

const STATUS_CONFIG: Record<
  StatusKey,
  { title: string; description: string; tone: 'success' | 'error' | 'warning'; icon: React.ElementType }
> = {
  success: {
    title: 'Payment Successful',
    description: 'Your payment has been processed successfully.',
    tone: 'success',
    icon: CheckCircle2,
  },
  failed: {
    title: 'Payment Failed',
    description: 'We could not complete your payment. Please try again.',
    tone: 'error',
    icon: XCircle,
  },
  declined: {
    title: 'Payment Declined',
    description: 'Your bank declined this transaction. Please check with your issuer.',
    tone: 'warning',
    icon: AlertTriangle,
  },
};

const toneBadge: Record<StatusKey | 'unknown', string> = {
  success: 'bg-green-50 text-green-700 ring-1 ring-green-100',
  failed: 'bg-red-50 text-red-700 ring-1 ring-red-100',
  declined: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  unknown: 'bg-slate-50 text-slate-700 ring-1 ring-slate-100',
};

const toneTitle: Record<StatusKey | 'unknown', string> = {
  success: 'text-green-700',
  failed: 'text-red-700',
  declined: 'text-amber-700',
  unknown: 'text-slate-700',
};

export default function PaymentStatusPage() {
  const searchParams = useSearchParams();

  const statusKey = useMemo<StatusKey | 'unknown'>(() => {
    const raw = (searchParams.get('status') || '').toLowerCase();
    if (raw === 'success') return 'success';
    if (raw === 'failed') return 'failed';
    if (raw === 'declined') return 'declined';
    return 'unknown';
  }, [searchParams]);

  const amount = searchParams.get('amount') || '';
  const currency = (searchParams.get('currency') || '').toUpperCase();
  const message = searchParams.get('message') || '';
  const reference = searchParams.get('ref') || searchParams.get('reference') || '';

  const config =
    statusKey === 'unknown'
      ? {
          title: 'Status unavailable',
          description: 'We could not determine the payment status.',
          tone: 'warning' as const,
          icon: Info,
        }
      : STATUS_CONFIG[statusKey];

  const Icon = config.icon;
  const badgeTone = toneBadge[statusKey === 'unknown' ? 'unknown' : statusKey];
  const titleTone = toneTitle[statusKey === 'unknown' ? 'unknown' : statusKey];

  const showAmount = amount || currency;

  return (
    <main className="min-h-screen w-full bg-muted/20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <Card className="shadow-lg border bg-white">
          <CardHeader className="space-y-3 items-center text-center">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${badgeTone}`}>
              <Icon className="h-6 w-6" />
            </div>
            <CardTitle className={`text-xl font-semibold ${titleTone}`}>
              {config.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground max-w-md">
              {message || config.description}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 text-center items-center flex flex-col">
            {showAmount ? (
              <div className="text-2xl font-semibold text-foreground">
                {currency ? `${currency} ` : ''}
                {amount || '--'}
              </div>
            ) : null}
            {reference ? (
              <p className="text-xs text-muted-foreground">
                Reference: <span className="font-medium text-foreground">{reference}</span>
              </p>
            ) : null}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Link href="/">
                <Button variant="outline">Go home</Button>
              </Link>
              {statusKey !== 'success' ? (
                <Button onClick={() => window.location.reload()}>Try again</Button>
              ) : (
                <Link href="/checkout">
                  <Button variant="ghost">New payment</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


