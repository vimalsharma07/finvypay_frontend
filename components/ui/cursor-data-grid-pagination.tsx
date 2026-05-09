'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useDataGrid } from '@/components/ui/data-grid';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CursorPaginationMeta } from '@/lib/types/pagination';
import { DEFAULT_LIST_PAGE_SIZE, LIST_PAGE_SIZE_OPTIONS } from '@/lib/types/pagination';

export interface CursorDataGridPaginationProps {
  meta: CursorPaginationMeta | null;
  onNext: () => void;
  onPrev: () => void;
  canGoPrev: boolean;
  /** Current page row count; used only if meta.totalCount is missing (legacy) */
  rowCount: number;
  sizes?: number[];
  sizesLabel?: string;
  sizesDescription?: string;
  sizesSkeleton?: ReactNode;
  infoSkeleton?: ReactNode;
  className?: string;
}

/**
 * Footer for server-driven cursor pages: page size + prev/next (no page numbers).
 */
function CursorDataGridPagination({
  meta,
  onNext,
  onPrev,
  canGoPrev,
  rowCount,
  sizes = [...LIST_PAGE_SIZE_OPTIONS],
  sizesLabel = 'Show',
  sizesDescription = 'per page',
  sizesSkeleton = <Skeleton className="h-8 w-44" />,
  infoSkeleton = <Skeleton className="h-8 w-60" />,
  className,
}: CursorDataGridPaginationProps) {
  const { table, isLoading } = useDataGrid();
  const pageSize = table.getState().pagination.pageSize;
  const baseSizes = sizes.length ? sizes : [...LIST_PAGE_SIZE_OPTIONS];
  const sizesForSelect = baseSizes.includes(pageSize)
    ? baseSizes
    : [...baseSizes, pageSize].sort((a, b) => a - b);
  const navBtnClass =
    'h-8 px-2 gap-1 text-sm font-normal text-muted-foreground hover:text-foreground';

  const total =
    meta != null && typeof meta.totalCount === 'number'
      ? meta.totalCount
      : rowCount;
  const info = `Total: ${total.toLocaleString()} record${total === 1 ? '' : 's'}`;

  const canNext = meta?.hasNextPage === true;

  return (
    <div
      data-slot="cursor-data-grid-pagination"
      className={cn(
        'flex flex-wrap flex-col sm:flex-row justify-between items-center gap-2.5 py-2.5 sm:py-0 grow',
        className,
      )}
    >
      <div className="flex flex-wrap items-center space-x-2.5 pb-2.5 sm:pb-0 order-2 sm:order-1">
        {isLoading ? (
          sizesSkeleton
        ) : (
          <>
            <div className="text-sm text-muted-foreground">{sizesLabel}</div>
            <Select
              value={`${pageSize}`}
              indicatorPosition="right"
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="w-fit" size="sm">
                <SelectValue placeholder={`${DEFAULT_LIST_PAGE_SIZE}`} />
              </SelectTrigger>
              <SelectContent side="top" className="min-w-[50px]">
                {sizesForSelect.map((size: number) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{sizesDescription}</span>
          </>
        )}
      </div>
      <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-center gap-2.5 pt-2.5 sm:pt-0 order-1 sm:order-2">
        {isLoading ? (
          infoSkeleton
        ) : (
          <>
            <div className="text-sm text-muted-foreground text-nowrap order-2 sm:order-1">
              {info}
            </div>
            <div className="flex items-center gap-1 order-1 sm:order-2">
              <Button
                size="sm"
                variant="ghost"
                className={navBtnClass}
                onClick={onPrev}
                disabled={!canGoPrev}
              >
                <ChevronLeftIcon className="size-4 shrink-0" />
                Previous
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className={navBtnClass}
                onClick={onNext}
                disabled={!canNext}
              >
                Next
                <ChevronRightIcon className="size-4 shrink-0" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export { CursorDataGridPagination };
