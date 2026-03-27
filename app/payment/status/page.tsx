import { Suspense } from 'react';
import { Metadata } from 'next';
import { Loader2 } from 'lucide-react';
import { PaymentStatusContent } from './payment-status-content';

export const metadata: Metadata = {
  title: 'Payment status',
};

function StatusFallback() {
  return (
    <main className="min-h-screen w-full bg-muted/20 flex items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Loading…</p>
      </div>
    </main>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<StatusFallback />}>
      <PaymentStatusContent />
    </Suspense>
  );
}
