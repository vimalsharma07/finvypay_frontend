'use client';

import { ReactNode } from 'react';

export function ModulesProvider({ children }: { children: ReactNode }) {
  // Store-client components removed - provider is now a no-op
  return <>{children}</>;
}
