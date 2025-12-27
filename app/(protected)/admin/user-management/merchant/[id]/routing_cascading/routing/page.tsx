'use client';

import { Fragment, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  TableComp,
  TableHeader,
  TableAction,
} from '../../../../../../components/table-comp';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  getUserRoutings,
  createUserRouting,
  updateUserRouting,
  deleteUserRouting,
  updateUserRoutingPriority,
  updateUserRoutingStatus,
  updateUserRoutingCascade,
  RouteRule,
  RouteRuleListResponse,
} from '@/lib/services/admin/routing';
import { handleApiResponse } from '@/lib/utils/api-response-handler';

export default function RoutingPage() {
  const params = useParams();
  const userId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<RouteRule[]>([]);
  const [meta, setMeta] = useState<RouteRuleListResponse['data']['meta'] | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<string>('priority');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // Fetch routing rules
  const fetchRoutings = async (
    pageNum: number,
    pageLimit: number,
    sortField: string,
    sortDir: 'ASC' | 'DESC',
  ) => {
    setLoading(true);
    try {
      const params: any = {
        page: pageNum,
        limit: pageLimit,
        sortBy: sortField,
        sortOrder: sortDir,
      };

      const response = await getUserRoutings(userId, params);

      handleApiResponse<RouteRuleListResponse>(response, {
        onSuccess: (data) => {
          if (data.success) {
            // New format: { success: true, data: [...], meta: {...} }
            setRoutes(data.data);
            setMeta(data.meta);
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to load routing rules');
        },
      });
    } catch (error) {
      console.error('Fetch routing error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRoutings(page, limit, sortBy, sortOrder);
    }
  }, [userId, page, limit, sortBy, sortOrder]);

  // Define table headers
  const headers: TableHeader<RouteRule>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'view_route', label: 'View Route', sortable: false },
    { key: 'merchantConnector', label: 'Gateway Connector', sortable: false },
    { key: 'routing_for', label: 'Route Handler', sortable: true },
    { key: 'status', label: 'Status', sortable: false },
    { key: 'is_cascade', label: 'Cascade', sortable: false },
    { key: 'split_enable', label: 'Split Enabled', sortable: false },
  ];

  // Render cell function
  const renderCell = (item: RouteRule, key: keyof RouteRule | string) => {
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
            {item.view_route || '-'}
          </div>
        );
      case 'merchantConnector':
        return (
          <div className="text-sm">
            {item.merchantConnector?.name || 'Not Assigned'}
          </div>
        );
      case 'routing_for':
        return (
          <Badge variant="outline" className="capitalize">
            {item.routing_for}
          </Badge>
        );
      case 'status':
        return (
          <Switch
            checked={item.status}
            onCheckedChange={async (checked) => {
              try {
                const response = await updateUserRoutingStatus(
                  userId,
                  item.id,
                  checked,
                );
                handleApiResponse(response, {
                  onSuccess: () => {
                    toast.success('Routing status updated');
                    fetchRoutings(page, limit, sortBy, sortOrder);
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
      case 'is_cascade':
        return (
          <Switch
            checked={item.is_cascade || false}
            disabled={item.routing_for !== 'CARD'}
            onCheckedChange={async (checked) => {
              try {
                const response = await updateUserRoutingCascade(
                  userId,
                  item.id,
                  checked,
                );
                handleApiResponse(response, {
                  onSuccess: () => {
                    toast.success('Cascade status updated');
                    fetchRoutings(page, limit, sortBy, sortOrder);
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
      case 'split_enable':
        return (
          <Badge variant={item.split_enable ? 'success' : 'secondary'}>
            {item.split_enable ? 'Yes' : 'No'}
          </Badge>
        );
      default:
        const value = item[key as keyof RouteRule];
        return (
          <div className="text-foreground font-normal">
            {value != null ? String(value) : '-'}
          </div>
        );
    }
  };

  // Define actions
  const actions: TableAction<RouteRule>[] = [
    {
      label: 'Edit',
      route: (row: RouteRule) =>
        `/admin/user-management/merchant/${userId}/routing_cascading/routing/${row.id}/edit`,
    },
    {
      label: 'Delete',
      onClick: async (row: RouteRule) => {
        if (
          confirm(
            `Are you sure you want to delete routing rule "${row.name}"?`,
          )
        ) {
          try {
            const response = await deleteUserRouting(userId, row.id);
            handleApiResponse(response, {
              onSuccess: () => {
                toast.success('Routing rule deleted successfully');
                fetchRoutings(page, limit, sortBy, sortOrder);
              },
              onError: (errorMessage) => {
                toast.error(errorMessage || 'Failed to delete routing rule');
              },
            });
          } catch (error) {
            toast.error('An unexpected error occurred');
          }
        }
      },
      variant: 'destructive',
      separator: true,
    },
  ];

  // Handle page change
  const handlePageChange = (pageIndex: number) => {
    setPage(pageIndex + 1);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    setPage(1);
  };

  // Handle sort change
  const handleSortChange = (newSortBy: string, newSortOrder: 'ASC' | 'DESC') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Routing Rules"
            description="Manage routing rules for payment processing"
          />
          <ToolbarActions>
            <Button
              variant="primary"
              onClick={() => {
                // Navigate to create routing page
                window.location.href = `/admin/user-management/merchant/${userId}/routing_cascading/routing/create`;
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Routing Rule
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
          searchPlaceholder="Search routing rules..."
          searchKeys={['name', 'view_route']}
          getRowId={(row: RouteRule) => String(row.id)}
          pagination={{
            pageSize: limit,
            pageIndex: page - 1,
            totalCount: meta?.totalItems ?? 0,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
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

