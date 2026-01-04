'use client';

import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { ChartSkeleton } from '@/components/ui/skeletons';

// Dynamically import ApexCharts with no SSR
const ApexCharts = dynamic(
  () => import('react-apexcharts'),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={200} />,
  }
);

export interface DynamicApexChartProps {
  options: ApexOptions;
  series: ApexOptions['series'];
  type: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'treemap' | 'boxPlot' | 'candlestick' | 'radar' | 'polarArea' | 'rangeBar' | 'rangeArea';
  height?: number | string;
  width?: number | string;
  className?: string;
  id?: string;
}

/**
 * Dynamic ApexChart component with loading state
 * Automatically handles code splitting and SSR
 */
export function DynamicApexChart({
  options,
  series,
  type,
  height = 200,
  width = '100%',
  className,
  id,
}: DynamicApexChartProps) {
  return (
    <ApexCharts
      options={options}
      series={series || options.series}
      type={type}
      height={height}
      width={width}
      className={className}
      id={id}
    />
  );
}

