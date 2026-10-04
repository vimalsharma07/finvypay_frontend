import { ReactNode } from 'react';
import Link from 'next/link';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Card, CardContent } from '@/components/ui/card';
import '@/css/auth-layout.css';

export function ClassicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex grow flex-col items-center justify-center overflow-hidden">
      <div className="auth-shell-bg absolute inset-0" />
      <div className="auth-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative z-10 m-5">
        <Link href="/" className="inline-flex items-center gap-2">
          <img
            src={toAbsoluteUrl('/media/app/mini-logo.svg')}
            className="h-[35px] max-w-none"
            alt="FinvyPay"
          />
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            FinvyPay
          </span>
        </Link>
      </div>
      <Card className="auth-form-card relative z-10 w-full max-w-[400px] rounded-2xl border-0 shadow-none">
        <CardContent className="p-6">{children}</CardContent>
      </Card>
    </div>
  );
}
