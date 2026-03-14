import { type ReactNode } from 'react';

/**
 * Affiliate reports layout. Pass-through so (protected) layout wraps all report routes.
 */
export default function AffiliateReportsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
