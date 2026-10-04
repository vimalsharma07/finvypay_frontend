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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentTemplatesTabContent } from './components/payment-templates-tab-content';

export default function PaymentLinksPage() {
  const [activeTab, setActiveTab] = useState('payment-template');
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
    { key: 'name', label: 'Link Name', sortable: false },
    { key: 'link', label: 'Pay URL', sortable: false },
    { key: 'amount', label: 'Amount', sortable: false },
    { key: 'currency', label: 'Currency', sortable: false },
    { key: 'expiryValidity', label: 'Expires', sortable: false },
    { key: 'status', label: 'Link Status', sortable: false },
    { key: 'createdAt', label: 'Created', sortable: false },
  ], []);

  const renderCell = (item: PaymentLink, key: keyof PaymentLink | string) => {
    switch (key) {
      case 'name':
        return <div className="font-semibold text-foreground">{item.name}</div>;
      case 'link':
        return (
          <div className="max-w-xs truncate">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-sky-700 hover:underline dark:text-sky-300"
            >
              {item.link}
            </a>
          </div>
        );
      case 'amount':
        return (
          <div className="font-mono font-semibold">
            {item.amount ? parseFloat(item.amount).toFixed(2) : 'Custom'}
          </div>
        );
      case 'currency':
        return (
          <Badge variant="outline" className="rounded-lg border-sky-200 font-mono text-sky-700 dark:border-sky-800 dark:text-sky-300">
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
          <Badge
            variant={item.status === 'active' ? 'success' : 'secondary'}
            className="rounded-lg"
          >
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
            title="Pay Links"
            description="Build branded templates and share checkout links with customers"
            icon={Link2}
          />
          <ToolbarActions>
            {activeTab === 'payment-link' && (
              <Button
                variant="primary"
                className="rounded-xl shadow-sm shadow-sky-500/20"
                onClick={() => window.location.href = '/payment-links/create'}
              >
                <Plus className="mr-1 h-4 w-4" />
                Create Pay Link
              </Button>
            )}
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <div className="relative mb-4 overflow-hidden rounded-2xl border border-sky-200/70 bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_55%,#e0f2fe_100%)] p-4 dark:border-sky-900/50 dark:bg-[linear-gradient(135deg,#0c1a24_0%,#0f172a_55%,#082f49_100%)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700/80 dark:text-sky-300/80">
            Checkout studio
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Style your checkout look, then publish shareable pay links.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4 rounded-xl border border-sky-100 bg-sky-50/50 p-1 dark:border-sky-900/40 dark:bg-sky-950/20">
            <TabsTrigger value="payment-template" className="rounded-lg">
              Brand Templates
            </TabsTrigger>
            <TabsTrigger value="payment-link" className="rounded-lg">
              Live Pay Links
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payment-template">
            <PaymentTemplatesTabContent />
          </TabsContent>

          <TabsContent value="payment-link">
            <div className="overflow-hidden rounded-2xl border border-sky-100 bg-card shadow-sm ring-1 ring-sky-500/5 dark:border-sky-900/40">
              <TableComp
                data={paymentLinks}
                headers={headers}
                renderCell={renderCell}
                actions={actions}
                enableCheckbox={false}
                searchPlaceholder="Search pay links..."
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
            </div>
          </TabsContent>
        </Tabs>
      </Container>

      <ConfirmComp
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Pay Link"
        message={
          paymentLinkToDelete
            ? `Delete pay link "${paymentLinkToDelete.name}"? This cannot be undone.`
            : 'Delete this pay link? This cannot be undone.'
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
