'use client';

import { useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Shield,
  Info,
  HelpCircle,
  Code2,
  Check,
  ArrowLeft,
  XCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const THREEDS_OPTIONS = [
  { value: 'success', label: 'Success – Authentication Approved', icon: Check },
  { value: 'failed', label: 'Failed – Authentication Declined', icon: XCircle },
] as const;

type ThreedsResult = (typeof THREEDS_OPTIONS)[number]['value'];

export default function Sandbox3DSPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<ThreedsResult>('success');

  const returnUrl = searchParams.get('returnUrl') ?? searchParams.get('return_url') ?? '';
  const transactionId =
    searchParams.get('transactionId') ?? searchParams.get('transaction_id') ?? '';
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = useCallback(async () => {
    if (!transactionId) {
      toast.error('Transaction ID is missing. Cannot complete authentication.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/payment/sandbox/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          status: result,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.message ?? 'Failed to complete authentication');
        setSubmitting(false);
        return;
      }

      const redirectUrl = data?.redirectUrl ?? data?.data?.redirectUrl;
      if (redirectUrl && typeof redirectUrl === 'string') {
        window.location.href = redirectUrl;
        return;
      }

      const statusParam = result === 'success' ? 'success' : 'failed';
      if (!returnUrl) {
        router.push(`/payment?status=${statusParam}`);
        setSubmitting(false);
        return;
      }
      try {
        const url = new URL(returnUrl);
        url.searchParams.set('threeds', result);
        url.searchParams.set('status', statusParam);
        window.location.href = url.toString();
      } catch {
        router.push(`/payment?status=${statusParam}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  }, [returnUrl, result, transactionId, router]);

  const handleGoBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(returnUrl || '/payment');
    }
  }, [returnUrl, router]);

  return (
    <main className="min-h-screen w-full bg-muted/20 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-xl mx-auto">
        {/* Page title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            3-D Secure Authentication
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete your payment verification
          </p>
        </div>

        <Card className="shadow-lg border border-border overflow-hidden rounded-xl bg-card">
          {/* Card header with gradient */}
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-5 py-4 rounded-t-xl border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium opacity-90 uppercase tracking-wide">
                  Security Verification
                </p>
                <CardTitle className="text-lg font-semibold mt-0.5 text-primary-foreground">
                  Complete Authentication
                </CardTitle>
              </div>
              <Shield className="h-8 w-8 shrink-0 opacity-90" />
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-6">
            {/* Test Gateway Simulator */}
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Info className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">
                  Test Gateway Simulator
                </h3>
                <CardDescription className="text-sm">
                  This is a test environment for 3-D Secure authentication. Please
                  select the desired outcome to simulate the authentication process.
                </CardDescription>
              </div>
            </div>

            {/* 3-D Secure Result */}
            <div className="space-y-2">
              <Label htmlFor="threeds-result" className="text-sm font-medium">
                3-D Secure Result <span className="text-destructive">*</span>
              </Label>
              <Select value={result} onValueChange={(v) => setResult(v as ThreedsResult)}>
                <SelectTrigger id="threeds-result" size="lg" className="w-full">
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  {THREEDS_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex items-center gap-2">
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              opt.value === 'success' ? 'text-green-600' : 'text-destructive'
                            }`}
                          />
                          {opt.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="flex-1 gap-2"
                onClick={handleApprove}
                disabled={submitting || !transactionId}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {submitting ? 'Completing...' : 'Approve Authentication'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 gap-2"
                onClick={handleGoBack}
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </div>

            {/* What happens next? */}
            <div className="flex gap-3 pt-2 border-t border-border">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  What happens next?
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>
                    <strong className="text-foreground">Success:</strong> Payment will
                    be processed and completed
                  </li>
                  <li>
                    <strong className="text-foreground">Failed:</strong> Payment will
                    be declined and transaction will fail
                  </li>
                </ul>
              </div>
            </div>

            {/* Technical Details */}
            <div className="flex gap-3 pt-2 border-t border-border">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Code2 className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">
                  Technical Details
                </h3>
                <CardDescription className="text-sm">
                  This simulator sends the selected status via query string (
                  <code className="rounded bg-muted px-1 text-xs">threeds</code> and{' '}
                  <code className="rounded bg-muted px-1 text-xs">status</code>) to test
                  different 3-D Secure authentication scenarios.
                </CardDescription>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
