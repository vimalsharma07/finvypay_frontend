'use client';

import { useState, useEffect } from 'react';
import { SidebarMenu } from './sidebar-menu';

/**
 * Client-only wrapper for SidebarMenu to prevent hydration mismatches
 * Radix UI Accordion generates random IDs that differ between server and client
 */
export function SidebarMenuClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="kt-scrollable-y-hover flex grow shrink-0 py-5 px-5 lg:max-h-[calc(100vh-5.5rem)]">
        <div className="w-full space-y-3">
          {/* Placeholder to maintain layout during SSR */}
          <div className="h-8" />
        </div>
      </div>
    );
  }

  return <SidebarMenu />;
}

