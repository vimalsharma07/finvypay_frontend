import { ReactNode } from 'react';
import Link from 'next/link';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Card, CardContent } from '@/components/ui/card';

export function BrandedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          .float-animation {
            animation: float 6s ease-in-out infinite;
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

        <div className="lg:rounded-2xl lg:border lg:border-border/50 lg:m-5 order-1 lg:order-2 relative overflow-hidden shadow-2xl bg-gradient-to-br from-teal-50/50 via-background to-teal-50/30 dark:from-teal-950/20 dark:via-background dark:to-teal-950/10">
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent dark:from-primary/30 dark:via-primary/20"></div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="flex flex-col p-8 lg:p-12 xl:p-16 relative z-10 min-h-full">
            <Link href="/" className="inline-flex items-center gap-2 group mb-8 lg:mb-12">
              <img
                src={toAbsoluteUrl('/media/app/mini-logo.svg')}
                className="h-8 max-w-none transition-transform group-hover:scale-105"
                alt=""
              />
            </Link>

            <div className="flex flex-col items-center justify-center flex-1 gap-8">
              {/* Welcome Illustration */}
              <div className="flex justify-center items-center w-full">
                <div className="float-animation w-full max-w-lg">
                  <img
                    src={toAbsoluteUrl('/media/svg/welcome.svg')}
                    alt="Welcome"
                    className="w-full h-auto mx-auto"
                    style={{ filter: 'drop-shadow(0 20px 40px rgba(20, 184, 166, 0.1))' }}
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="flex flex-col gap-4 text-center max-w-lg w-full">
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

              {/* Feature highlights */}
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                  <span>Fast</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                  <span>Reliable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
