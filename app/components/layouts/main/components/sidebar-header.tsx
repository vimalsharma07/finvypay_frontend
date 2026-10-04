'use client';

import Link from 'next/link';
import { ChevronFirst } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useSettings } from '@/providers/settings-provider';
import { Button } from '@/components/ui/button';

export function SidebarHeader() {
  const { settings, storeOption } = useSettings();

  const handleToggleClick = () => {
    storeOption(
      'layouts.main.sidebarCollapse',
      !settings.layouts.main.sidebarCollapse,
    );
  };

  return (
    <div className="sidebar-header hidden lg:flex items-center relative shrink-0 min-h-0 overflow-hidden py-4 px-4 lg:px-3.5 border-b border-sky-100/80 dark:border-sky-900/40">
      <Link
        href="/"
        className="flex items-center gap-2.5 min-w-0 shrink flex-1 px-1"
      >
        <div className="dark:hidden flex items-center gap-2.5 min-w-0">
          <img
            src={toAbsoluteUrl('/media/app/finvypay.png')}
            className="default-logo max-h-[28px] h-auto w-auto object-contain object-left"
            alt="FinvyPay"
          />
          <img
            src={toAbsoluteUrl('/media/app/mini-logo.svg')}
            className="small-logo max-h-[28px] h-auto w-auto object-contain"
            alt="FinvyPay"
          />
        </div>
        <div className="hidden dark:flex items-center gap-2.5 min-w-0">
          <img
            src={toAbsoluteUrl('/media/app/finvypay.png')}
            className="default-logo max-h-[28px] h-auto w-auto object-contain object-left"
            alt="FinvyPay"
          />
          <img
            src={toAbsoluteUrl('/media/app/mini-logo.svg')}
            className="small-logo max-h-[28px] h-auto w-auto object-contain"
            alt="FinvyPay"
          />
        </div>
      </Link>
      <Button
        onClick={handleToggleClick}
        size="sm"
        mode="icon"
        variant="outline"
        className={cn(
          'size-7 absolute start-full top-2/4 rtl:translate-x-2/4 -translate-x-2/4 -translate-y-2/4',
          'border-sky-200 bg-background shadow-sm hover:bg-sky-50 hover:border-sky-300 dark:border-sky-800 dark:hover:bg-sky-950/40',
          settings.layouts.main.sidebarCollapse
            ? 'ltr:rotate-180'
            : 'rtl:rotate-180',
        )}
      >
        <ChevronFirst className="size-4!" />
      </Button>
    </div>
  );
}
