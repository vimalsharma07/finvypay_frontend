/**
 * Reusable Error Page Component
 * 
 * Displays error pages (404, 403, 500, etc.) with consistent styling
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, AlertCircle, Lock, FileQuestion } from 'lucide-react';

export interface ErrorPageProps {
  statusCode: number;
  title: string;
  message: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  homeButtonText?: string;
  backButtonText?: string;
  homeButtonHref?: string;
}

const errorIcons: Record<number, typeof AlertCircle> = {
  403: Lock,
  404: FileQuestion,
  500: AlertCircle,
};

const errorColors: Record<number, string> = {
  403: 'text-orange-500',
  404: 'text-blue-500',
  500: 'text-red-500',
};

export function ErrorPage({
  statusCode,
  title,
  message,
  showHomeButton = true,
  showBackButton = true,
  homeButtonText = 'Go Home',
  backButtonText = 'Go Back',
  homeButtonHref = '/',
}: ErrorPageProps) {
  const Icon = errorIcons[statusCode] || AlertCircle;
  const iconColor = errorColors[statusCode] || 'text-muted-foreground';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Status Code */}
        <div className="space-y-4">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted ${iconColor}`}>
            <Icon className="h-12 w-12" />
          </div>
          <div>
            <h1 className="text-6xl font-bold tracking-tight">{statusCode}</h1>
            <h2 className="text-2xl font-semibold mt-2">{title}</h2>
          </div>
        </div>

        {/* Message */}
        <p className="text-muted-foreground text-lg">{message}</p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 pt-4">
          {showBackButton && (
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {backButtonText}
            </Button>
          )}
          {showHomeButton && (
            <Link href={homeButtonHref}>
              <Button className="gap-2">
                <Home className="h-4 w-4" />
                {homeButtonText}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

