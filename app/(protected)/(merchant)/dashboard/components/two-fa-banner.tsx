'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface TwoFaBannerProps {
  show?: boolean;
}

export function TwoFaBanner({ show = true }: TwoFaBannerProps) {
  if (!show) {
    return null;
  }

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
      <CardContent className="relative z-10 p-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-6 flex-1">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/20">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Enhance Your Account Security
              </h3>
              <p className="text-sm text-muted-foreground">
                Enable two-factor authentication to add an extra layer of protection to your account.
                Keep your account secure and protect your sensitive information from unauthorized access.
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="primary"
              size="lg"
              className="gap-2"
              asChild
            >
              <Link href="/profile">
                <ShieldCheck className="h-4 w-4" />
                Enable 2FA
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

