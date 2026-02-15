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
    <div className="sidebar-header hidden lg:flex items-center justify-center relative shrink-0 min-h-0 overflow-hidden py-5 px-5 lg:px-4">
      <Link href="/" className="flex items-center justify-center min-w-0 shrink flex-1">
        <div className="dark:hidden flex items-center justify-center">
          <img
            src={toAbsoluteUrl('/media/app/finvypay.png')}
            className="default-logo max-h-[30px] h-auto w-auto object-contain object-center"
            alt="Default Logo"
          />
          <img
            src={toAbsoluteUrl('/media/app/mini-logo.svg')}
            className="small-logo max-h-[30px] h-auto w-auto object-contain object-center"
            alt="Mini Logo"
          />
        </div>
        <div className="hidden dark:flex items-center justify-center">
          <img
            src={toAbsoluteUrl('/media/app/finvypay.png')}
            className="default-logo max-h-[30px] h-auto w-auto object-contain object-center"
            alt="Default Dark Logo"
          />
          <img
            src={toAbsoluteUrl('/media/app/mini-logo.svg')}
            className="small-logo max-h-[30px] h-auto w-auto object-contain object-center"
            alt="Mini Logo"
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
