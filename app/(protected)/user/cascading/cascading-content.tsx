'use client';

import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, Eye, Pencil, Trash2 } from 'lucide-react';
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
  TableAction,
} from '../../components/table-comp';
import { Badge } from '@/components/ui/badge';
import { SearchSelect } from '@/components/ui/molecules/SearchSelect';
import { ContentLoader } from '@/components/common/content-loader';
import { ConfirmComp } from '../../components/confirm-comp';
import { toast } from 'sonner';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getUserMerchantCascading,
  deleteUserMerchantCascading,
  UserCascadingRule,
  UserCascadingListResponse,
  UserCascadingListMeta,
} from '@/lib/services/user/cascading';
import type { Option } from '@/lib/types/common-types';
import { useAuth } from '@/hooks/use-auth';

export function UserCascadingPageContent() {
  const router = useRouter();
  const { user } = useAuth();

  const [isClient, setIsClient] = useState(false);
  const [profileList, setProfileList] = useState<
    Array<{ id: number | string; merchantProfileName?: string; industry?: { name?: string }; isPrimary?: boolean }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [cascades, setCascades] = useState<UserCascadingRule[]>([]);
  const [meta, setMeta] = useState<UserCascadingListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<string>('priority');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [profileOptions, setProfileOptions] = useState<Option[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cascadeToDelete, setCascadeToDelete] = useState<UserCascadingRule | null>(null);

  const isTableLoading = loading || profilesLoading;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchCascading = async (
    pageNum: number,
    pageLimit: number,
    sortField: string,
    sortDir: 'ASC' | 'DESC',
    profileId?: string,
  ) => {
    if (!profileId) return;
    setLoading(true);
    try {
      const params: any = {
        page: pageNum,
        limit: pageLimit,
        sortBy: sortField,
        sortOrder: sortDir,
        ...(profileId && { profileId }),
      };

      const response = await getUserMerchantCascading(params);

      handleApiResponse<UserCascadingListResponse>(response, {
        onSuccess: (data) => {
          if (!data?.success) return;

          const list = Array.isArray(data.data) ? data.data : (data.data?.data ?? []);
          const metaData = data.meta ?? (data.data as any)?.meta ?? null;

          const normalized = list.map((item: any) => ({
            ...item,
            cascadingFor: item.cascadingFor ?? item.cascading_for ?? item.type,
            status: Boolean(item.status),
            connectorName: item.connector?.name ?? 'Not Assigned',
          }));

          setCascades(normalized as UserCascadingRule[]);
          setMeta(metaData);
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
  };

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
      label: p.industry?.name || p.merchantProfileName || `Profile ${p.id}`,
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

  useEffect(() => {
    if (selectedProfileId) {
      fetchCascading(page, limit, sortBy, sortOrder, selectedProfileId);
    }
  }, [selectedProfileId, page, limit, sortBy, sortOrder]);

  const headers: TableHeader<UserCascadingRule>[] = useMemo(
    () => [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'priority', label: 'Priority', sortable: true },
      { key: 'connectorName', label: 'Connector', sortable: false },
      { key: 'cascadingFor', label: 'Cascading For', sortable: true },
      { key: 'status', label: 'Status', sortable: false },
      { key: 'type', label: 'Type', sortable: false },
    ],
    [],
  );

  const renderCell = (item: UserCascadingRule, key: keyof UserCascadingRule | string) => {
    switch (key) {
      case 'name':
        return <div className="font-medium">{item.name}</div>;
      case 'priority':
        return (
          <Badge variant="secondary" className="font-mono">
            {item.priority}
          </Badge>
        );
      case 'connectorName':
        return <div className="text-sm">{(item as any).connectorName || 'Not Assigned'}</div>;
      case 'cascadingFor':
        return (
          <Badge variant="outline" className="capitalize">
            {item.cascadingFor ?? '-'}
          </Badge>
        );
      case 'status':
        return (
          <Badge variant={item.status ? 'success' : 'secondary'}>
            {item.status ? 'Active' : 'Inactive'}
          </Badge>
        );
      case 'type':
        return <div className="text-sm capitalize">{item.type || '-'}</div>;
      default:
        const value = item[key as keyof UserCascadingRule];
        return <div className="text-foreground font-normal">{value != null ? String(value) : '-'}</div>;
    }
  };

  const actions: TableAction<UserCascadingRule>[] = [
    {
      label: 'View',
      icon: Eye,
      route: (row: UserCascadingRule) => `/user/cascading/${row.id}`,
    },
    {
      label: 'Edit',
      icon: Pencil,
      route: (row: UserCascadingRule) => `/user/cascading/${row.id}/edit`,
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
        <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <ContentLoader />
          <span>Loading cascading rules...</span>
        </div>
      </Container>
    );
  }

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarActions>
            <Button
              variant="primary"
              onClick={() => router.push(`/user/cascading/create?profileId=${selectedProfileId}`)}
              disabled={!selectedProfileId}
            >
              Create Cascading
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">Merchant Profile</p>
              <p className="text-xs text-muted-foreground">Select a profile to load cascading rules.</p>
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
          data={cascades}
          headers={headers}
          renderCell={renderCell}
          actions={actions}
          enableCheckbox={false}
          searchPlaceholder="Search cascading rules..."
          searchKeys={['name']}
          getRowId={(row: UserCascadingRule) => String(row.id)}
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
            const response = await deleteUserMerchantCascading(cascadeToDelete.id);
            handleApiResponse(response, {
              onSuccess: () => {
                toast.success('Cascading rule deleted successfully');
                fetchCascading(page, limit, sortBy, sortOrder, selectedProfileId);
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

