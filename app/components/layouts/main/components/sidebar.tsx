'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSettings } from '@/providers/settings-provider';
import { SidebarHeader } from './sidebar-header';
import { SidebarMenuClient } from './sidebar-menu-client';

export function Sidebar() {
  const { settings } = useSettings();
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'sidebar relative lg:border-e lg:border-sky-200/70 lg:fixed lg:top-0 lg:bottom-0 lg:z-20 lg:flex flex-col items-stretch shrink-0',
        'bg-[linear-gradient(180deg,#f8fcff_0%,#ffffff_42%,#f5fbff_100%)]',
        (settings.layouts.main.sidebarTheme === 'dark' ||
          pathname.includes('dark-sidebar')) &&
          'dark bg-[linear-gradient(180deg,#0b1520_0%,#0f172a_45%,#0c1a24_100%)] lg:border-sky-900/50',
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.16),transparent_70%)]" />
      <SidebarHeader />
      <div className="relative overflow-hidden flex-1 min-h-0">
        <div className="w-(--sidebar-default-width) h-full">
          <SidebarMenuClient />
        </div>
      </div>
    </div>
  );
}
