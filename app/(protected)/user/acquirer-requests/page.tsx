'use client';

import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  TableComp,
  TableHeader,
  TableAction,
} from '../../components/table-comp';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getUserAcquirerRequests,
  UserAcquirerRequest,
  UserAcquirerRequestListResponse,
  UserAcquirerRequestListMeta,
} from '@/lib/services/user/acquirer-requests';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

function RatesDialog({
  open,
  onOpenChange,
  rates,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rates: Record<string, string | number> | undefined | null;
  title?: string;
}) {
  const ratesEntries = rates ? Object.entries(rates) : [];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[520px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title || 'Rates'}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="grid grid-cols-2 gap-2 text-foreground mt-2">
              {ratesEntries.length > 0 ? (
                ratesEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-sm text-muted-foreground">
                  No rates available for this request.
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function UserAcquirerRequestsPage() {
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<UserAcquirerRequest[]>([]);
  const [meta, setMeta] = useState<UserAcquirerRequestListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [ratesDialogOpen, setRatesDialogOpen] = useState(false);
  const [selectedRates, setSelectedRates] = useState<Record<string, string | number> | null | undefined>(null);
  const [selectedName, setSelectedName] = useState<string>('Acquirer Request');

  const isTableLoading = loading;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchRequests = async (pageNum: number, pageLimit: number) => {
    setLoading(true);
    try {
      const params: any = { page: pageNum, limit: pageLimit };
      const response = await getUserAcquirerRequests(params);

      handleApiResponse<UserAcquirerRequestListResponse>(response, {
        onSuccess: (data) => {
          if (!data?.success) return;
          const list = Array.isArray(data.data) ? data.data : (data.data?.data ?? []);
          const metaData = data.meta ?? (data.data as any)?.meta ?? null;

          const normalized = list.map((item: any) => ({
            ...item,
            industryName: item.merchantProfile?.industry?.name,
            requestStatus: item.status || 'pending',
            rates: item.acquirerAccount?.rates,
          }));

          setRequests(normalized as UserAcquirerRequest[]);
          setMeta(metaData);
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
  };

  useEffect(() => {
    fetchRequests(page, limit);
  }, [page, limit]);

  const headers: TableHeader<UserAcquirerRequest>[] = useMemo(
    () => [
      { key: 'id', label: 'ID', sortable: false },
      { key: 'merchantProfile', label: 'Profile', sortable: false },
      { key: 'industryName', label: 'Industry', sortable: false },
      { key: 'acquirerAccount', label: 'Account', sortable: false },
      { key: 'acceptedPaymentMethods', label: 'Payment Methods', sortable: false },
      { key: 'processingCurrency', label: 'Currencies', sortable: false },
      { key: 'requestStatus', label: 'Status', sortable: false },
      { key: 'createdAt', label: 'Created', sortable: false },
    ],
    [],
  );

  const renderCell = (item: UserAcquirerRequest, key: keyof UserAcquirerRequest | string) => {
    switch (key) {
      case 'id':
        return <div className="text-sm font-mono">{item.id}</div>;
      case 'merchantProfile':
        return <div className="text-sm">{item.merchantProfile?.merchantProfileName || '-'}</div>;
      case 'industryName':
        return <div className="text-sm">{(item as any).industryName || '-'}</div>;
      case 'acquirerAccount':
        return <div className="text-sm">{item.acquirerAccount?.name || '-'}</div>;
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
      case 'createdAt':
        return <div className="text-sm">{item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</div>;
      default:
        const value = item[key as keyof UserAcquirerRequest];
        return <div className="text-foreground font-normal">{value != null ? String(value) : '-'}</div>;
    }
  };

  const actions: TableAction<UserAcquirerRequest>[] = [
    {
      label: 'View',
      route: (row: UserAcquirerRequest) => `/user/acquirer-requests/${row.id}`,
    },
    {
      label: 'View Rates',
      onClick: (row: UserAcquirerRequest) => {
        setSelectedRates(row.acquirerAccount?.rates);
        setSelectedName(row.acquirerAccount?.name || 'Acquirer Account');
        setRatesDialogOpen(true);
      },
      separator: true,
    },
  ];

  if (!isClient) return <div suppressHydrationWarning />;

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Acquirer Requests"
            description="View acquirer requests and details"
          />
          <ToolbarActions>
            <Button asChild variant="primary">
              <Link href="/user/acquirer-requests/create">Apply New Acquirer</Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <TableComp
          data={requests}
          headers={headers}
          renderCell={renderCell}
          actions={actions}
          enableCheckbox={false}
          searchPlaceholder="Search acquirer requests..."
          searchKeys={['id', 'merchantProfile']}
          getRowId={(row: UserAcquirerRequest) => String(row.id)}
          pagination={{
            pageSize: limit,
            pageIndex: page - 1,
            totalCount: meta?.total ?? meta?.totalItems ?? 0,
            onPageChange: (pageIndex) => setPage(pageIndex + 1),
            onPageSizeChange: (newSize) => {
              setLimit(newSize);
              setPage(1);
            },
          }}
          sorting={undefined}
          loading={isTableLoading}
        />
      </Container>

      <RatesDialog
        open={ratesDialogOpen}
        onOpenChange={setRatesDialogOpen}
        rates={selectedRates}
        title={`Rates — ${selectedName}`}
      />
    </Fragment>
  );
}


