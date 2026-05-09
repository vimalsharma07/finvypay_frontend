import { ReactNode } from 'react';
import Link from 'next/link';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Card, CardContent } from '@/components/ui/card';
import '@/css/auth-layout.css';

export function BrandedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 grow relative overflow-hidden">
        {/* Full-screen teal background design */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-muted/20">
          {/* Background gradient stripes - full width */}
          <div className="absolute inset-0 gradient-stripes"></div>
          {/* Gradient stripe overlay - full width */}
          <div className="absolute inset-0 gradient-stripe-overlay opacity-40"></div>
          
          {/* Full-width background design for entire screen */}
          <div className="absolute inset-0 form-container-bg pointer-events-none">
            {/* Maze pattern - full screen with gradient fade */}
            <div className="absolute inset-0 maze-pattern opacity-40"></div>
            <div className="absolute inset-0 maze-overlay opacity-30"></div>
            
            {/* Decorative background elements with rounded waves - full width */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Rounded gradient orbs - positioned across full screen */}
              <div className="absolute -top-40 right-1/4 w-80 h-80 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-full blur-3xl form-container-glow"></div>
              <div className="absolute -bottom-40 left-1/4 w-80 h-80 bg-gradient-to-br from-primary/10 via-primary/20 to-primary/5 rounded-full blur-3xl form-container-glow" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/8 via-primary/15 to-primary/8 rounded-full blur-3xl form-container-glow" style={{ animationDelay: '2s' }}></div>
              
              {/* Additional orbs for full screen coverage */}
              <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-primary/15 via-primary/8 to-primary/5 rounded-full blur-3xl form-container-glow" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-primary/12 via-primary/6 to-primary/10 rounded-full blur-3xl form-container-glow" style={{ animationDelay: '1.5s' }}></div>
              
              {/* Dot pattern overlay - full screen */}
              <div className="absolute inset-0 form-container-pattern opacity-30"></div>
              
              {/* Wave patterns - full width */}
              <div className="wave-pattern top-0 left-0 opacity-50"></div>
              <div className="wave-pattern-2 bottom-0 right-0 opacity-40"></div>
              
              {/* Gradient stripes - full screen */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/10 via-primary/5 to-transparent"></div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center items-center p-6 sm:p-8 lg:p-12 xl:p-16 order-2 lg:order-1 relative z-10">
          <Card className="w-full max-w-[440px] relative z-10 border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
            <CardContent className="p-8 sm:p-10">{children}</CardContent>
          </Card>
        </div>

        <div className="lg:rounded-2xl lg:border lg:border-border/50 lg:m-5 order-1 lg:order-2 relative overflow-hidden shadow-2xl bg-gradient-to-br from-primary/10 via-background via-primary/8 to-primary/10 dark:from-primary/15 dark:via-background dark:to-primary/15">
          {/* Multi-layer gradient overlay with stripes */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-primary/10 to-primary/5 dark:from-primary/30 dark:via-primary/15 dark:to-primary/8"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-primary/8 to-primary/20 dark:via-primary/10 dark:to-primary/25"></div>
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 via-transparent to-primary/15 dark:from-primary/15 dark:to-primary/20"></div>
          
          {/* Rounded wave decorative elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-primary/25 via-primary/15 to-primary/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/15 via-primary/10 to-primary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.08), hsl(var(--primary) / 0.03), transparent)'
            }}
          ></div>
          
          {/* Animated wave stripes */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="wave-pattern top-0 left-0 opacity-40 rounded-2xl"></div>
            <div className="wave-pattern-2 bottom-0 right-0 opacity-35 rounded-2xl"></div>
          </div>
          
          {/* Gradient stripes overlay */}
          <div className="absolute inset-0 gradient-stripe-overlay opacity-50 rounded-2xl"></div>
          
          <div className="flex flex-col p-8 lg:p-12 xl:p-16 relative z-10 min-h-full">
            <Link href="/" className="inline-flex items-center gap-1 group mb-8 lg:mb-12">
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
                <div className="flex items-center gap-1 text-sm text-foreground/70">
                  <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-foreground/70">
                  <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                  <span>Fast</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-foreground/70">
                  <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                  <span>Reliable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
