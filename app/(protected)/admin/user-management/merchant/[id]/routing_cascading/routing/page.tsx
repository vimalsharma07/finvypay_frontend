'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
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
import { SearchSelect } from '@/components/ui/molecules/SearchSelect';
import { ContentLoader } from '@/components/common/content-loader';
import { ConfirmComp } from '../../../../../../components/confirm-comp';
import {
  getUserRoutings,
  createUserRouting,
  updateUserRouting,
  deleteUserRouting,
  updateUserRoutingPriority,
  updateUserRoutingStatus,
  updateUserRoutingCascade,
  RouteRule,
  RouteRuleListMeta,
  RouteRuleListResponse,
} from '@/lib/services/admin/routing';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getMerchantProfiles,
  type MerchantProfile,
} from '@/lib/services/admin/merchant-acquirer-account';
import type { Option } from '@/lib/types/common-types';

export default function RoutingPage() {
  const params = useParams();
  const userId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [routes, setRoutes] = useState<RouteRule[]>([]);
  const [meta, setMeta] = useState<RouteRuleListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<string>('priority');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [profiles, setProfiles] = useState<MerchantProfile[]>([]);
  const [profileOptions, setProfileOptions] = useState<Option[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<RouteRule | null>(null);

  const isTableLoading = loading || profilesLoading;

  // Fetch routing rules
  const fetchRoutings = async (
    pageNum: number,
    pageLimit: number,
    sortField: string,
    sortDir: 'ASC' | 'DESC',
    profileId?: string,
  ) => {
    setLoading(true);
    try {
      const params: any = {
        page: pageNum,
        limit: pageLimit,
        sortBy: sortField,
        sortOrder: sortDir,
      };

      const response = await getUserRoutings(userId, params, profileId);

      handleApiResponse<RouteRuleListResponse>(response, {
        onSuccess: (data) => {
          if (!data?.success) return;

          // Support both formats:
          // 1) { success, data: RouteRule[], meta }
          // 2) { success, data: { data: RouteRule[], meta } }
          const list =
            Array.isArray(data.data) ? data.data : (data.data?.data ?? []);
          const metaData = data.meta ?? (data.data as any)?.meta ?? null;

          const normalized = list.map((item: any) => ({
            ...item,
            // Normalize naming from backend variations
            is_cascade: item.is_cascade ?? item.isCascade ?? false,
            routing_for: item.routing_for ?? item.routingFor ?? item.routing_for,
            split_enable: item.split_enable ?? item.splitEnable ?? item.split_enable,
            view_route: item.view_route ?? item.viewRoute ?? item.view_route,
          }));

          setRoutes(normalized as RouteRule[]);
          setMeta(metaData);
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
    if (userId && selectedProfileId) {
      fetchRoutings(page, limit, sortBy, sortOrder, selectedProfileId);
    }
  }, [userId, page, limit, sortBy, sortOrder, selectedProfileId]);

  // Fetch merchant profiles to drive routing context
  useEffect(() => {
    const loadProfiles = async () => {
      setProfilesLoading(true);
      try {
        const response = await getMerchantProfiles(userId);
        handleApiResponse(response, {
          onSuccess: (payload) => {
            if (!payload?.success || !payload.data) return;
            const profileList = Array.isArray(payload.data) ? payload.data : [];
            setProfiles(profileList);

            const options = profileList.map((profile: MerchantProfile) => ({
              value: profile.id?.toString() || '',
              label: profile.industry?.name || profile.merchantProfileName || `Profile ${profile.id}`,
            }));
            setProfileOptions(options);

            // Auto-select primary profile (industry id) when available
            const primaryProfile = profileList.find(
              (p: MerchantProfile) => p.isPrimary
            );
            if (primaryProfile && !selectedProfileId) {
              setSelectedProfileId(primaryProfile.id?.toString() || '');
            } else if (!selectedProfileId && profileList.length > 0) {
              setSelectedProfileId(profileList[0].id?.toString() || '');
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load merchant profiles');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred while loading profiles');
      } finally {
        setProfilesLoading(false);
      }
    };

    loadProfiles();
  }, [userId]);

  // Define table headers
  const headers: TableHeader<RouteRule>[] = useMemo(() => [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'view_route', label: 'View Route', sortable: false },
    { key: 'merchantConnector', label: 'Gateway Connector', sortable: false },
    { key: 'routing_for', label: 'Route Handler', sortable: true },
    { key: 'status', label: 'Status', sortable: false },
    { key: 'is_cascade', label: 'Cascade', sortable: false },
    { key: 'split_enable', label: 'Split Enabled', sortable: false },
  ], []);

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
                    fetchRoutings(page, limit, sortBy, sortOrder, selectedProfileId);
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
                    fetchRoutings(page, limit, sortBy, sortOrder, selectedProfileId);
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
      label: 'View',
      route: (row: RouteRule) =>
        `/admin/user-management/merchant/${userId}/routing_cascading/routing/${row.id}`,
    },
    {
      label: 'Edit',
      route: (row: RouteRule) =>
        `/admin/user-management/merchant/${userId}/routing_cascading/routing/${row.id}/edit`,
    },
    {
      label: 'Delete',
      onClick: (row: RouteRule) => {
        setRouteToDelete(row);
        setDeleteDialogOpen(true);
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
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">Merchant Profile (Industry)</p>
              <p className="text-xs text-muted-foreground">
                Select an industry to load routing rules scoped to that profile.
              </p>
            </div>
            <div className="w-full md:w-80">
              {profilesLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ContentLoader />
                  <span>Loading profiles...</span>
                </div>
              ) : (
                <SearchSelect
                  options={profileOptions}
                  value={selectedProfileId}
                  onChange={(val) => {
                    setSelectedProfileId(val);
                    setPage(1);
                  }}
                  placeholder="Select profile (industry)"
                />
              )}
            </div>
          </div>
        </div>
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
          loading={isTableLoading}
        />
      </Container>

      <ConfirmComp
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Routing Rule"
        message={
          routeToDelete
            ? `Are you sure you want to delete routing rule "${routeToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this routing rule?'
        }
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (!routeToDelete) return;
          try {
            const response = await deleteUserRouting(userId, routeToDelete.id);
            handleApiResponse(response, {
              onSuccess: () => {
                toast.success('Routing rule deleted successfully');
                fetchRoutings(page, limit, sortBy, sortOrder, selectedProfileId);
              },
              onError: (errorMessage) => {
                toast.error(errorMessage || 'Failed to delete routing rule');
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

