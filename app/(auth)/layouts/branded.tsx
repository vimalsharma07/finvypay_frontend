import { ReactNode } from 'react';
import Link from 'next/link';
import { Manrope } from 'next/font/google';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Card, CardContent } from '@/components/ui/card';
import '@/css/auth-layout.css';

const brandFont = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-auth-brand',
});

const highlights = [
  { label: 'PCI-ready security' },
  { label: 'Real-time settlements' },
  { label: 'Global card acceptance' },
];

export function BrandedLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${brandFont.variable} relative grid min-h-screen grow overflow-hidden lg:grid-cols-2`}>
      <div className="auth-shell-bg absolute inset-0" />
      <div className="auth-grid pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative z-10 order-2 flex items-center justify-center p-5 sm:p-8 lg:order-1 lg:p-12 xl:p-16">
        <Card className="auth-form-card auth-fade-up relative z-10 w-full max-w-[440px] rounded-2xl border-0 shadow-none">
          <CardContent className="p-7 sm:p-9">{children}</CardContent>
        </Card>
      </div>

      <div className="auth-brand-panel relative order-1 overflow-hidden shadow-xl shadow-sky-500/10 lg:order-2 lg:m-4 lg:rounded-3xl">
        <div className="auth-brand-orb auth-glow absolute -top-24 -right-16 size-[28rem] rounded-full blur-2xl" />
        <div
          className="auth-brand-orb auth-glow absolute -bottom-28 -left-20 size-[32rem] rounded-full blur-2xl"
          style={{ animationDelay: '2s' }}
        />
        <div className="auth-grid absolute inset-0 opacity-40" />

        <div className="relative z-10 flex min-h-full flex-col p-8 lg:p-12 xl:p-14">
          <Link
            href="/"
            className="auth-fade-up group inline-flex w-fit items-center gap-3"
          >
            <img
              src={toAbsoluteUrl('/media/app/mini-logo.svg')}
              className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
              alt="FinvyPay"
            />
            <span
              className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl"
              style={{ fontFamily: 'var(--font-auth-brand), ui-sans-serif, system-ui' }}
            >
              FinvyPay
            </span>
          </Link>

          <div className="flex flex-1 flex-col items-center justify-center gap-8 py-8">
            <div className="auth-float auth-fade-up-delay w-full max-w-md">
              <img
                src={toAbsoluteUrl('/media/svg/welcome.svg')}
                alt=""
                className="mx-auto h-auto w-full drop-shadow-[0_24px_40px_rgba(56,189,248,0.22)]"
              />
            </div>

            <div className="auth-fade-up-delay-2 max-w-md space-y-3 text-center">
              <h2
                className="text-3xl font-extrabold leading-[1.15] tracking-tight text-foreground lg:text-4xl xl:text-[2.75rem]"
                style={{ fontFamily: 'var(--font-auth-brand), ui-sans-serif, system-ui' }}
              >
                Payments that feel effortless
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground lg:text-lg">
                Sign in to manage transactions, settle faster, and keep every
                payment flow under your control.
              </p>
            </div>

            <ul className="auth-fade-up-delay-2 flex flex-wrap justify-center gap-x-5 gap-y-2">
              {highlights.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-2 text-sm text-foreground/75"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
