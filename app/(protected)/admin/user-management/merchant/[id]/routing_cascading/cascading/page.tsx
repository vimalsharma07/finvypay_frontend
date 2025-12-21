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
  getUserCascadings,
  createUserCascading,
  updateUserCascading,
  deleteUserCascading,
  updateUserCascadingPriority,
  updateUserCascadingStatus,
  CascadingRule,
  CascadingRuleListResponse,
} from '@/lib/services/admin/cascading';
import { handleApiResponse } from '@/lib/utils/api-response-handler';

export default function CascadingPage() {
  const params = useParams();
  const userId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [cascadings, setCascadings] = useState<CascadingRule[]>([]);
  const [meta, setMeta] = useState<
    CascadingRuleListResponse['data']['meta'] | null
  >(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<string>('priority');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // Fetch cascading rules
  const fetchCascadings = async (
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

      const response = await getUserCascadings(userId, params);

      handleApiResponse<CascadingRuleListResponse>(response, {
        onSuccess: (data) => {
          if (data.success) {
            setCascadings(data.data.data);
            setMeta(data.data.meta);
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to load cascading rules');
        },
      });
    } catch (error) {
      console.error('Fetch cascading error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCascadings(page, limit, sortBy, sortOrder);
    }
  }, [userId, page, limit, sortBy, sortOrder]);

  // Define table headers
  const headers: TableHeader<CascadingRule>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'connector_id', label: 'Main MID', sortable: false },
    { key: 'cascadeTo', label: 'Cascade To', sortable: false },
    { key: 'config', label: 'Config', sortable: false },
    { key: 'cascading_for', label: 'Cascading For', sortable: true },
    { key: 'status', label: 'Status', sortable: false },
  ];

  // Render cell function
  const renderCell = (item: CascadingRule, key: keyof CascadingRule | string) => {
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
      case 'connector_id':
        return <div className="text-sm">{item.connector_id || '-'}</div>;
      case 'cascadeTo':
        return (
          <div className="text-sm text-muted-foreground">
            {item.cascadeTo ? 'Configured' : 'Not Configured'}
          </div>
        );
      case 'config':
        return (
          <div className="text-sm text-muted-foreground">
            {Array.isArray(item.config) && item.config.length > 0
              ? `${item.config.length} connector(s)`
              : '-'}
          </div>
        );
      case 'cascading_for':
        return (
          <Badge variant="outline" className="capitalize">
            {item.cascading_for}
          </Badge>
        );
      case 'status':
        return (
          <Switch
            checked={item.status}
            onCheckedChange={async (checked) => {
              try {
                const response = await updateUserCascadingStatus(
                  userId,
                  item.id,
                  checked,
                );
                handleApiResponse(response, {
                  onSuccess: () => {
                    toast.success('Cascading status updated');
                    fetchCascadings(page, limit, sortBy, sortOrder);
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
        const value = item[key as keyof CascadingRule];
        return (
          <div className="text-foreground font-normal">
            {value != null ? String(value) : '-'}
          </div>
        );
    }
  };

  // Define actions
  const actions: TableAction<CascadingRule>[] = [
    {
      label: 'Edit',
      route: (row: CascadingRule) =>
        `/admin/user-management/merchant/${userId}/routing_cascading/cascading/${row.id}/edit`,
    },
    {
      label: 'Delete',
      onClick: async (row: CascadingRule) => {
        if (
          confirm(
            `Are you sure you want to delete cascading rule "${row.name}"?`,
          )
        ) {
          try {
            const response = await deleteUserCascading(userId, row.id);
            handleApiResponse(response, {
              onSuccess: () => {
                toast.success('Cascading rule deleted successfully');
                fetchCascadings(page, limit, sortBy, sortOrder);
              },
              onError: (errorMessage) => {
                toast.error(errorMessage || 'Failed to delete cascading rule');
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
            title="Cascading Rules"
            description="Manage cascading configurations for payment processing"
          />
          <ToolbarActions>
            <Button
              variant="primary"
              onClick={() => {
                // Navigate to create cascading page
                window.location.href = `/admin/user-management/merchant/${userId}/routing_cascading/cascading/create`;
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Cascading Rule
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <TableComp
          data={cascadings}
          headers={headers}
          renderCell={renderCell}
          actions={actions}
          enableCheckbox={false}
          searchPlaceholder="Search cascading rules..."
          searchKeys={['name']}
          getRowId={(row: CascadingRule) => String(row.id)}
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

