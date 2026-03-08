'use client';

import { Fragment, useEffect, useState, useRef } from 'react';
import { Pencil, Eye, Plug, Route, Trash2, Percent, Shield, Lock, Copy, LogIn } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  getUsers,
  deleteUser,
  disableUser2Fa,
  updateUser,
  impersonateUser,
  User,
  UserListResponse,
} from '@/lib/services/admin/users';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  TableComp,
  TableHeader,
  TableAction,
} from '../../../components/table-comp';
import { Badge } from '@/components/ui/badge';
import { ConfirmComp } from '../../../components/confirm-comp';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { getUserConnectors, MerchantAcquirerAccount } from '@/lib/services/admin/connectors';
import { getMerchantProfiles } from '@/lib/services/admin/merchant-acquirer-account';

interface MerchantUsersPageContentProps {
  filters?: Record<string, string>;
}

export function MerchantUsersPageContent({ filters: externalFilters = {} }: MerchantUsersPageContentProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<UserListResponse['meta'] | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Sorting state
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // Reset 2FA dialog state
  const [reset2FaDialogOpen, setReset2FaDialogOpen] = useState(false);
  const [userToReset2Fa, setUserToReset2Fa] = useState<User | null>(null);
  const [resetting2Fa, setResetting2Fa] = useState(false);
  
  // Security dialog state
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [userForSecurity, setUserForSecurity] = useState<User | null>(null);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [updatingBinEnabled, setUpdatingBinEnabled] = useState(false);
  const [binEnabled, setBinEnabled] = useState<boolean | null>(null);
  const [otpCopied, setOtpCopied] = useState(false);
  
  // Use external filters prop
  const filters = externalFilters;

  // Impersonate: pending auth for the new window (postMessage flow)
  const impersonatePendingRef = useRef<{ type: string; payload: any } | null>(null);
  const impersonatePopupRef = useRef<Window | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== (typeof window !== 'undefined' ? window.location.origin : '')) return;
      const { type } = event.data || {};
      if (type !== 'impersonate-ready') return;
      const pending = impersonatePendingRef.current;
      if (!pending || !event.source) return;
      try {
        (event.source as Window).postMessage(pending, event.origin);
      } finally {
        impersonatePendingRef.current = null;
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, []);

  // Fetch users function
  const fetchUsers = async (
    pageNum: number,
    pageLimit: number,
    sortField: string,
    sortDir: 'ASC' | 'DESC',
    filterParams?: Record<string, string>
  ) => {
    setLoading(true);
    try {
      const params: any = {
        page: pageNum,
        limit: pageLimit,
        sortBy: sortField,
        sortOrder: sortDir,
        role: 'merchant', // Use merchant role for merchant users page
      };

      // Add filter parameters if provided
      if (filterParams) {
        if (filterParams.name) params.search = filterParams.name;
        if (filterParams.email) params.email = filterParams.email;
        // Override default role if filter role is provided
        if (filterParams.role) {
          params.role = filterParams.role;
        }
        if (filterParams.status) {
          params.isBlocked = filterParams.status === 'blocked';
        }
      }

      const response = await getUsers(params);
      console.log('Response:', response);

      // Handle response using centralized handler
      handleApiResponse<UserListResponse>(response, {
        onSuccess: (data) => {
          if (data.success) {
            // New format: { success: true, data: [...], meta: {...} }
            setUsers(data.data);
            setMeta(data.meta);
            console.log('Users list:', data.data);
            console.log('Meta info:', data.meta);
          } else {
            console.warn('⚠️ API returned success=false:', data);
          }
        },
        onValidationError: (errors, messages) => {
          console.error('Validation errors:', errors);
        },
        onUnauthorized: () => {
          console.log('Please check your TOKEN in .env file');
        },
      });
    } catch (error) {
      console.error('❌ Network/Request error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalFilters]);

  // Fetch when pagination, sorting, limit, or filters change
  useEffect(() => {
    fetchUsers(page, limit, sortBy, sortOrder, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, sortBy, sortOrder, externalFilters]);

  // Handle page change
  const handlePageChange = (pageIndex: number) => {
    setPage(pageIndex + 1); // API uses 1-based, table uses 0-based
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    setPage(1); // Reset to first page
  };

  // Handle sort change
  const handleSortChange = (newSortBy: string, newSortOrder: 'ASC' | 'DESC') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1); // Reset to first page when sorting changes
  };


  // Define table headers
  const headers: TableHeader<User>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'isBlocked', label: 'Status', sortable: true },
    { key: 'createdAt', label: 'Created At', sortable: true },
  ];

  // Render cell function - handles all cell rendering dynamically
  const renderCell = (item: User, key: keyof User | string) => {
    switch (key) {
      case 'name':
        return <div className="font-medium">{item.name}</div>;
      case 'email':
        return <div className="text-muted-foreground">{item.email}</div>;
      case 'role':
        return (
          <Badge variant="secondary" className="capitalize">
            {item.role}
          </Badge>
        );
      case 'isBlocked':
        return (
          <Badge
            variant={item.isBlocked ? 'destructive' : 'success'}
            className="capitalize"
          >
            {item.isBlocked ? 'Blocked' : 'Active'}
          </Badge>
        );
      case 'createdAt':
        const date = new Date(item.createdAt);
        return (
          <div className="text-sm text-muted-foreground">
            {date.toLocaleDateString()}
          </div>
        );
      default:
        const value = item[key as keyof User];
        return (
          <div className="text-foreground font-normal">
            {value != null ? String(value) : '-'}
          </div>
        );
    }
  };

  // Delete user handler
  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await deleteUser(userId);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Merchant deleted successfully!');
          // Immediately refetch merchants list to update the table
          fetchUsers(page, limit, sortBy, sortOrder, filters);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete merchant');
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Delete user error:', error);
    }
  };

  // Reset 2FA handler
  const handleReset2Fa = async (userId: string) => {
    setResetting2Fa(true);
    try {
      const response = await disableUser2Fa(userId);
      handleApiResponse(response, {
        onSuccess: (data) => {
          toast.success(data?.message || 'Two-Factor Authentication reset successfully!');
          // Immediately refetch merchants list to update the table
          fetchUsers(page, limit, sortBy, sortOrder, filters);
          setReset2FaDialogOpen(false);
          setUserToReset2Fa(null);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to reset Two-Factor Authentication');
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Reset 2FA error:', error);
    } finally {
      setResetting2Fa(false);
    }
  };

  // Fetch security settings (BIN enabled status)
  const fetchSecuritySettings = async (userId: string) => {
    setLoadingSecurity(true);
    setBinEnabled(null);
    
    try {
      // First, get merchant profiles to get the first profile ID
      const profilesResponse = await getMerchantProfiles(userId);
      
      handleApiResponse(profilesResponse, {
        onSuccess: async (data) => {
          if (data?.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
            const firstProfile = data.data[0];
            const profileId = firstProfile.id;
            
            // Fetch acquirer accounts with the first profile
            const params: any = {
              page: 1,
              limit: 20,
              userId: userId,
              merchantProfileId: profileId,
            };
            
            try {
              const connectorsResponse = await getUserConnectors(params);
              
              handleApiResponse(connectorsResponse, {
                onSuccess: (connectorsData) => {
                  if (connectorsData?.success && connectorsData.data) {
                    const accounts = Array.isArray(connectorsData.data) 
                      ? connectorsData.data 
                      : connectorsData.data.data || [];
                    
                    // binEnabled is a user property, check if it's in the response
                    // The API response might have user object with binEnabled
                    // Or check the first account's user property
                    if (accounts.length > 0) {
                      const account = accounts[0] as any;
                      // Check if binEnabled is directly on account, or in user object
                      const enabled = account.binEnabled ?? account.user?.binEnabled ?? false;
                      setBinEnabled(enabled);
                    } else {
                      // If no accounts, try to get from user directly
                      // For now, set to false
                      setBinEnabled(false);
                    }
                  } else {
                    setBinEnabled(false);
                  }
                },
                onError: (errorMessage) => {
                  toast.error(errorMessage || 'Failed to load security settings');
                  setBinEnabled(false);
                },
              });
            } catch (error) {
              console.error('Fetch connectors error:', error);
              setBinEnabled(false);
            }
          } else {
            setBinEnabled(false);
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to load merchant profiles');
          setBinEnabled(false);
        },
      });
    } catch (error) {
      console.error('Fetch security settings error:', error);
      toast.error('An unexpected error occurred while loading security settings');
      setBinEnabled(false);
    } finally {
      setLoadingSecurity(false);
    }
  };

  // Handle security dialog open
  const handleSecurityClick = (user: User) => {
    setUserForSecurity(user);
    setSecurityDialogOpen(true);
    fetchSecuritySettings(user.id);
  };

  const handleCopyOtp = async () => {
    if (!userForSecurity?.otp) return;
    try {
      await navigator.clipboard.writeText(userForSecurity.otp);
      setOtpCopied(true);
      toast.success('OTP copied to clipboard');
      setTimeout(() => setOtpCopied(false), 2000);
    } catch (error) {
      console.error('Copy OTP error:', error);
      toast.error('Failed to copy OTP');
    }
  };

  // Handle BIN enabled toggle
  const handleBinEnabledToggle = async (checked: boolean) => {
    if (!userForSecurity) return;

    setUpdatingBinEnabled(true);
    try {
      const response = await updateUser(userForSecurity.id, {
        binEnabled: checked,
      });

      handleApiResponse<User>(response, {
        onSuccess: (userData) => {
          setBinEnabled(checked);
          toast.success(
            checked
              ? 'Bin Check enabled successfully'
              : 'Bin Check disabled successfully'
          );
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update Bin Check status');
          // Revert the checkbox state on error
          setBinEnabled(!checked);
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
          setBinEnabled(!checked);
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Update binEnabled error:', error);
      setBinEnabled(!checked);
    } finally {
      setUpdatingBinEnabled(false);
    }
  };

  // Login as User (impersonate): call API, open new window, pass auth via postMessage
  const handleLoginAsUser = async (user: User) => {
    impersonatePendingRef.current = null;
    impersonatePopupRef.current = null;
    try {
      const response = await impersonateUser(user.id);
      handleApiResponse(response, {
        onSuccess: (data) => {
          if (!data?.success || !data.data?.accessToken) {
            toast.error('Invalid response from server. Cannot sign in as user.');
            return;
          }
          const url = '/auth/impersonate-callback';
          const popup = window.open(url, '_blank', 'width=520,height=400');
          if (popup) {
            impersonatePopupRef.current = popup;
            impersonatePendingRef.current = { type: 'impersonate-auth', payload: data };
            toast.success(`Opening new window to sign in as ${user.name || user.email}…`);
          } else {
            toast.error('Popup was blocked. Please allow popups for this site and try again.');
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to sign in as user.');
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. You do not have permission to impersonate users.');
        },
      });
    } catch (err) {
      toast.error('Failed to sign in as user.');
    }
  };

  // Define actions
  const actions: TableAction<User>[] = [
    {
      label: 'Edit',
      icon: Pencil,
      route: (row: User) => `/admin/user-management/merchant/${row.id}/edit`,
    },
    {
      label: 'View',
      icon: Eye,
      route: (row: User) => `/admin/user-management/merchant/${row.id}`,
    },
    {
      label: 'Login as User',
      icon: LogIn,
      onClick: (row: User) => handleLoginAsUser(row),
    },
    {
      label: 'Assign Acquirer',
      icon: Plug,
      route: (row: User) => `/admin/user-management/merchant/${row.id}/acquirer-accounts`,
      separator: true,
    },
    {
      label: 'Routing & Cascading',
      icon: Route,
      route: (row: User) => `/admin/user-management/merchant/${row.id}/routing_cascading`,
      separator: true,
    },
    {
      label: 'Assign Rate',
      icon: Percent,
      route: (row: User) => `/admin/user-management/merchant/assign-rates/${row.id}`,
      separator: true,
    },
    {
      label: 'Security',
      icon: Lock,
      onClick: (row: User) => {
        handleSecurityClick(row);
      },
      separator: true,
    },
    {
      label: 'Reset Two-Factor Authentication',
      icon: Shield,
      onClick: (row: User) => {
        setUserToReset2Fa(row);
        setReset2FaDialogOpen(true);
      },
      separator: true,
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (row: User) => {
        setUserToDelete(row);
        setDeleteDialogOpen(true);
      },
      variant: 'destructive',
      separator: true,
    },
  ];

  return (
    <Fragment>
      <Container>
        <TableComp
          data={users}
          headers={headers}
          renderCell={renderCell}
          actions={actions}
          enableCheckbox={false}
          searchPlaceholder="Search merchants..."
          searchKeys={['name', 'email', 'role']}
          getRowId={(row: User) => row.id}
          pagination={{
            pageSize: limit,
            pageIndex: page - 1, // Convert to 0-based for table
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

      {/* Delete Confirmation Dialog */}
      <ConfirmComp
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Merchant"
        message={`Are you sure you want to delete merchant "${userToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (userToDelete) {
            await handleDeleteUser(userToDelete.id);
            setUserToDelete(null);
          }
        }}
        onCancel={() => {
          setUserToDelete(null);
        }}
      />

      {/* Reset 2FA Confirmation Dialog */}
      <ConfirmComp
        open={reset2FaDialogOpen}
        onOpenChange={setReset2FaDialogOpen}
        title="Reset Two-Factor Authentication"
        message={`Are you sure you want to reset Two-Factor Authentication for merchant "${userToReset2Fa?.name}" (${userToReset2Fa?.email})? This will disable 2FA for their account and they will need to set it up again.`}
        confirmLabel={resetting2Fa ? "Resetting..." : "Yes, Reset 2FA"}
        cancelLabel="Cancel"
        onConfirm={async () => {
          if (userToReset2Fa && !resetting2Fa) {
            await handleReset2Fa(userToReset2Fa.id);
          }
        }}
        onCancel={() => {
          if (!resetting2Fa) {
            setUserToReset2Fa(null);
          }
        }}
      />

      {/* Security Dialog */}
      <Dialog open={securityDialogOpen} onOpenChange={setSecurityDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader className="pb-2">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-base font-semibold">
                  Security settings
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Manage BIN checks and view the latest OTP for{' '}
                  <span className="font-medium text-foreground">
                    {userForSecurity?.name || 'this merchant'}
                  </span>
                  .
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="grid gap-6 py-2">
            {loadingSecurity ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading security settings...</div>
              </div>
            ) : (
              <div className="space-y-4">
                <section className="rounded-lg border bg-muted/40 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="bin-enabled"
                          checked={binEnabled ?? false}
                          disabled={updatingBinEnabled}
                          onCheckedChange={handleBinEnabledToggle}
                        />
                        <Label
                          htmlFor="bin-enabled"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Bin Check
                        </Label>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        When enabled, card BINs will be validated for this merchant before routing.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border bg-background px-4 py-3 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Latest OTP
                      </p>
                      <p className="mt-1 text-sm font-mono text-foreground">
                        {userForSecurity?.otp ? userForSecurity.otp : 'No OTP available'}
                      </p>
                    </div>
                    {userForSecurity?.otp && (
                      <button
                        type="button"
                        onClick={handleCopyOtp}
                        className="inline-flex items-center gap-1 rounded-md border bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {otpCopied ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </div>
                </section>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}

