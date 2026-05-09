'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import { Container } from '@/components/common/container';
import { getCurrencies, CurrencyListResponse, Currency } from '@/lib/services/admin/currency';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  TableComp,
  TableHeader,
} from '@/app/(protected)/components/table-comp';
import { Badge } from '@/components/ui/badge';
import { useCursorPagination } from '@/lib/hooks/use-cursor-pagination';
import type { CursorPaginationMeta } from '@/lib/types/pagination';

export function CurrencyPageContent() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<CursorPaginationMeta | null>(null);
  const { requestCursor, reset: resetCursor, goNext, goPrev, canGoPrev } =
    useCursorPagination();
  const [limit, setLimit] = useState(20);
  
  // Sorting state
  const [sortBy, setSortBy] = useState<string>('code');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  const fetchCurrencies = useCallback(
    async (
      cursor: string | undefined,
      pageLimit: number,
      sortField: string,
      sortDir: 'ASC' | 'DESC',
    ) => {
      setLoading(true);
      try {
        const params = {
          ...(cursor ? { cursor } : {}),
          limit: pageLimit,
          sortBy: sortField,
          sortOrder: sortDir,
        };

        const response = await getCurrencies(params);

        handleApiResponse<CurrencyListResponse>(response, {
          onSuccess: (data) => {
            if (data.success && Array.isArray(data.data)) {
              setCurrencies(data.data);
              setMeta(data.meta ?? null);
            } else {
              console.warn('⚠️ API returned success=false:', data);
            }
          },
          onValidationError: (errors, messages) => {
            console.error('Validation errors:', errors);
          },
          onUnauthorized: () => {
            console.log('Please check your TOKEN in .env file');
          },
        });
      } catch (error) {
        console.error('❌ Network/Request error:', error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchCurrencies(requestCursor, limit, sortBy, sortOrder);
  }, [fetchCurrencies, requestCursor, limit, sortBy, sortOrder]);

  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    resetCursor();
  };

  const handleSortChange = (newSortBy: string, newSortOrder: 'ASC' | 'DESC') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    resetCursor();
  };

  const handleCursorNext = useCallback(() => {
    if (meta?.nextCursor) goNext(meta.nextCursor);
  }, [meta?.nextCursor, goNext]);

  const handleCursorPrev = useCallback(() => {
    goPrev();
  }, [goPrev]);

  // Define table headers
  const headers: TableHeader<Currency>[] = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'value', label: 'Value', sortable: true },
    { key: 'isDeleted', label: 'Status', sortable: true },
    { key: 'createdAt', label: 'Created At', sortable: true },
    { key: 'updatedAt', label: 'Updated At', sortable: true },
  ];

  // Render cell function - handles all cell rendering dynamically
  const renderCell = (item: Currency, key: keyof Currency | string) => {
    switch (key) {
      case 'code':
        return (
          <div className="font-medium">
            <Badge variant="secondary" className="font-mono">
              {item.code}
            </Badge>
          </div>
        );
      case 'value':
        return (
          <div className="text-foreground font-normal">
            {parseFloat(item.value).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 10,
            })}
          </div>
        );
      case 'isDeleted':
        return (
          <Badge
            variant={item.isDeleted ? 'destructive' : 'success'}
            className="capitalize"
          >
            {item.isDeleted ? 'Deleted' : 'Active'}
          </Badge>
        );
      case 'createdAt':
        const createdDate = new Date(item.createdAt);
        return (
          <div className="text-sm text-muted-foreground">
            {createdDate.toLocaleDateString()} {createdDate.toLocaleTimeString()}
          </div>
        );
      case 'updatedAt':
        const updatedDate = new Date(item.updatedAt);
        return (
          <div className="text-sm text-muted-foreground">
            {updatedDate.toLocaleDateString()} {updatedDate.toLocaleTimeString()}
          </div>
        );
      default:
        const value = item[key as keyof Currency];
        return (
          <div className="text-foreground font-normal">
            {value != null ? String(value) : '-'}
          </div>
        );
    }
  };

  return (
    <Fragment>
      <Container>
        <TableComp
          data={currencies}
          headers={headers}
          renderCell={renderCell}
          enableCheckbox={false}
          searchPlaceholder="Search currencies..."
          searchKeys={['code', 'value']}
          getRowId={(row: Currency) => row.id}
          pagination={{
            pageSize: limit,
            onPageSizeChange: handlePageSizeChange,
          }}
          cursorPagination={{
            meta,
            onNext: handleCursorNext,
            onPrev: handleCursorPrev,
            canGoPrev,
          }}
          sorting={{
            sortBy: sortBy,
            sortOrder: sortOrder,
            onSortChange: handleSortChange,
          }}
          loading={loading}
        />
      </Container>
    </Fragment>
  );
}

