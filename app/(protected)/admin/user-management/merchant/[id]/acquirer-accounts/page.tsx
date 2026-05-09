'use client';

import { Fragment, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Cpu, Eye, Pencil, Trash2, XCircle } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import {
  TableComp,
  TableHeader,
  TableAction,
} from '../../../../../components/table-comp';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getUserConnectors,
  MerchantAcquirerAccount,
  MerchantAcquirerAccountListMeta,
  MerchantAcquirerAccountListResponse,
} from '@/lib/services/admin/connectors';
import { softDeleteMerchantAcquirerAccount, rejectMerchantAcquirerAccount, RejectMerchantAcquirerAccountPayload, togglePrimaryMerchantAcquirerAccount, toggleActiveMerchantAcquirerAccount } from '@/lib/services/admin/acquirer-accounts';
import { getMerchantProfiles, MerchantProfile } from '@/lib/services/admin/merchant-acquirer-account';
import { getUserById, User } from '@/lib/services/admin/users';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { SearchSelect } from '@/components/ui/molecules/SearchSelect';
import type { Option } from '@/lib/types/common-types';
import Link from 'next/link';
import { useCursorPagination } from '@/lib/hooks/use-cursor-pagination';

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return '–';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function AcquirerAccountsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [connectors, setConnectors] = useState<MerchantAcquirerAccount[]>([]);
  const [meta, setMeta] = useState<MerchantAcquirerAccountListMeta | null>(null);
  const [limit, setLimit] = useState(20);
  const { requestCursor, reset: resetCursor, goNext, goPrev, canGoPrev } =
    useCursorPagination();
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<MerchantAcquirerAccount | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [accountToReject, setAccountToReject] = useState<MerchantAcquirerAccount | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [profiles, setProfiles] = useState<MerchantProfile[]>([]);
  const [profileOptions, setProfileOptions] = useState<Option[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [togglingPrimary, setTogglingPrimary] = useState<Record<string, boolean>>({});
  const [togglingActive, setTogglingActive] = useState<Record<string, boolean>>({});
  const [merchantUser, setMerchantUser] = useState<User | null>(null);

  // Fetch merchant user (name, email)
  useEffect(() => {
    const fetchMerchantUser = async () => {
      if (!userId) return;
      try {
        const response = await getUserById(userId);
        handleApiResponse<User>(response, {
          onSuccess: (data) => setMerchantUser(data),
        });
      } catch {
        // Non-blocking; page still works without merchant name
      }
    };
    fetchMerchantUser();
  }, [userId]);

  const fetchConnectors = useCallback(async (
    cursor: string | undefined,
    pageLimit: number,
    profileId: string | undefined,
    sortField: string,
    sortDir: 'ASC' | 'DESC',
  ) => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = {
        limit: pageLimit,
        userId: Number(userId),
        sortBy: sortField,
        sortOrder: sortDir,
      };
      if (cursor) params.cursor = cursor;
      if (profileId) params.merchantProfileId = Number(profileId);

      const response = await getUserConnectors(params);

      handleApiResponse<MerchantAcquirerAccountListResponse>(response, {
        onSuccess: (data) => {
          if (!data?.success) return;
          const list = Array.isArray(data.data) ? data.data : [];
          setConnectors(list);
          setMeta(data.meta ?? null);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to load acquirer accounts');
        },
      });
    } catch (error) {
      console.error('Fetch connectors error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch merchant profiles
  const fetchProfiles = async () => {
    if (!userId) return;
    
    setLoadingProfiles(true);
    try {
      const response = await getMerchantProfiles(userId);
      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data?.success && data.data) {
            const profilesList = Array.isArray(data.data) ? data.data : [];
            setProfiles(profilesList);
            
            // Transform profiles to options: display industry.name, store profile id
            const options: Option[] = profilesList.map((profile: MerchantProfile) => ({
              value: profile.id,
              label: profile.industry?.name || profile.merchantProfileName || `Profile ${profile.id}`,
            }));
            setProfileOptions(options);
            
            // Set first profile as default selected
            // The useEffect will automatically fetch connectors when selectedProfileId is set
            if (options.length > 0 && !selectedProfileId) {
              setSelectedProfileId(String(options[0].value));
            }
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to load merchant profiles');
        },
      });
    } catch (error) {
      console.error('Fetch profiles error:', error);
      toast.error('An unexpected error occurred while loading profiles');
    } finally {
      setLoadingProfiles(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfiles();
    }
  }, [userId]);

  useLayoutEffect(() => {
    if (selectedProfileId) resetCursor();
  }, [selectedProfileId, resetCursor]);

  useEffect(() => {
    if (userId && selectedProfileId) {
      fetchConnectors(requestCursor, limit, selectedProfileId, sortBy, sortOrder);
    }
  }, [userId, requestCursor, limit, selectedProfileId, sortBy, sortOrder, fetchConnectors]);

  // Define table headers
  const headers: TableHeader<MerchantAcquirerAccount>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'merchantProfileId', label: 'Industry', sortable: false },
    { key: 'terminalId', label: 'Terminal ID', sortable: true },
    { key: 'gateway', label: 'Acquirer', sortable: false },
    { key: 'acquirerAccount', label: 'Acquirer Account', sortable: false },
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
        // Display industry name from merchantProfile.industry.name or top-level industryName
        const industryName = 
          item.merchantProfile?.industry?.name || 
          (item as any).industryName || 
          '-';
        return (
          <div className="text-sm font-medium">
            {industryName}
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
          <div className="text-sm font-medium">
            {item.acquirer?.acquirerName || item.acquirer?.name || '-'}
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
        // Disable toggle if already primary (can't disable primary)
        // Allow toggle if not primary (can activate, backend will handle deactivating previous primary)
        const isDisabled = item.isPrimary || togglingPrimary[item.id] || !selectedProfileId;
        
        return (
          <Switch
            checked={item.isPrimary || false}
            disabled={isDisabled}
            onCheckedChange={async (checked) => {
              if (!selectedProfileId) {
                toast.error('Please select a merchant profile first');
                return;
              }
              
              // Can't disable primary (backend handles this, but prevent UI action)
              if (item.isPrimary && !checked) {
                toast.error('Cannot disable primary account. Activate another account to change primary status.');
                return;
              }

              // Only allow activating (setting to primary)
              if (!checked) {
                return;
              }

              setTogglingPrimary((prev) => ({ ...prev, [item.id]: true }));
              
              try {
                const response = await togglePrimaryMerchantAcquirerAccount(
                  item.id,
                  selectedProfileId
                );
                
                handleApiResponse(response, {
                  onSuccess: () => {
                    toast.success('Acquirer account set as primary successfully');
                    // Refetch data to get updated state (backend will have updated previous primary)
                    fetchConnectors(requestCursor, limit, selectedProfileId, sortBy, sortOrder);
                  },
                  onError: (errorMessage) => {
                    toast.error(errorMessage || 'Failed to update primary status');
                  },
                  onUnauthorized: () => {
                    toast.error('Unauthorized. Please check your authentication.');
                  },
                });
              } catch (error) {
                toast.error('An unexpected error occurred');
                console.error('Toggle primary error:', error);
              } finally {
                setTogglingPrimary((prev) => {
                  const updated = { ...prev };
                  delete updated[item.id];
                  return updated;
                });
              }
            }}
          />
        );
      case 'isActive':
        return (
          <Switch
            checked={item.isActive || false}
            disabled={togglingActive[item.id]}
            onCheckedChange={async (checked) => {
              setTogglingActive((prev) => ({ ...prev, [item.id]: true }));
              
              try {
                const response = await toggleActiveMerchantAcquirerAccount(item.id);
                
                handleApiResponse(response, {
                  onSuccess: () => {
                    toast.success(
                      checked 
                        ? 'Acquirer account activated successfully' 
                        : 'Acquirer account deactivated successfully'
                    );
                    // Refetch data to get updated state
                    if (selectedProfileId) {
                      fetchConnectors(requestCursor, limit, selectedProfileId, sortBy, sortOrder);
                    }
                  },
                  onError: (errorMessage) => {
                    toast.error(errorMessage || 'Failed to update active status');
                  },
                  onUnauthorized: () => {
                    toast.error('Unauthorized. Please check your authentication.');
                  },
                });
              } catch (error) {
                toast.error('An unexpected error occurred');
                console.error('Toggle active error:', error);
              } finally {
                setTogglingActive((prev) => {
                  const updated = { ...prev };
                  delete updated[item.id];
                  return updated;
                });
              }
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
      label: 'Reject Acquirer',
      icon: XCircle,
      onClick: (row: MerchantAcquirerAccount) => {
        setAccountToReject(row);
        setRejectDialogOpen(true);
      },
      variant: 'destructive',
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (row: MerchantAcquirerAccount) => {
        setAccountToDelete(row);
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

  // Handle reject acquirer account
  const handleRejectAcquirerAccount = async () => {
    if (!accountToReject || !rejectReason.trim()) return;

    setRejecting(true);
    try {
      const payload: RejectMerchantAcquirerAccountPayload = {
        adminRejectReason: rejectReason.trim(),
      };

      const response = await rejectMerchantAcquirerAccount(accountToReject.id, payload);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Acquirer account rejected successfully!');
          setRejectDialogOpen(false);
          setAccountToReject(null);
          setRejectReason('');
          // Refetch with current selected profile
          if (selectedProfileId) {
            fetchConnectors(requestCursor, limit, selectedProfileId, sortBy, sortOrder);
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to reject acquirer account');
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Reject acquirer account error:', error);
    } finally {
      setRejecting(false);
    }
  };

  // Handle soft delete acquirer account
  const handleSoftDeleteAcquirerAccount = async () => {
    if (!accountToDelete) return;

    setDeleting(true);
    try {
      const response = await softDeleteMerchantAcquirerAccount(accountToDelete.id);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Acquirer account deleted successfully!');
          setDeleteDialogOpen(false);
          setAccountToDelete(null);
          // Refetch with current selected profile
          if (selectedProfileId) {
            fetchConnectors(requestCursor, limit, selectedProfileId, sortBy, sortOrder);
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete acquirer account');
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Soft delete acquirer account error:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Assign Acquirer"
            description="Assign and manage payment gateway acquirer accounts and connectors for this merchant user's transaction processing"
            icon={Cpu}
          />
          <ToolbarActions>
            <Link href="/admin/user-management/merchant">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Merchant List
              </Button>
            </Link>
            <Button
              variant="primary"
              onClick={() => {
                router.push(`/admin/user-management/merchant/${userId}/acquirer-accounts/create`);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Acquirer Account
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <Card className="mb-6 border-border/60 bg-muted/30">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-11 w-11 shrink-0 border-2 border-background">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {getInitials(merchantUser?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{merchantUser?.name ?? '–'}</p>
                  <p className="text-sm text-muted-foreground truncate">{merchantUser?.email ?? '–'}</p>
                </div>
              </div>
              <div className="sm:ml-auto w-full sm:w-64 shrink-0 space-y-1.5">
                <Label htmlFor="profile-select" className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  Merchant Profile
                </Label>
                <SearchSelect
                  options={profileOptions}
                  value={selectedProfileId}
                  onChange={(value) => {
                    setSelectedProfileId(value);
                  }}
                  placeholder={loadingProfiles ? 'Loading profiles...' : 'Select a profile'}
                  disabled={loadingProfiles || profileOptions.length === 0}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <TableComp
          data={connectors}
          headers={headers}
          renderCell={renderCell}
          actions={actions}
          enableCheckbox={false}
          searchPlaceholder="Search acquirer accounts..."
          searchKeys={['name', 'merchantProfileId', 'terminalId']}
          getRowId={(row: MerchantAcquirerAccount) => String(row.id)}
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
          loading={loading}
        />
      </Container>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Acquirer Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete acquirer account &quot;{accountToDelete?.name}&quot;? This action will soft delete the account and it can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSoftDeleteAcquirerAccount}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Acquirer Account Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Acquirer Account</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting the acquirer account &quot;{accountToReject?.name}&quot;.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reject-reason">Rejection Reason</Label>
              <Textarea
                id="reject-reason"
                placeholder="Please provide a detailed reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[100px]"
                disabled={rejecting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={rejecting}
              onClick={() => {
                setRejectDialogOpen(false);
                setAccountToReject(null);
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectAcquirerAccount}
              disabled={rejecting || !rejectReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {rejecting ? 'Rejecting...' : 'Reject Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}

