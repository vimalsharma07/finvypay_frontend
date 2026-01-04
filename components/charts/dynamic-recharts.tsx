'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';
import { ChartSkeleton } from '@/components/ui/skeletons';

// Dynamically import Recharts with no SSR
const RechartsPrimitive = dynamic(
  () => import('recharts').then((mod) => mod),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={300} />,
  }
);

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
export const Line = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Line })),
  { ssr: false }
);

export const Bar = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Bar })),
  { ssr: false }
);

export const Pie = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Pie })),
  { ssr: false }
);

export const Area = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Area })),
  { ssr: false }
);

export const XAxis = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.XAxis })),
  { ssr: false }
);

export const YAxis = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.YAxis })),
  { ssr: false }
);

export const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.CartesianGrid })),
  { ssr: false }
);

export const Tooltip = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Tooltip })),
  { ssr: false }
);

export const Legend = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Legend })),
  { ssr: false }
);

export const Cell = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Cell })),
  { ssr: false }
);

