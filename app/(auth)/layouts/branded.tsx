import { ReactNode } from 'react';
import Link from 'next/link';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Card, CardContent } from '@/components/ui/card';

export function BrandedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>
        {`
          .branded-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/1.png')}');
          }
          .dark .branded-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/1-dark.png')}');
          }
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .gradient-bg {
            background: linear-gradient(-45deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 25%, hsl(var(--primary) / 0.6) 50%, hsl(var(--primary) / 0.8) 75%, hsl(var(--primary)) 100%);
            background-size: 400% 400%;
            animation: gradient-shift 15s ease infinite;
          }
        `}
      </style>
      <div className="min-h-screen grid lg:grid-cols-2 grow bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex justify-center items-center p-6 sm:p-8 lg:p-12 xl:p-16 order-2 lg:order-1 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
          </div>
          
          <Card className="w-full max-w-[440px] relative z-10 border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
            <CardContent className="p-8 sm:p-10">{children}</CardContent>
          </Card>
        </div>

        <div className="lg:rounded-2xl lg:border lg:border-border/50 lg:m-5 order-1 lg:order-2 bg-top xxl:bg-center xl:bg-cover bg-no-repeat branded-bg relative overflow-hidden shadow-2xl">
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent dark:from-primary/30 dark:via-primary/20"></div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="flex flex-col p-8 lg:p-12 xl:p-16 gap-6 relative z-10 min-h-full justify-between">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <img
                src={toAbsoluteUrl('/media/app/mini-logo.svg')}
                className="h-8 max-w-none transition-transform group-hover:scale-105"
                alt=""
              />
            </Link>

            <div className="flex flex-col gap-4 max-w-md">
              <h3 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                Secure Dashboard Access
              </h3>
              <div className="text-base lg:text-lg font-medium text-foreground/80 leading-relaxed">
                A robust authentication gateway ensuring
                <br className="hidden sm:block" /> secure&nbsp;
                <span className="font-semibold text-foreground">
                  efficient user access
                </span>
                &nbsp;to your dashboard interface.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
