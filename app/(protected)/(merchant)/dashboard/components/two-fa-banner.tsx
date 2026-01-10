'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface TwoFaBannerProps {
  show?: boolean;
}

export function TwoFaBanner({ show = true }: TwoFaBannerProps) {
  if (!show) {
    return null;
  }

  return (
    <Card className="border-warning/30 bg-gradient-to-r from-warning/10 via-warning/5 to-warning/10 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="flex-shrink-0 mt-0.5">
              <div className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
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
                <ShieldCheck className="h-4 w-4 me-2" />
                Enable 2FA
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

