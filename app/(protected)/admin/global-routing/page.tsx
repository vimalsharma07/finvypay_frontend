'use client';

import { Fragment, useEffect, useState } from 'react';
import { Route, Eye, Pencil, Trash2, Plus } from 'lucide-react';
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
import { ContentLoader } from '@/components/common/content-loader';
import { ConfirmComp } from '@/app/(protected)/components/confirm-comp';
import {
  getGlobalRoutings,
  deleteGlobalRouting,
  updateGlobalRoutingStatus,
  updateGlobalRoutingCascade,
  type GlobalRouteRule,
  type GlobalRouteRuleListMeta,
} from '@/lib/services/admin/global-routing';
import { handleApiResponse } from '@/lib/utils/api-response-handler';

export default function GlobalRoutingPage() {
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<GlobalRouteRule[]>([]);
  const [meta, setMeta] = useState<GlobalRouteRuleListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<GlobalRouteRule | null>(null);

  const fetchRoutings = async (pageNum: number, pageLimit: number) => {
    setLoading(true);
    try {
      const response = await getGlobalRoutings({
        page: pageNum,
        limit: pageLimit,
      });

      handleApiResponse(response, {
        onSuccess: (data) => {
          if (!data?.success) return;
          const list = Array.isArray(data.data) ? data.data : [];
          setRoutes(list);
          setMeta(data.meta ?? null);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to load global routing rules');
        },
      });
    } catch (error) {
      console.error('Fetch global routing error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutings(page, limit);
  }, [page, limit]);

  const headers: TableHeader<GlobalRouteRule>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'view_route', label: 'View Route', sortable: false },
    { key: 'industry', label: 'Industry', sortable: false },
    { key: 'globalAcquirerAccount', label: 'Connector', sortable: false },
    { key: 'routingFor', label: 'Route Handler', sortable: true },
    { key: 'status', label: 'Status', sortable: false },
    { key: 'isCascade', label: 'Cascade', sortable: false },
  ];

  const renderCell = (item: GlobalRouteRule, key: keyof GlobalRouteRule | string) => {
    const viewRoute = item.viewRoute ?? item.view_route;
    const isCascade = item.isCascade ?? item.is_cascade ?? false;
    const routingFor = item.routingFor ?? item.routing_for ?? '-';

    switch (key) {
      case 'name':
        return <div className="font-medium">{item.name}</div>;
      case 'priority':
        return (
          <Badge variant="secondary" className="font-mono">
            {item.priority}
          </Badge>
        );
      case 'view_route':
        return (
          <div className="text-sm text-muted-foreground max-w-xs truncate">
            {viewRoute || '-'}
          </div>
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
      case 'routingFor':
        return (
          <Badge variant="outline" className="capitalize">
            {routingFor}
          </Badge>
        );
      case 'status':
        return (
          <Switch
            checked={item.status}
            onCheckedChange={async (checked) => {
              try {
                const response = await updateGlobalRoutingStatus(String(item.id), checked);
                handleApiResponse(response, {
                  onSuccess: () => {
                    toast.success('Routing status updated');
                    fetchRoutings(page, limit);
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
      case 'isCascade':
        return (
          <Switch
            checked={isCascade}
            onCheckedChange={async (checked) => {
              try {
                const response = await updateGlobalRoutingCascade(String(item.id), checked);
                handleApiResponse(response, {
                  onSuccess: () => {
                    toast.success('Cascade status updated');
                    fetchRoutings(page, limit);
                  },
                  onError: (errorMessage) => {
                    toast.error(errorMessage || 'Failed to update cascade');
                  },
                });
              } catch (error) {
                toast.error('An unexpected error occurred');
              }
            }}
          />
        );
      default:
        const value = item[key as keyof GlobalRouteRule];
        return (
          <div className="text-foreground font-normal">
            {value != null ? String(value) : '-'}
          </div>
        );
    }
  };

  const actions: TableAction<GlobalRouteRule>[] = [
    {
      label: 'View',
      icon: Eye,
      route: (row: GlobalRouteRule) => `/admin/global-routing/${row.id}`,
    },
    {
      label: 'Edit',
      icon: Pencil,
      route: (row: GlobalRouteRule) => `/admin/global-routing/${row.id}/edit`,
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (row: GlobalRouteRule) => {
        setRouteToDelete(row);
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
            title="Global Routing"
            description="Manage industry-level routing rules that apply across merchants"
            icon={Route}
          />
          <ToolbarActions>
            <Button
              variant="primary"
              onClick={() => {
                window.location.href = '/admin/global-routing/create';
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Global Routing
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <TableComp
          data={routes}
          headers={headers}
          renderCell={renderCell}
          actions={actions}
          enableCheckbox={false}
          searchPlaceholder="Search global routing rules..."
          searchKeys={['name']}
          getRowId={(row: GlobalRouteRule) => String(row.id)}
          pagination={{
            pageSize: limit,
            pageIndex: page - 1,
            totalCount: meta?.totalItems ?? 0,
            onPageChange: (pageIndex) => setPage(pageIndex + 1),
            onPageSizeChange: (newLimit) => {
              setLimit(newLimit);
              setPage(1);
            },
          }}
          loading={loading}
        />
      </Container>

      <ConfirmComp
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Global Routing Rule"
        message={
          routeToDelete
            ? `Are you sure you want to delete global routing rule "${routeToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this global routing rule?'
        }
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (!routeToDelete) return;
          try {
            const response = await deleteGlobalRouting(String(routeToDelete.id));
            handleApiResponse(response, {
              onSuccess: () => {
                toast.success('Global routing rule deleted successfully');
                fetchRoutings(page, limit);
              },
              onError: (errorMessage) => {
                toast.error(errorMessage || 'Failed to delete global routing rule');
              },
            });
          } catch (error) {
            toast.error('An unexpected error occurred');
          } finally {
            setRouteToDelete(null);
          }
        }}
        onCancel={() => setRouteToDelete(null)}
      />
    </Fragment>
  );
}
