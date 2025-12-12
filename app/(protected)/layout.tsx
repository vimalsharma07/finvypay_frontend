'use client';

import { Demo1Layout } from '../components/layouts/demo1/layout';
import { useAuthLogoutListener } from '@/hooks/use-auth-logout-listener';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Listen for auth logout events and redirect to signin
  useAuthLogoutListener();

  // Static theme - no authentication required
  return <Demo1Layout>{children}</Demo1Layout>;
}
