'use client';

import { type ReactNode } from 'react';

/**
 * Affiliate section layout.
 * Pass-through so (protected) layout wraps all affiliate routes.
 */
export default function AffiliateLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
