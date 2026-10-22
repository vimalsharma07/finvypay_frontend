'use client';

import React, { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Link2, Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  TableComp,
  TableHeader,
  TableAction,
} from '../../components/table-comp';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ConfirmComp } from '../../components/confirm-comp';
import { toast } from 'sonner';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getUserMerchantCascading,
  deleteUserMerchantCascading,
  updateUserMerchantCascadingStatus,
  UserCascadingRule,
  UserCascadingListResponse,
} from '@/lib/services/user/cascading';
import { getUserProfileId, getMerchantProfiles } from '@/lib/services/user/merchant-profile';
import { useAuth } from '@/hooks/use-auth';
import { useCursorPagination } from '@/lib/hooks/use-cursor-pagination';
import type { CursorPaginationMeta } from '@/lib/types/pagination';

export function UserCascadingPageContent() {
  const { user } = useAuth();

  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [cascades, setCascades] = useState<UserCascadingRule[]>([]);
  const [meta, setMeta] = useState<CursorPaginationMeta | null>(null);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<string>('priority');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [profileId, setProfileId] = useState<string | null>(null);
  const { requestCursor, reset: resetCursor, goNext, goPrev, canGoPrev } =
    useCursorPagination();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cascadeToDelete, setCascadeToDelete] = useState<UserCascadingRule | null>(null);

  const isTableLoading = loading || profilesLoading;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchCascading = useCallback(
    async (
      cursor: string | undefined,
      pageLimit: number,
      sortField: string,
      sortDir: 'ASC' | 'DESC',
      activeProfileId?: string,
    ) => {
      if (!activeProfileId) return;
      setLoading(true);
      try {
        const response = await getUserMerchantCascading({
          ...(cursor ? { cursor } : {}),
          limit: pageLimit,
          sortBy: sortField,
          sortOrder: sortDir,
          profileId: activeProfileId,
        });

        handleApiResponse<UserCascadingListResponse>(response, {
          onSuccess: (data) => {
            if (!data?.success) return;

            const list = Array.isArray(data.data) ? data.data : [];

            const normalized = list.map((item: any) => ({
              ...item,
              cascadingFor: item.cascadingFor ?? item.cascading_for ?? item.type,
              status: Boolean(item.status),
              connectorName: item.connector?.name ?? 'Not Assigned',
            }));

            setCascades(normalized as UserCascadingRule[]);
            setMeta(data.meta ?? null);
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load cascading rules');
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

  // Resolve default profile from header (user.merchantProfiles primary/first)
  useEffect(() => {
    const resolveProfile = async () => {
      setProfilesLoading(true);
      try {
        // Use same default as header: primary or first profile from user
        const id = getUserProfileId(null, user);
        if (id) {
          setProfileId(id);
          setProfilesLoading(false);
          return;
        }
        // Fallback: fetch from API if user doesn't have merchantProfiles yet
        const response = await getMerchantProfiles();
        handleApiResponse(response, {
          onSuccess: (payload) => {
            if (!payload?.success || !payload.data) return;
            const list = Array.isArray(payload.data) ? payload.data : [];
            if (list.length > 0) {
              const primary = list.find((p: any) => p.isPrimary);
              const nextId = (primary?.id ?? list[0]?.id)?.toString() || null;
              setProfileId(nextId);
            }
          },
          onError: () => {
            // Silently fail - profileId stays null
          },
        });
      } catch {
        // ignore
      } finally {
        setProfilesLoading(false);
      }
    };

    resolveProfile();
  }, [user]);

  useLayoutEffect(() => {
    if (profileId) {
      resetCursor();
    }
  }, [profileId, resetCursor]);

  useEffect(() => {
    if (profileId) {
      fetchCascading(requestCursor, limit, sortBy, sortOrder, profileId);
    }
  }, [profileId, requestCursor, limit, sortBy, sortOrder, fetchCascading]);

  const headers: TableHeader<UserCascadingRule>[] = useMemo(
    () => [
      { key: 'name', label: 'Path Name', sortable: false },
      { key: 'priority', label: 'Priority', sortable: true },
      { key: 'type', label: 'Type', sortable: false },
      { key: 'connectorName', label: 'Primary MID', sortable: false },
      { key: 'cascadingFor', label: 'Backup For', sortable: false },
      { key: 'status', label: 'Active', sortable: false },
    ],
    [],
  );

  const renderCell = (item: UserCascadingRule, key: keyof UserCascadingRule | string) => {
    switch (key) {
      case 'name':
        return <div className="font-semibold text-foreground">{item.name}</div>;
      case 'priority':
        return (
          <Badge variant="secondary" className="rounded-lg font-mono">
            {item.priority}
          </Badge>
        );
      case 'connectorName':
        return (
          <div className="text-sm">
            {item.connector?.name ?? (item as any).connectorName ?? '-'}
          </div>
        );
      case 'cascadingFor':
        const firstConfigName =
          Array.isArray(item.config) && item.config.length > 0
            ? item.config[0].merchantAcquirerAccountName ?? '-'
            : '-';
        return <div className="text-sm">{firstConfigName}</div>;
      case 'status':
        return (
          <Switch
            checked={item.status}
            onCheckedChange={async (checked) => {
              try {
                const response = await updateUserMerchantCascadingStatus(
                  item.id,
                  checked,
                );
                handleApiResponse(response, {
                  onSuccess: () => {
                    toast.success('Cascading status updated');
                    fetchCascading(
                      requestCursor,
                      limit,
                      sortBy,
                      sortOrder,
                      profileId ?? undefined,
                    );
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
      case 'type':
        return (
          <Badge variant="outline" className="rounded-lg border-sky-200 capitalize text-sky-700 dark:border-sky-800 dark:text-sky-300">
            {item.type ?? '-'}
          </Badge>
        );
      default:
        const value = item[key as keyof UserCascadingRule];
        return <div className="text-foreground font-normal">{value != null ? String(value) : '-'}</div>;
    }
  };

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

  const handleSortChange = useCallback(
    (newSortBy: string, newSortOrder: 'ASC' | 'DESC') => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
      resetCursor();
    },
    [resetCursor],
  );

  const actions: TableAction<UserCascadingRule>[] = [
    {
      label: 'View',
      icon: Eye,
      route: (row: UserCascadingRule) => `/cascading/${row.id}`,
    },
    {
      label: 'Edit',
      icon: Pencil,
      route: (row: UserCascadingRule) => `/cascading/${row.id}/edit`,
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (row: UserCascadingRule) => {
        setCascadeToDelete(row);
        setDeleteDialogOpen(true);
      },
      variant: 'destructive',
      separator: true,
    },
  ];

  if (!isClient) {
    return (
      <Container>
        <div className="flex items-center gap-1 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading cascading rules...</span>
        </div>
      </Container>
    );
  }

  return (
    <Fragment>
      <Container>
        <div className="relative mb-4 overflow-hidden rounded-2xl border border-sky-200/70 bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_55%,#e0f2fe_100%)] p-4 dark:border-sky-900/50 dark:bg-[linear-gradient(135deg,#0c1a24_0%,#0f172a_55%,#082f49_100%)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700/80 dark:text-sky-300/80">
            Failover paths
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep backup bank partners ready when the primary path cannot process.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-sky-100 bg-card shadow-sm ring-1 ring-sky-500/5 dark:border-sky-900/40">
          <TableComp
            data={cascades}
            headers={headers}
            renderCell={renderCell}
            actions={actions}
            enableCheckbox={false}
            searchPlaceholder="Search failover paths..."
            searchKeys={['name']}
            getRowId={(row: UserCascadingRule) => String(row.id)}
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
            sorting={{
              sortBy: sortBy,
              sortOrder: sortOrder,
              onSortChange: handleSortChange,
            }}
            loading={isTableLoading}
          />
        </div>
      </Container>
      <ConfirmComp
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Failover Path"
        message={
          cascadeToDelete
            ? `Delete failover path "${cascadeToDelete.name}"? This cannot be undone.`
            : 'Delete this failover path? This cannot be undone.'
        }
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (!cascadeToDelete) return;
          try {
            const response = await deleteUserMerchantCascading(cascadeToDelete.id);
            handleApiResponse(response, {
              onSuccess: () => {
                toast.success('Cascading rule deleted successfully');
                fetchCascading(
                  requestCursor,
                  limit,
                  sortBy,
                  sortOrder,
                  profileId ?? undefined,
                );
              },
              onError: (errorMessage) => {
                toast.error(errorMessage || 'Failed to delete cascading rule');
              },
            });
          } catch {
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

