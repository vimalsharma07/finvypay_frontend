'use client';

import { Skeleton } from '../skeleton';
import { Card, CardContent, CardHeader } from '../card';

/**
 * Skeleton component for table loading states
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      {/* Table header */}
      <div className="flex gap-4 border-b pb-2">
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Table rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-3">
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Table skeleton with card wrapper
 */
export function TableCardSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <TableSkeleton rows={rows} columns={columns} />
      </CardContent>
    </Card>
  );
}



