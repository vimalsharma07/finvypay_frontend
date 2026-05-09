'use client';

import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Link2, Eye, Pencil, Trash2 } from 'lucide-react';
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
  getUserCascadings,
  deleteUserCascading,
  updateUserCascadingStatus,
  CascadingRule,
  CascadingRuleListMeta,
  CascadingRuleListResponse,
} from '@/lib/services/admin/cascading';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getMerchantProfiles,
  type MerchantProfile,
} from '@/lib/services/admin/merchant-acquirer-account';
import { SearchSelect } from '@/components/ui/molecules/SearchSelect';
import { ContentLoader } from '@/components/common/content-loader';
import type { Option } from '@/lib/types/common-types';
import { ConfirmComp } from '../../../../../../components/confirm-comp';
import { useCursorPagination } from '@/lib/hooks/use-cursor-pagination';

export default function CascadingPage() {
  const params = useParams();
  const userId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [cascadings, setCascadings] = useState<CascadingRule[]>([]);
  const [meta, setMeta] = useState<CascadingRuleListMeta | null>(null);
  const [limit, setLimit] = useState(20);
  const { requestCursor, reset: resetCursor, goNext, goPrev, canGoPrev } =
    useCursorPagination();
  const [sortBy, setSortBy] = useState<string>('priority');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [profiles, setProfiles] = useState<MerchantProfile[]>([]);
  const [profileOptions, setProfileOptions] = useState<Option[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cascadeToDelete, setCascadeToDelete] = useState<CascadingRule | null>(null);

  const isTableLoading = loading || profilesLoading;

  const fetchCascadings = useCallback(async (
    cursor: string | undefined,
    pageLimit: number,
    sortField: string,
    sortDir: 'ASC' | 'DESC',
    profileId?: string,
  ) => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = {
        limit: pageLimit,
        sortBy: sortField,
        sortOrder: sortDir,
      };
      if (cursor) params.cursor = cursor;

      const response = await getUserCascadings(userId, params, profileId);

      handleApiResponse<CascadingRuleListResponse>(response, {
        onSuccess: (data) => {
          if (!data?.success) return;
          const list = Array.isArray(data.data) ? data.data : [];
          setCascadings(list);
          setMeta(data.meta ?? null);
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
  }, [userId]);

  useLayoutEffect(() => {
    if (selectedProfileId) resetCursor();
  }, [selectedProfileId, resetCursor]);

  useEffect(() => {
    if (userId && selectedProfileId) {
      fetchCascadings(requestCursor, limit, sortBy, sortOrder, selectedProfileId);
    }
  }, [userId, requestCursor, limit, sortBy, sortOrder, selectedProfileId, fetchCascadings]);

  // Fetch merchant profiles (reuse routing pattern)
  useEffect(() => {
    const loadProfiles = async () => {
      setProfilesLoading(true);
      try {
        const response = await getMerchantProfiles(userId);
        handleApiResponse(response, {
          onSuccess: (payload) => {
            if (!payload?.success || !payload.data) return;
            const list = Array.isArray(payload.data) ? payload.data : [];
            setProfiles(list);
            const options = list.map((p: MerchantProfile) => ({
              value: p.id.toString(),
              label: p.industry?.name || p.merchantProfileName || `Profile ${p.id}`,
            }));
            setProfileOptions(options);

            // Auto-select primary or first profile
            if (!selectedProfileId) {
              const primary = list.find((p: MerchantProfile) => p.isPrimary);
              if (primary) {
                setSelectedProfileId(primary.id.toString());
              } else if (list.length > 0) {
                setSelectedProfileId(list[0].id.toString());
              }
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
  }, [userId, selectedProfileId]);

  // Define table headers
  const headers: TableHeader<CascadingRule>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'connector_id', label: 'Main MID', sortable: false },
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
        return (
          <div className="text-sm">
            {item.connector?.name || item.connector_id || '-'}
          </div>
        );
      case 'cascading_for':
        const firstConfigName =
          Array.isArray(item.config) && item.config.length > 0
            ? item.config[0].merchantAcquirerAccountName ||
              item.config[0].connector_name ||
              '-'
            : '-';
        return <div className="text-sm">{firstConfigName}</div>;
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
                    fetchCascadings(requestCursor, limit, sortBy, sortOrder, selectedProfileId);
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
      label: 'View',
      icon: Eye,
      route: (row: CascadingRule) =>
        `/admin/user-management/merchant/${userId}/routing_cascading/cascading/${row.id}`,
    },
    {
      label: 'Edit',
      icon: Pencil,
      route: (row: CascadingRule) =>
        `/admin/user-management/merchant/${userId}/routing_cascading/cascading/${row.id}/edit`,
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (row: CascadingRule) => {
        setCascadeToDelete(row);
        setDeleteDialogOpen(true);
      },
      variant: 'destructive',
      separator: true,
    },
  ];

  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    resetCursor();
  };

  const handleSortChange = (newSortBy: string, newSortOrder: 'ASC' | 'DESC') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    resetCursor();
  };

  const handleCursorNext = useCallback(() => {
    if (meta?.nextCursor) goNext(meta.nextCursor);
  }, [meta?.nextCursor, goNext]);

  const handleCursorPrev = useCallback(() => {
    goPrev();
  }, [goPrev]);

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Cascading Rules"
            description="Create, edit, and manage cascading payment rules that automatically route transactions through multiple acquirers in sequence"
            icon={Link2}
          />
          <ToolbarActions>
            <Button
              variant="primary"
              onClick={() => {
                // Navigate to create cascading page
                window.location.href = `/admin/user-management/merchant/${userId}/routing_cascading/cascading/create`;
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Cascading Rule
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
                Select an industry to load cascading rules scoped to that profile.
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
                  }}
                  placeholder="Select profile (industry)"
                />
              )}
            </div>
          </div>
        </div>

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
      </Container>

      <ConfirmComp
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Cascading Rule"
        message={
          cascadeToDelete
            ? `Are you sure you want to delete cascading rule "${cascadeToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this cascading rule?'
        }
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (!cascadeToDelete) return;
          try {
            const response = await deleteUserCascading(userId, cascadeToDelete.id);
            handleApiResponse(response, {
              onSuccess: () => {
                toast.success('Cascading rule deleted successfully');
                fetchCascadings(requestCursor, limit, sortBy, sortOrder, selectedProfileId);
              },
              onError: (errorMessage) => {
                toast.error(errorMessage || 'Failed to delete cascading rule');
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

