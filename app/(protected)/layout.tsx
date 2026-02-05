'use client';

import { useRouter } from 'next/navigation';
import { MainLayout } from '../components/layouts/main/layout';
import { useAuthLogoutListener } from '@/hooks/use-auth-logout-listener';
import { useRouteGuard } from '@/hooks/use-route-guard';
import { isAuthenticated } from '@/lib/auth-storage';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Listen for auth logout events and redirect to signin
  useAuthLogoutListener();

  // Protect routes based on user role
  useRouteGuard();

  // Block rendering until auth is verified - prevents flash of protected content (e.g. dashboard)
  // This layout only wraps protected routes (/dashboard, /onboarding, etc.)
  if (!isAuthenticated()) {
    router.replace('/signin');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return <MainLayout>{children}</MainLayout>;
}
