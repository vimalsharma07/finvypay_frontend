'use client';

export const merchantRatesRoutes = {
  getByMerchant: (merchantId: string | number) =>
    `/admin/merchant-rates/merchant/${merchantId}`,
  upsert: '/admin/merchant-rates',
} as const;


