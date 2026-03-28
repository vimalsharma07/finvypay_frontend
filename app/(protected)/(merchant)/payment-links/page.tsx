'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link2, Pencil, Trash2, Plus } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Button } from '@/components/ui/button';
import {
  TableComp,
  TableHeader,
} from '../../components/table-comp';
import { Badge } from '@/components/ui/badge';
import { ConfirmComp } from '../../components/confirm-comp';
import { toast } from 'sonner';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getUserPaymentLinks,
  deleteUserPaymentLink,
  PaymentLink,
  PaymentLinksListResponse,
} from '@/lib/services/user/payment-links';
import type { TableAction } from '../../components/table-comp';
import { useCursorPagination } from '@/lib/hooks/use-cursor-pagination';
import type { CursorPaginationMeta } from '@/lib/types/pagination';

export default function PaymentLinksPage() {
  const [loading, setLoading] = useState(true);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [meta, setMeta] = useState<CursorPaginationMeta | null>(null);
  const [limit, setLimit] = useState(20);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentLinkToDelete, setPaymentLinkToDelete] = useState<PaymentLink | null>(null);

  const { requestCursor, reset: resetCursor, goNext, goPrev, canGoPrev } =
    useCursorPagination();

  const fetchPaymentLinks = useCallback(
    async (cursor: string | undefined, pageLimit: number) => {
      setLoading(true);
      try {
        const response = await getUserPaymentLinks({
          ...(cursor ? { cursor } : {}),
          limit: pageLimit,
        });

        handleApiResponse<PaymentLinksListResponse>(response, {
          onSuccess: (data) => {
            if (!data?.success) return;
            const list = Array.isArray(data.data) ? data.data : [];
            setPaymentLinks(list as PaymentLink[]);
            setMeta(data.meta ?? null);
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load payment links');
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
    fetchPaymentLinks(requestCursor, limit);
  }, [requestCursor, limit, fetchPaymentLinks]);

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

  const headers: TableHeader<PaymentLink>[] = useMemo(() => [
    { key: 'name', label: 'Name', sortable: false },
    { key: 'link', label: 'Payment Link', sortable: false },
    { key: 'amount', label: 'Amount', sortable: false },
    { key: 'currency', label: 'Currency', sortable: false },
    { key: 'expiryValidity', label: 'Expiry', sortable: false },
    { key: 'status', label: 'Status', sortable: false },
    { key: 'createdAt', label: 'Created', sortable: false },
  ], []);

  const renderCell = (item: PaymentLink, key: keyof PaymentLink | string) => {
    switch (key) {
      case 'name':
        return <div className="font-medium">{item.name}</div>;
      case 'link':
        return (
          <div className="max-w-xs truncate">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              {item.link}
            </a>
          </div>
        );
      case 'amount':
        return (
          <div className="font-mono font-semibold">
            {parseFloat(item.amount).toFixed(2)}
          </div>
        );
      case 'currency':
        return (
          <Badge variant="outline" className="font-mono">
            {item.currency}
          </Badge>
        );
      case 'expiryValidity':
        return (
          <div className="text-sm text-muted-foreground">
            {item.expiryValidity}
          </div>
        );
      case 'status':
        return (
          <Badge variant={item.status === 'active' ? 'success' : 'secondary'}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Badge>
        );
      case 'createdAt':
        return (
          <div className="text-sm text-muted-foreground">
            {new Date(item.createdAt).toLocaleDateString()}
          </div>
        );
      default: {
        const value = item[key as keyof PaymentLink];
        return (
          <div className="text-foreground font-normal">
            {value != null ? String(value) : '-'}
          </div>
        );
      }
    }
  };

  const actions: TableAction<PaymentLink>[] = [
    {
      label: 'Edit',
      icon: Pencil,
      route: (row: PaymentLink) => `/payment-links/${row.id}/edit`,
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (row: PaymentLink) => {
        setPaymentLinkToDelete(row);
        setDeleteDialogOpen(true);
      },
      variant: 'destructive',
      separator: true,
    },
  ];

  const handleDelete = async () => {
    if (!paymentLinkToDelete) return;

    try {
      const response = await deleteUserPaymentLink(paymentLinkToDelete.id);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Payment link deleted successfully');
          fetchPaymentLinks(requestCursor, limit);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete payment link');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setPaymentLinkToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Payment Links"
            description="Create and manage payment links for your customers to make secure payments"
            icon={Link2}
          />
          <ToolbarActions>
            <Button
              variant="primary"
              onClick={() => window.location.href = '/payment-links/create'}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Payment Link
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <TableComp
          data={paymentLinks}
          headers={headers}
          renderCell={renderCell}
          actions={actions}
          enableCheckbox={false}
          searchPlaceholder="Search payment links..."
          searchKeys={['name', 'amount', 'currency']}
          getRowId={(row: PaymentLink) => String(row.id)}
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
          loading={loading}
        />
      </Container>

      <ConfirmComp
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Payment Link"
        message={
          paymentLinkToDelete
            ? `Are you sure you want to delete payment link "${paymentLinkToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this payment link?'
        }
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => {
          setPaymentLinkToDelete(null);
          setDeleteDialogOpen(false);
        }}
      />
    </>
  );
}
