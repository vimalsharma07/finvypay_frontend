'use client';

import { Skeleton } from '../skeleton';
import { Card, CardContent, CardHeader } from '../card';

/**
 * Skeleton component for chart loading states
 */
export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div className="flex flex-col gap-4 h-full">
        {/* Chart area */}
        <div className="flex-1 relative">
          <Skeleton className="w-full h-full rounded-md" />
          {/* Simulated chart lines */}
          <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
            {[...Array(12)].map((_, i) => (
              <Skeleton
                key={i}
                className="w-1 rounded-t"
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Chart skeleton with card wrapper
 */
export function ChartCardSkeleton({ height = 250 }: { height?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <ChartSkeleton height={height} />
      </CardContent>
    </Card>
  );
}

