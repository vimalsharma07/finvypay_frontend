'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import { BarChart3, Eye, Pencil, Trash2, Plus } from 'lucide-react';
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
  TableAction,
} from '@/app/(protected)/components/table-comp';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ConfirmComp } from '@/app/(protected)/components/confirm-comp';
import {
  getGlobalCascadings,
  deleteGlobalCascading,
  updateGlobalCascadingStatus,
  type GlobalCascadingRule,
  type GlobalCascadingRuleListMeta,
} from '@/lib/services/admin/global-cascading';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { useCursorPagination } from '@/lib/hooks/use-cursor-pagination';

export default function GlobalCascadingPage() {
  const [loading, setLoading] = useState(true);
  const [cascades, setCascades] = useState<GlobalCascadingRule[]>([]);
  const [meta, setMeta] = useState<GlobalCascadingRuleListMeta | null>(null);
  const [limit, setLimit] = useState(20);
  const { requestCursor, reset: resetCursor, goNext, goPrev, canGoPrev } =
    useCursorPagination();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cascadeToDelete, setCascadeToDelete] = useState<GlobalCascadingRule | null>(null);

  const fetchCascadings = useCallback(async (cursor: string | undefined, pageLimit: number) => {
    setLoading(true);
    try {
      const response = await getGlobalCascadings({
        ...(cursor ? { cursor } : {}),
        limit: pageLimit,
      });

      handleApiResponse(response, {
        onSuccess: (data) => {
          if (!data?.success) return;
          const list = Array.isArray(data.data) ? data.data : [];
          setCascades(list);
          setMeta(data.meta ?? null);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to load global cascading rules');
        },
      });
    } catch (error) {
      console.error('Fetch global cascading error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCascadings(requestCursor, limit);
  }, [fetchCascadings, requestCursor, limit]);

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

  const CASCADING_FOR_LABELS: Record<number, string> = {
    1: 'Card',
    2: 'UPI',
    3: 'Crypto',
    4: 'APM',
  };

  const headers: TableHeader<GlobalCascadingRule>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'industry', label: 'Industry', sortable: false },
    { key: 'globalAcquirerAccount', label: 'Connector', sortable: false },
    { key: 'cascadingFor', label: 'Cascading For', sortable: true },
    { key: 'status', label: 'Status', sortable: false },
  ];

  const renderCell = (item: GlobalCascadingRule, key: keyof GlobalCascadingRule | string) => {
    const cascadingFor = item.cascadingFor ?? item.cascading_for ?? 1;

    switch (key) {
      case 'name':
        return <div className="font-medium">{item.name}</div>;
      case 'priority':
        return (
          <Badge variant="secondary" className="font-mono">
            {item.priority}
          </Badge>
        );
      case 'type':
        return (
          <Badge variant="outline" className="capitalize">
            {item.type}
          </Badge>
        );
      case 'industry':
        return (
          <div className="text-sm">
            {item.industry?.name ?? '-'}
          </div>
        );
      case 'globalAcquirerAccount':
        return (
          <div className="text-sm">
            {item.globalAcquirerAccount?.name ?? 'Not Assigned'}
          </div>
        );
      case 'cascadingFor':
        return (
          <Badge variant="outline">
            {CASCADING_FOR_LABELS[cascadingFor] ?? `Type ${cascadingFor}`}
          </Badge>
        );
      case 'status':
        return (
          <Switch
            checked={item.status}
            onCheckedChange={async (checked) => {
              try {
                const response = await updateGlobalCascadingStatus(String(item.id), checked);
                handleApiResponse(response, {
                  onSuccess: () => {
                    toast.success('Cascading status updated');
                    fetchCascadings(requestCursor, limit);
                  },
                  onError: (errorMessage) => {
                    toast.error(errorMessage || 'Failed to update status');
                  },
                });
              } catch (error) {
                toast.error('An unexpected error occurred');
              }
            }}
          />
        );
      default:
        const value = item[key as keyof GlobalCascadingRule];
        return (
          <div className="text-foreground font-normal">
            {value != null ? String(value) : '-'}
          </div>
        );
    }
  };

  const actions: TableAction<GlobalCascadingRule>[] = [
    {
      label: 'View',
      icon: Eye,
      route: (row: GlobalCascadingRule) => `/admin/global-cascading/${row.id}`,
    },
    {
      label: 'Edit',
      icon: Pencil,
      route: (row: GlobalCascadingRule) => `/admin/global-cascading/${row.id}/edit`,
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (row: GlobalCascadingRule) => {
        setCascadeToDelete(row);
        setDeleteDialogOpen(true);
      },
      variant: 'destructive',
      separator: true,
    },
  ];

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Global Cascading"
            description="Manage industry-level cascading rules for payment fallback across merchants"
            icon={BarChart3}
          />
          <ToolbarActions>
            <Button
              variant="primary"
              onClick={() => {
                window.location.href = '/admin/global-cascading/create';
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Global Cascading
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <TableComp
          data={cascades}
          headers={headers}
          renderCell={renderCell}
          actions={actions}
          enableCheckbox={false}
          searchPlaceholder="Search global cascading rules..."
          searchKeys={['name']}
          getRowId={(row: GlobalCascadingRule) => String(row.id)}
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
        title="Delete Global Cascading Rule"
        message={
          cascadeToDelete
            ? `Are you sure you want to delete global cascading rule "${cascadeToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this global cascading rule?'
        }
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (!cascadeToDelete) return;
          try {
            const response = await deleteGlobalCascading(String(cascadeToDelete.id));
            handleApiResponse(response, {
              onSuccess: () => {
                toast.success('Global cascading rule deleted successfully');
                fetchCascadings(requestCursor, limit);
              },
              onError: (errorMessage) => {
                toast.error(errorMessage || 'Failed to delete global cascading rule');
              },
            });
          } catch (error) {
            toast.error('An unexpected error occurred');
          } finally {
            setCascadeToDelete(null);
          }
        }}
        onCancel={() => setCascadeToDelete(null)}
      />
    </Fragment>
  );
}
