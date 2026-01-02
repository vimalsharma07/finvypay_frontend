'use client';

import React, { useEffect, useMemo, useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Route, UserCircle } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Button } from '@/components/ui/button';
import {
  TableComp,
  TableHeader,
} from '../../components/table-comp';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { SearchSelect } from '@/components/ui/molecules/SearchSelect';
import { ContentLoader } from '@/components/common/content-loader';
import { ConfirmComp } from '../../components/confirm-comp';
import { toast } from 'sonner';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getUserMerchantRoutings,
  deleteUserMerchantRouting,
  UserRouteRule,
  UserRouteRuleListResponse,
  UserRouteRuleListMeta,
} from '@/lib/services/user/routing';
import {
  updateUserRoutingStatus,
  updateUserRoutingCascade,
} from '@/lib/services/admin/routing';
import type { TableAction } from '../../components/table-comp';
import type { Option } from '@/lib/types/common-types';
import { useAuth } from '@/hooks/use-auth';

export default function UserRoutingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profileList, setProfileList] = useState<
    Array<{ id: number | string; merchantProfileName?: string; industry?: { name?: string }; isPrimary?: boolean }>
  >([]);

  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<UserRouteRule[]>([]);
  const [meta, setMeta] = useState<UserRouteRuleListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<string>('priority');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  const [profileOptions, setProfileOptions] = useState<Option[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<UserRouteRule | null>(null);

  const isTableLoading = loading || profilesLoading;
  const userId = user?.id?.toString() || '';

  // Fetch routing rules (user-scoped service)
  const fetchRoutings = async (
    pageNum: number,
    pageLimit: number,
    sortField: string,
    sortDir: 'ASC' | 'DESC',
    profileId?: string,
  ) => {
    if (!userId) return;
    setLoading(true);
    try {
      const params: any = {
        page: pageNum,
        limit: pageLimit,
        sortBy: sortField,
        sortOrder: sortDir,
        ...(profileId && { profileId }),
      };

      const response = await getUserMerchantRoutings(params);

      handleApiResponse<UserRouteRuleListResponse>(response, {
        onSuccess: (data) => {
          if (!data?.success) return;
          const list = Array.isArray(data.data) ? data.data : (data.data?.data ?? []);
          const metaData = data.meta ?? (data.data as any)?.meta ?? null;
          const normalized = list.map((item: any) => ({
            ...item,
            isCascade: item.isCascade ?? item.is_cascade ?? false,
            routingFor: item.routingFor ?? item.routing_for ?? item.routingFor,
            splitEnable: item.splitEnable ?? item.split_enable ?? item.splitEnable,
            viewRoute: item.viewRoute ?? item.view_route ?? item.viewRoute,
          }));
          setRoutes(normalized as UserRouteRule[]);
          setMeta(metaData);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to load routing rules');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Load routes when profile or pagination changes
  useEffect(() => {
    if (userId && selectedProfileId) {
      fetchRoutings(page, limit, sortBy, sortOrder, selectedProfileId);
    }
  }, [userId, page, limit, sortBy, sortOrder, selectedProfileId]);

  // Prepare merchant profiles from user data/local storage
  useEffect(() => {
    if (user?.merchantProfiles && Array.isArray(user.merchantProfiles)) {
      setProfileList(user.merchantProfiles as any[]);
      return;
    }
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed?.merchantProfiles)) {
            setProfileList(parsed.merchantProfiles);
          }
        }
      } catch {
        // ignore parse errors
      }
    }
  }, [user]);

  useEffect(() => {
    setProfilesLoading(true);
    const options = profileList.map((p) => ({
      value: p.id.toString(),
      label: p.merchantProfileName || p.industry?.name || `Profile ${p.id}`,
    }));
    setProfileOptions(options);

    if (!selectedProfileId && options.length > 0) {
      const primary = profileList.find((p) => p.isPrimary);
      const nextProfileId = (primary?.id ?? profileList[0]?.id)?.toString() || '';
      if (nextProfileId) {
        setSelectedProfileId(nextProfileId);
      }
    }
    setProfilesLoading(false);
  }, [profileList, selectedProfileId]);

  const headers: TableHeader<UserRouteRule>[] = useMemo(() => [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'viewRoute', label: 'View Route', sortable: false },
    { key: 'merchantConnector', label: 'Gateway Connector', sortable: false },
    { key: 'routingFor', label: 'Route Handler', sortable: true },
    { key: 'status', label: 'Status', sortable: false },
    { key: 'isCascade', label: 'Cascade', sortable: false },
    { key: 'splitEnable', label: 'Split Enabled', sortable: false },
  ], []);

  const renderCell = (item: UserRouteRule, key: keyof UserRouteRule | string) => {
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
            {item.viewRoute || '-'}
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
            {item.routingFor}
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
              } catch {
                toast.error('An unexpected error occurred');
              }
            }}
          />
        );
      case 'is_cascade':
        return (
          <Switch
            checked={item.isCascade || false}
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
              } catch {
                toast.error('An unexpected error occurred');
              }
            }}
          />
        );
      case 'split_enable':
        return (
          <Badge variant={item.splitEnable ? 'success' : 'secondary'}>
            {item.splitEnable ? 'Yes' : 'No'}
          </Badge>
        );
      default:
        const value = item[key as keyof UserRouteRule];
        return (
          <div className="text-foreground font-normal">
            {value != null ? String(value) : '-'}
          </div>
        );
    }
  };

  const actions: TableAction<UserRouteRule>[] = [
    {
      label: 'View',
      route: (row: UserRouteRule) => `/user/routing/${row.id}`,
    },
    {
      label: 'Edit',
      route: (row: UserRouteRule) => `/user/routing/${row.id}/edit`,
    },
    {
      label: 'Delete',
      onClick: (row: UserRouteRule) => {
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
              title="Routing Rules"
              description="Create, edit, and manage payment routing rules to optimize transaction processing across multiple acquirers"
              icon={Route}
            />
          <ToolbarActions>
            <Button
              variant="primary"
              onClick={() => router.push(`/user/routing/create?profileId=${selectedProfileId}`)}
              disabled={!selectedProfileId}
            >
              Create Routing
            </Button>
            <Button variant="secondary" onClick={() => router.push('/user/profile-selection')}>
              <UserCircle className="h-4 w-4 me-1" />
              Change Profile
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">Merchant Profile</p>
              <p className="text-xs text-muted-foreground">
                Select a profile to load routing rules.
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
                  placeholder="Select profile"
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
          getRowId={(row: UserRouteRule) => String(row.id)}
          pagination={{
            pageSize: limit,
            pageIndex: page - 1,
            totalCount: meta?.totalItems ?? 0,
            onPageChange: (pageIndex) => setPage(pageIndex + 1),
            onPageSizeChange: (newSize) => {
              setLimit(newSize);
              setPage(1);
            },
          }}
          sorting={{
            sortBy: sortBy,
            sortOrder: sortOrder,
            onSortChange: (newSortBy, newSortOrder) => {
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
              setPage(1);
            },
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
            const response = await deleteUserMerchantRouting(routeToDelete.id);
            handleApiResponse(response, {
              onSuccess: () => {
                toast.success('Routing rule deleted successfully');
                fetchRoutings(page, limit, sortBy, sortOrder, selectedProfileId);
              },
              onError: (errorMessage) => {
                toast.error(errorMessage || 'Failed to delete routing rule');
              },
            });
          } catch {
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

