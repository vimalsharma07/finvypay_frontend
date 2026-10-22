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
      { key: 'sno', label: '#', sortable: false },
      { key: 'merchantProfile', label: 'Workspace Profile', sortable: false },
      { key: 'processingVolume', label: 'Expected Volume', sortable: false },
      { key: 'acceptedPaymentMethods', label: 'Payment Methods', sortable: false },
      { key: 'processingCurrency', label: 'Currencies', sortable: false },
      { key: 'requestStatus', label: 'Request Status', sortable: false },
    ],
    [],
  );

  const renderCell = (item: UserAcquirerRequest, key: keyof UserAcquirerRequest | string) => {
    switch (key) {
      case 'sno':
        return <div className="text-sm font-medium text-slate-500">{(item as any).sno ?? '-'}</div>;
      case 'merchantProfile':
        return (
          <div className="text-sm font-semibold text-foreground">
            {item.merchantProfile?.merchantProfileName || '-'}
          </div>
        );
      case 'processingVolume':
        return (
          <div className="text-sm font-medium">
            {item.processingVolume != null ? String(item.processingVolume) : '-'}
          </div>
        );
      case 'acceptedPaymentMethods':
        return (
          <div className="flex flex-wrap gap-1">
            {(item.acceptedPaymentMethods || []).map((m) => (
              <Badge
                key={m}
                className="rounded-lg border-sky-200 bg-sky-50 capitalize text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300"
              >
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
              <Badge
                key={c}
                variant="outline"
                className="rounded-lg border-sky-200 text-sky-700 dark:border-sky-800 dark:text-sky-300"
              >
                {c}
              </Badge>
            ))}
            {(!item.processingCurrency || item.processingCurrency.length === 0) && (
              <span className="text-sm text-muted-foreground">-</span>
            )}
          </div>
        );
      case 'requestStatus': {
        const status = String((item as any).requestStatus || 'pending').toLowerCase();
        const isPending = status === 'pending';
        return (
          <Badge
            variant={isPending ? 'secondary' : 'success'}
            className="rounded-lg capitalize"
          >
            {isPending ? 'In review' : status}
          </Badge>
        );
      }
      default: {
        const value = item[key as keyof UserAcquirerRequest];
        return <div className="font-normal text-foreground">{value != null ? String(value) : '-'}</div>;
      }
    }
  };

  if (!isClient) return <div suppressHydrationWarning />;

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Bank Requests"
            description="Track bank-partner applications and approval progress"
            icon={FileText}
          />
          <ToolbarActions>
            <Button asChild variant="primary" className="rounded-xl shadow-sm shadow-sky-500/20">
              <Link href="/acquirer-requests/create">
                <Plus className="me-1 h-4 w-4" />
                Request New Bank
              </Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <div className="relative mb-4 overflow-hidden rounded-2xl border border-sky-200/70 bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_50%,#e0f2fe_100%)] p-4 sm:p-5 dark:border-sky-900/50 dark:bg-[linear-gradient(135deg,#0c1a24_0%,#0f172a_55%,#082f49_100%)]">
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700/80 dark:text-sky-300/80">
                Application pipeline
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Submit new bank requests and follow status until they become live connections.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white/80 px-3 py-2 text-sm font-medium text-sky-700 shadow-sm dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
              <FileText className="size-4" />
              {requests.length} shown
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-sky-100 bg-card shadow-sm ring-1 ring-sky-500/5 dark:border-sky-900/40">
          <TableComp
            data={requests}
            headers={headers}
            renderCell={renderCell}
            enableCheckbox={false}
            searchPlaceholder="Search bank requests..."
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
        </div>
      </Container>
    </Fragment>
  );
}
