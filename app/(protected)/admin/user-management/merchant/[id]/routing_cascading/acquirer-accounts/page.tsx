'use client';

import { Fragment, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Cpu, Eye, Pencil, Trash2 } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
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
  getUserConnectors,
  MerchantAcquirerAccount,
  MerchantAcquirerAccountListResponse,
} from '@/lib/services/admin/connectors';
import { handleApiResponse } from '@/lib/utils/api-response-handler';

export default function ConnectorsPage() {
  const params = useParams();
  const userId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [connectors, setConnectors] = useState<MerchantAcquirerAccount[]>([]);
  const [meta, setMeta] = useState<
    MerchantAcquirerAccountListResponse['data']['meta'] | null
  >(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Fetch connectors
  const fetchConnectors = async (
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
        userId: userId,
      };

      const response = await getUserConnectors(params);

      handleApiResponse<MerchantAcquirerAccountListResponse>(response, {
        onSuccess: (data) => {
          if (data.success) {
            // New format: { success: true, data: [...], meta: {...} }
            setConnectors(data.data);
            setMeta(data.meta);
          }
        },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load payment channels');
          },
      });
    } catch (error) {
      console.error('Fetch connectors error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchConnectors(page, limit, sortBy, sortOrder);
    }
  }, [userId, page, limit, sortBy, sortOrder]);

  // Define table headers
  const headers: TableHeader<MerchantAcquirerAccount>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'merchantProfileId', label: 'Merchant Profile ID', sortable: true },
    { key: 'terminalId', label: 'Terminal ID', sortable: true },
    { key: 'gateway', label: 'Gateway', sortable: false },
    { key: 'acquirerAccount', label: 'Payment Channel', sortable: false },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'isPrimary', label: 'Primary', sortable: false },
    { key: 'isActive', label: 'Active', sortable: false },
    { key: 'createdAt', label: 'Created At', sortable: true },
  ];

  // Render cell function
  const renderCell = (
    item: MerchantAcquirerAccount,
    key: keyof MerchantAcquirerAccount | string,
  ) => {
    switch (key) {
      case 'name':
        return <div className="font-medium">{item.name || '-'}</div>;
      case 'merchantProfileId':
        return (
          <div className="text-sm font-semibold text-primary">
            {item.merchantProfileId || '-'}
          </div>
        );
      case 'terminalId':
        return (
          <div className="text-sm font-mono text-muted-foreground">
            {item.terminalId || '-'}
          </div>
        );
      case 'gateway':
        return (
          <div className="text-sm">
            {item.acquirer?.name || 'N/A'}
          </div>
        );
      case 'acquirerAccount':
        return (
          <div className="text-sm">
            {item.acquirerAccount?.name || 'N/A'}
          </div>
        );
      case 'status':
        const statusConfig = {
          0: { label: 'Rejected', variant: 'destructive' as const },
          1: { label: 'Approved', variant: 'success' as const },
          2: { label: 'Pending', variant: 'secondary' as const },
          3: { label: 'Rates Assigned', variant: 'outline' as const },
        };
        const status = statusConfig[item.status as keyof typeof statusConfig] || {
          label: 'Unknown',
          variant: 'secondary' as const,
        };
        return <Badge variant={status.variant}>{status.label}</Badge>;
      case 'isPrimary':
        return (
          <Badge variant={item.isPrimary ? 'success' : 'secondary'}>
            {item.isPrimary ? 'Yes' : 'No'}
          </Badge>
        );
      case 'isActive':
        return (
          <Switch
            checked={item.isActive || false}
            onCheckedChange={async (checked) => {
              // TODO: Implement toggle active status
              toast.info('Toggle functionality coming soon');
            }}
          />
        );
      case 'createdAt':
        const date = new Date(item.createdAt);
        return (
          <div className="text-sm text-muted-foreground">
            {date.toLocaleDateString()}
          </div>
        );
      default:
        const value = item[key as keyof MerchantAcquirerAccount];
        return (
          <div className="text-foreground font-normal">
            {value != null ? String(value) : '-'}
          </div>
        );
    }
  };

  // Define actions
  const actions: TableAction<MerchantAcquirerAccount>[] = [
    {
      label: 'View',
      icon: Eye,
      route: (row: MerchantAcquirerAccount) =>
        `/admin/merchant-acquirer-account/${row.id}`,
    },
    {
      label: 'Edit',
      icon: Pencil,
      route: (row: MerchantAcquirerAccount) =>
        `/admin/merchant-acquirer-account/${row.id}/edit`,
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: async (row: MerchantAcquirerAccount) => {
        if (confirm(`Are you sure you want to delete payment channel "${row.name}"?`)) {
          // TODO: Implement delete
          toast.info('Delete functionality coming soon');
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
            title="Gateways (Payment Channels)"
            description="View and manage payment channels and gateway connectors assigned to this merchant for transaction routing"
            icon={Cpu}
          />
          <ToolbarActions>
            <Button
              variant="primary"
              onClick={() => {
                // Navigate to create payment channel page
                const returnUrl = encodeURIComponent(`/admin/user-management/merchant/${userId}/routing_cascading/acquirer-accounts`);
                window.location.href = `/admin/user-management/merchant/${userId}/routing_cascading/acquirer-accounts/create?returnUrl=${returnUrl}`;
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Channel
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <TableComp
          data={connectors}
          headers={headers}
          renderCell={renderCell}
          actions={actions}
          enableCheckbox={false}
          searchPlaceholder="Search payment channels..."
          searchKeys={['name', 'merchantProfileId', 'terminalId']}
          getRowId={(row: MerchantAcquirerAccount) => String(row.id)}
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

