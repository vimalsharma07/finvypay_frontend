'use client';

import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TableComp, TableHeader } from '../../components/table-comp';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getUserAcquirerRequests,
  UserAcquirerRequest,
  UserAcquirerRequestListResponse,
} from '@/lib/services/user/acquirer-requests';
import { useCursorPagination } from '@/lib/hooks/use-cursor-pagination';
import type { CursorPaginationMeta } from '@/lib/types/pagination';

export default function UserAcquirerRequestsPage() {
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<UserAcquirerRequest[]>([]);
  const [meta, setMeta] = useState<CursorPaginationMeta | null>(null);
  const [limit, setLimit] = useState(20);

  const { requestCursor, reset: resetCursor, goNext, goPrev, canGoPrev } =
    useCursorPagination();

  const isTableLoading = loading;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchRequests = useCallback(
    async (cursor: string | undefined, pageLimit: number) => {
      setLoading(true);
      try {
        const response = await getUserAcquirerRequests({
          ...(cursor ? { cursor } : {}),
          limit: pageLimit,
        });

        handleApiResponse<UserAcquirerRequestListResponse>(response, {
          onSuccess: (data) => {
            if (!data?.success) return;
            const list = Array.isArray(data.data) ? data.data : [];
            const normalized = list.map((item: UserAcquirerRequest, idx: number) => ({
              ...item,
              sno: idx + 1,
              requestStatus: item.status || 'pending',
            }));

            setRequests(normalized as UserAcquirerRequest[]);
            setMeta(data.meta ?? null);
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load acquirer requests');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchRequests(requestCursor, limit);
  }, [requestCursor, limit, fetchRequests]);

  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    resetCursor();
  };

  const handleCursorNext = useCallback(() => {
    if (meta?.nextCursor) goNext(meta.nextCursor);
  }, [meta?.nextCursor, goNext]);

  const handleCursorPrev = useCallback(() => {
    goPrev();
  }, [goPrev]);

  const headers: TableHeader<UserAcquirerRequest>[] = useMemo(
    () => [
      { key: 'sno', label: 'S.No', sortable: false },
      { key: 'merchantProfile', label: 'Merchant Profile', sortable: false },
      { key: 'processingVolume', label: 'Processing Volume', sortable: false },
      { key: 'acceptedPaymentMethods', label: 'Accepted Payment Methods', sortable: false },
      { key: 'processingCurrency', label: 'Processing Currency', sortable: false },
      { key: 'requestStatus', label: 'Status', sortable: false },
    ],
    [],
  );

  const renderCell = (item: UserAcquirerRequest, key: keyof UserAcquirerRequest | string) => {
    switch (key) {
      case 'sno':
        return <div className="text-sm">{(item as any).sno ?? '-'}</div>;
      case 'merchantProfile':
        return <div className="text-sm">{item.merchantProfile?.merchantProfileName || '-'}</div>;
      case 'processingVolume':
        return <div className="text-sm">{item.processingVolume != null ? String(item.processingVolume) : '-'}</div>;
      case 'acceptedPaymentMethods':
        return (
          <div className="flex flex-wrap gap-1">
            {(item.acceptedPaymentMethods || []).map((m) => (
              <Badge key={m} variant="secondary" className="capitalize">
                {m}
              </Badge>
            ))}
            {(!item.acceptedPaymentMethods || item.acceptedPaymentMethods.length === 0) && (
              <span className="text-sm text-muted-foreground">-</span>
            )}
          </div>
        );
      case 'processingCurrency':
        return (
          <div className="flex flex-wrap gap-1">
            {(item.processingCurrency || []).map((c) => (
              <Badge key={c} variant="outline">
                {c}
              </Badge>
            ))}
            {(!item.processingCurrency || item.processingCurrency.length === 0) && (
              <span className="text-sm text-muted-foreground">-</span>
            )}
          </div>
        );
      case 'requestStatus':
        return (
          <Badge variant={(item as any).requestStatus === 'pending' ? 'secondary' : 'success'}>
            {(item as any).requestStatus}
          </Badge>
        );
      default: {
        const value = item[key as keyof UserAcquirerRequest];
        return <div className="text-foreground font-normal">{value != null ? String(value) : '-'}</div>;
      }
    }
  };

  if (!isClient) return <div suppressHydrationWarning />;

  return (
    <Fragment>
      <Container>
        <Toolbar>
            <ToolbarHeading
              title="Acquirer Requests"
              description="View and manage your acquirer account requests with status tracking and approval workflow"
              icon={FileText}
            />
          <ToolbarActions>
            <Button asChild variant="primary">
              <Link href="/acquirer-requests/create">
                <Plus className="h-4 w-4 me-1" />
                Apply New Acquirer
              </Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <TableComp
          data={requests}
          headers={headers}
          renderCell={renderCell}
          enableCheckbox={false}
          searchPlaceholder="Search acquirer requests..."
          searchKeys={['merchantProfile', 'processingVolume', 'requestStatus']}
          getRowId={(row: UserAcquirerRequest) => String(row.id)}
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
          sorting={undefined}
          loading={isTableLoading}
        />
      </Container>
    </Fragment>
  );
}
