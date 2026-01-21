'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
import { ContentLoader } from '@/components/common/content-loader';
import { ConfirmComp } from '../../components/confirm-comp';
import { toast } from 'sonner';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getUserPaymentLinks,
  deleteUserPaymentLink,
  PaymentLink,
  PaymentLinksListResponse,
  PaymentLinksListMeta,
} from '@/lib/services/user/payment-links';
import type { TableAction } from '../../components/table-comp';

export default function PaymentLinksPage() {
  const [loading, setLoading] = useState(true);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [meta, setMeta] = useState<PaymentLinksListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentLinkToDelete, setPaymentLinkToDelete] = useState<PaymentLink | null>(null);

  // Fetch payment links
  const fetchPaymentLinks = async (
    pageNum: number,
    pageLimit: number,
  ) => {
    setLoading(true);
    try {
      const params: any = {
        page: pageNum,
        limit: pageLimit,
      };

      const response = await getUserPaymentLinks(params);

      handleApiResponse<PaymentLinksListResponse>(response, {
        onSuccess: (data) => {
          if (!data?.success) return;
          const list = Array.isArray(data.data) ? data.data : (data.data?.data ?? []);
          const metaData = data.meta ?? (data.data as any)?.meta ?? null;
          setPaymentLinks(list as PaymentLink[]);
          setMeta(metaData);
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
  };

  useEffect(() => {
    fetchPaymentLinks(page, limit);
  }, [page, limit]);

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
      default:
        const value = item[key as keyof PaymentLink];
        return (
          <div className="text-foreground font-normal">
            {value != null ? String(value) : '-'}
          </div>
        );
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
          fetchPaymentLinks(page, limit);
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
              <Plus className="h-4 w-4 mr-2" />
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
            pageIndex: page - 1,
            totalCount: meta?.total ?? 0,
            onPageChange: (pageIndex) => setPage(pageIndex + 1),
            onPageSizeChange: (newSize) => {
              setLimit(newSize);
              setPage(1);
            },
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

