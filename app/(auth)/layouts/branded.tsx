import { ReactNode } from 'react';
import Link from 'next/link';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Card, CardContent } from '@/components/ui/card';
import '@/css/auth-layout.css';

export function BrandedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen grow flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="auth-shell-bg absolute inset-0" />
      <div className="auth-hatch pointer-events-none absolute inset-0" />

      <div className="auth-fade-up relative z-10 w-full max-w-[420px]">
        <Link
          href="/"
          className="mb-8 flex items-center gap-3"
        >
          <img
            src={toAbsoluteUrl('/media/app/mini-logo.svg')}
            className="h-7 w-auto"
            alt=""
          />
          <span className="auth-wordmark">FinvyPay</span>
        </Link>

        <Card className="auth-form-card border shadow-none">
          <CardContent className="p-6 sm:p-8">{children}</CardContent>
        </Card>

        <p className="mt-6 text-center text-xs tracking-wide text-zinc-500 dark:text-slate-400">
          Secure merchant access
        </p>
      </div>
    </div>
  );
}
