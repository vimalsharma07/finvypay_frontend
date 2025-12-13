'use client';

import { Demo1Layout } from '../components/layouts/demo1/layout';
import { useAuthLogoutListener } from '@/hooks/use-auth-logout-listener';
import { useRouteGuard } from '@/hooks/use-route-guard';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Listen for auth logout events and redirect to signin
  useAuthLogoutListener();

  // Protect routes based on user role
  useRouteGuard();

  return <Demo1Layout>{children}</Demo1Layout>;
}
