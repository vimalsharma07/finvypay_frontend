'use client';

import { toAbsoluteUrl } from '@/lib/helpers';

export function ScreenLoader() {
  return (
    <div className="flex flex-col items-center gap-2 justify-center fixed inset-0 z-50 transition-opacity duration-700 ease-in-out">
      <img
        className="h-9 w-auto dark:hidden"
        src={toAbsoluteUrl('/media/app/lancpay.png')}
        alt="LancPay"
      />
      <img
        className="hidden h-9 w-auto dark:block"
        src={toAbsoluteUrl('/media/app/lancpay-dark.png')}
        alt="LancPay"
      />
      <div className="text-muted-foreground font-medium text-sm">
        Loading...
      </div>
    </div>
  );
}
