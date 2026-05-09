'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '../components/layouts/main/layout';
import { useAuthLogoutListener } from '@/hooks/use-auth-logout-listener';
import { useRouteGuard } from '@/hooks/use-route-guard';
import { isAuthenticated } from '@/lib/auth-storage';

const redirectingUI = (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
      <p className="text-sm text-muted-foreground">Redirecting to sign in...</p>
    </div>
  </div>
);

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Listen for auth logout events and redirect to signin
  useAuthLogoutListener();

  // Protect routes based on user role
  useRouteGuard();

  // Only run redirect on client after mount (avoids "location is not defined" during SSR)
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated()) {
      router.replace('/signin');
    }
  }, [mounted, router]);

  // Before client mount, show loading (isAuthenticated() is false on server)
  if (!mounted) {
    return redirectingUI;
  }
  // After mount: if not authenticated, redirect runs in useEffect above — show loading until navigation
  if (!isAuthenticated()) {
    return redirectingUI;
  }

  return <MainLayout>{children}</MainLayout>;
}
