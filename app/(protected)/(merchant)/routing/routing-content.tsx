'use client';

import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';
import {
  TableComp,
  TableHeader,
} from '../../components/table-comp';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ConfirmComp } from '../../components/confirm-comp';
import { toast } from 'sonner';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getUserMerchantRoutings,
  deleteUserMerchantRouting,
  updateUserMerchantRoutingStatus,
  UserRouteRule,
  UserRouteRuleListResponse,
  UserRouteRuleListMeta,
} from '@/lib/services/user/routing';
import type { TableAction } from '../../components/table-comp';
import { useAuth } from '@/hooks/use-auth';
import { SearchSelect } from '@/components/ui/molecules/SearchSelect';
import { ContentLoader } from '@/components/common/content-loader';
import type { Option } from '@/lib/types/common-types';
import {
  getMerchantProfiles,
  type MerchantProfileListResponse,
} from '@/lib/services/user/merchant-profile';
import { useCursorPagination } from '@/lib/hooks/use-cursor-pagination';

export function UserRoutingPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [profileList, setProfileList] = useState<
    Array<{ id: number | string; merchantProfileName?: string; industry?: { name?: string }; isPrimary?: boolean }>
  >([]);
  const [profileOptions, setProfileOptions] = useState<Option[]>([]);

  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<UserRouteRule[]>([]);
  const [meta, setMeta] = useState<UserRouteRuleListMeta | null>(null);
  const { requestCursor, reset: resetCursor, goNext, goPrev, canGoPrev } =
    useCursorPagination();
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<string>('priority');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<UserRouteRule | null>(null);

  const isTableLoading = loading || profilesLoading;
  const userId = user?.id?.toString() || '';

  // Fetch routing rules (user-scoped service)
  const fetchRoutings = useCallback(
    async (
      cursor: string | undefined,
      pageLimit: number,
      sortField: string,
      sortDir: 'ASC' | 'DESC',
      profileId?: string,
    ) => {
      if (!userId) return;
      setLoading(true);
      try {
        const params: Record<string, string | number | undefined> = {
          ...(cursor ? { cursor } : {}),
          limit: pageLimit,
          sortBy: sortField,
          sortOrder: sortDir,
          ...(profileId && { profileId: Number(profileId) }),
        };

        const response = await getUserMerchantRoutings(params);

        handleApiResponse<UserRouteRuleListResponse>(response, {
          onSuccess: (data) => {
            if (!data?.success) return;
            const list = Array.isArray(data.data)
              ? data.data
              : (data.data as { data?: UserRouteRule[] })?.data ?? [];
            const metaData =
              data.meta ?? (data.data as { meta?: UserRouteRuleListMeta })?.meta ?? null;
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
    },
    [userId],
  );

  useEffect(() => {
    if (userId && selectedProfileId) {
      fetchRoutings(requestCursor, limit, sortBy, sortOrder, selectedProfileId);
    }
  }, [userId, requestCursor, limit, sortBy, sortOrder, selectedProfileId, fetchRoutings]);

  const handleCursorNext = useCallback(() => {
    if (meta?.nextCursor) goNext(meta.nextCursor);
  }, [meta?.nextCursor, goNext]);

  const handleCursorPrev = useCallback(() => {
    goPrev();
  }, [goPrev]);

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

  // Fetch merchant profiles from API (same source as header badge)
  useEffect(() => {
    const loadProfiles = async () => {
      setProfilesLoading(true);
      try {
        const resp = await getMerchantProfiles();
        if (resp.status === 200) {
          const payload = resp.data as MerchantProfileListResponse | undefined;
          if (payload?.success && Array.isArray(payload.data)) {
            setProfileList(payload.data as any[]);
          }
        }
      } catch {
        // ignore and fall back to user/localStorage
      } finally {
        setProfilesLoading(false);
      }
    };
    loadProfiles();
  }, []);

  useEffect(() => {
    const options: Option[] = profileList
      .map((p) => ({
        value: p?.id?.toString?.() ?? String(p?.id ?? ''),
        label:
          (p as any)?.industryName ||
          p?.industry?.name ||
          p?.merchantProfileName ||
          (p?.id != null ? `Profile ${p.id}` : 'Profile'),
      }))
      .filter((o) => Boolean(o.value));
    setProfileOptions(options);

    if (!selectedProfileId && profileList.length > 0) {
      const primary = profileList.find((p) => p.isPrimary);
      const nextProfileId = (primary?.id ?? profileList[0]?.id)?.toString() || '';
      if (nextProfileId) {
        setSelectedProfileId(nextProfileId);
        resetCursor();
      }
    }
  }, [profileList, selectedProfileId, resetCursor]);

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
      case 'viewRoute':
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
      case 'routingFor':
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
                const response = await updateUserMerchantRoutingStatus(
                  item.id,
                  checked,
                );
                handleApiResponse(response, {
                  onSuccess: () => {
                    toast.success('Routing status updated');
                    fetchRoutings(requestCursor, limit, sortBy, sortOrder, selectedProfileId);
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
      case 'isCascade':
        return (
          <Badge variant={item.isCascade ? 'success' : 'secondary'}>
            {item.isCascade ? 'Yes' : 'No'}
          </Badge>
        );
      case 'splitEnable':
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
      icon: Eye,
      route: (row: UserRouteRule) => `/routing/${row.id}`,
    },
    {
      label: 'Edit',
      icon: Pencil,
      route: (row: UserRouteRule) => `/routing/${row.id}/edit`,
    },
    {
      label: 'Delete',
      icon: Trash2,
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
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <ContentLoader />
                  <span>Loading profiles...</span>
                </div>
              ) : (
                <SearchSelect
                  options={profileOptions}
                  value={selectedProfileId}
                  onChange={(val) => {
                    setSelectedProfileId(val);
                    resetCursor();
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
          getRowId={(row: UserRouteRule) => String(row.id)}
          pagination={{
            pageSize: limit,
            pageIndex: 0,
            onPageSizeChange: (newSize) => {
              setLimit(newSize);
              resetCursor();
            },
          }}
          cursorPagination={{
            meta,
            onNext: handleCursorNext,
            onPrev: handleCursorPrev,
            canGoPrev,
          }}
          sorting={{
            sortBy: sortBy,
            sortOrder: sortOrder,
            onSortChange: (newSortBy, newSortOrder) => {
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
              resetCursor();
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
                fetchRoutings(requestCursor, limit, sortBy, sortOrder, selectedProfileId);
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

