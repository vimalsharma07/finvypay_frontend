'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';
import { ChartSkeleton } from '@/components/ui/skeletons';

// Re-export commonly used Recharts components as dynamic
export const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={300} />,
  }
);

export const LineChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.LineChart })),
  { ssr: false }
);

export const BarChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.BarChart })),
  { ssr: false }
);

export const PieChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.PieChart })),
  { ssr: false }
);

export const AreaChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.AreaChart })),
  { ssr: false }
);

export const ComposedChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ComposedChart })),
  { ssr: false }
);

// Export all other components dynamically
// Note: These are dynamically imported for code splitting, but TypeScript has issues with Recharts component types
// Using type assertions to work around type incompatibilities
export const Line = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Line as any })),
  { ssr: false }
) as any;

export const Bar = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Bar as any })),
  { ssr: false }
) as any;

export const Pie = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Pie as any })),
  { ssr: false }
) as any;

export const Area = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Area as any })),
  { ssr: false }
) as any;

export const XAxis = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.XAxis as any })),
  { ssr: false }
) as any;

export const YAxis = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.YAxis as any })),
  { ssr: false }
) as any;

export const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.CartesianGrid as any })),
  { ssr: false }
) as any;

export const Tooltip = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Tooltip as any })),
  { ssr: false }
) as any;

export const Legend = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Legend as any })),
  { ssr: false }
) as any;

export const Cell = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Cell as any })),
  { ssr: false }
) as any;

