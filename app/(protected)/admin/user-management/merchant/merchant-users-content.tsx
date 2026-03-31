'use client';

import { Fragment, useCallback, useEffect, useState, useRef } from 'react';
import { Pencil, Eye, Plug, Route, Trash2, Percent, Shield, Lock, Copy, LogIn, IdCard } from 'lucide-react';
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
import { getIndustries, type Industry } from '@/lib/services/admin/industries';
import {
  getMerchantProfilesForUser,
  createMerchantProfileForUser,
  type AdminMerchantProfile,
} from '@/lib/services/admin/merchant-profiles';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useCursorPagination } from '@/lib/hooks/use-cursor-pagination';

interface MerchantUsersPageContentProps {
  filters?: Record<string, string>;
}

export function MerchantUsersPageContent({ filters: externalFilters = {} }: MerchantUsersPageContentProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<UserListResponse['meta'] | null>(null);
  
  const { requestCursor, reset: resetCursor, goNext, goPrev, canGoPrev } =
    useCursorPagination();
  const [limit, setLimit] = useState(20);
  
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

  // Merchant profile dialog state
  const [merchantProfileDialogOpen, setMerchantProfileDialogOpen] = useState(false);
  const [userForProfiles, setUserForProfiles] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<AdminMerchantProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [industriesLoading, setIndustriesLoading] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('');
  const [isPrimaryProfile, setIsPrimaryProfile] = useState(false);
  
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
    cursor: string | undefined,
    pageLimit: number,
    sortField: string,
    sortDir: 'ASC' | 'DESC',
    filterParams?: Record<string, string>
  ) => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean | undefined> = {
        ...(cursor ? { cursor } : {}),
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

  useEffect(() => {
    resetCursor();
  }, [externalFilters, resetCursor]);

  useEffect(() => {
    fetchUsers(requestCursor, limit, sortBy, sortOrder, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestCursor, limit, sortBy, sortOrder, externalFilters]);

  const handleCursorNext = useCallback(() => {
    if (meta?.nextCursor) goNext(meta.nextCursor);
  }, [meta?.nextCursor, goNext]);

  const handleCursorPrev = useCallback(() => {
    goPrev();
  }, [goPrev]);

  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    resetCursor();
  };

  const handleSortChange = (newSortBy: string, newSortOrder: 'ASC' | 'DESC') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    resetCursor();
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
          fetchUsers(requestCursor, limit, sortBy, sortOrder, filters);
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
          fetchUsers(requestCursor, limit, sortBy, sortOrder, filters);
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
            const params: Record<string, number> = {
              limit: 20,
              userId: Number(userId),
              merchantProfileId: Number(profileId),
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

  // Fetch merchant profiles for selected user
  const fetchMerchantProfilesForUser = async (userId: string) => {
    setProfilesLoading(true);
    try {
      const response = await getMerchantProfilesForUser(userId);
      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data?.success && Array.isArray(data.data)) {
            setProfiles(data.data);
          } else {
            setProfiles([]);
          }
        },
        onError: (message) => {
          toast.error(message || 'Failed to load merchant profiles');
          setProfiles([]);
        },
      });
    } catch (error) {
      console.error('Fetch merchant profiles error:', error);
      toast.error('An unexpected error occurred while loading merchant profiles');
      setProfiles([]);
    } finally {
      setProfilesLoading(false);
    }
  };

  // Fetch industries for select
  const fetchIndustries = async () => {
    setIndustriesLoading(true);
    try {
      const response = await getIndustries({ limit: 1000 });
      handleApiResponse(response, {
        onSuccess: (data) => {
          // Industries API returns: { success: true, data: Industry[], meta: {...} }
          if (data?.success && Array.isArray(data.data)) {
            setIndustries(data.data);
          } else {
            setIndustries([]);
          }
        },
        onError: (message) => {
          toast.error(message || 'Failed to load industries');
          setIndustries([]);
        },
      });
    } catch (error) {
      console.error('Fetch industries error:', error);
      toast.error('An unexpected error occurred while loading industries');
      setIndustries([]);
    } finally {
      setIndustriesLoading(false);
    }
  };

  const handleOpenMerchantProfiles = (user: User) => {
    setUserForProfiles(user);
    setMerchantProfileDialogOpen(true);
    setProfileName('');
    setSelectedIndustryId('');
    setIsPrimaryProfile(false);
    fetchMerchantProfilesForUser(user.id);
    fetchIndustries();
  };

  const handleCreateMerchantProfile = async () => {
    if (!userForProfiles) return;
    if (!profileName.trim()) {
      toast.error('Profile name is required');
      return;
    }
    if (!selectedIndustryId) {
      toast.error('Industry is required');
      return;
    }

    setCreatingProfile(true);
    try {
      const payload = {
        merchantProfileName: profileName.trim(),
        industryId: Number(selectedIndustryId),
        isPrimary: isPrimaryProfile,
      };
      const response = await createMerchantProfileForUser(userForProfiles.id, payload);
      handleApiResponse(response, {
        onSuccess: (created) => {
          toast.success('Merchant profile created successfully');
          setProfiles((prev) => [...prev, created]);
          setProfileName('');
          setSelectedIndustryId('');
          setIsPrimaryProfile(false);
        },
        onError: (message) => {
          toast.error(message || 'Failed to create merchant profile');
        },
      });
    } catch (error) {
      console.error('Create merchant profile error:', error);
      toast.error('An unexpected error occurred while creating merchant profile');
    } finally {
      setCreatingProfile(false);
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
      label: 'Merchant Profile',
      icon: IdCard,
      onClick: (row: User) => handleOpenMerchantProfiles(row),
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
            pageIndex: 0,
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

      {/* Merchant Profiles Dialog */}
      <Dialog open={merchantProfileDialogOpen} onOpenChange={setMerchantProfileDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="pb-2">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <IdCard className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-base font-semibold">
                  Merchant Profiles
                </DialogTitle>
                <DialogDescription className="text-sm">
                  View and create merchant profiles (industry mappings) for{' '}
                  <span className="font-medium text-foreground">
                    {userForProfiles?.name || userForProfiles?.email || 'selected merchant'}
                  </span>
                  .
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Existing profiles list */}
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Existing Profiles
              </p>
              <div className="rounded-lg border bg-background p-3 max-h-72 overflow-auto space-y-2">
                {profilesLoading ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Loading profiles...
                  </div>
                ) : profiles.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No profiles found for this merchant.
                  </div>
                ) : (
                  profiles.map((profile) => {
                    const rawIndustryName = (profile as any).industryName;
                    const industryName =
                      profile.industry?.name ||
                      rawIndustryName ||
                      industries.find((i) => String(i.id) === String(profile.industryId))?.name ||
                      'N/A';
                    return (
                      <div
                        key={profile.id}
                        className="rounded-md border bg-muted/40 px-3 py-2 text-sm flex flex-col gap-0.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground">
                            {profile.merchantProfileName}
                          </span>
                          {profile.isPrimary && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-700">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Industry: <span className="font-medium text-foreground">{industryName}</span>
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Create profile form */}
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Create New Profile
              </p>
              <div className="space-y-3 rounded-lg border bg-background p-3">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-name">Profile name</Label>
                  <Input
                    id="profile-name"
                    placeholder="e.g. Gaming Profile"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="industry-select">Industry</Label>
                  <Select
                    value={selectedIndustryId}
                    onValueChange={(val) => setSelectedIndustryId(val)}
                  >
                    <SelectTrigger id="industry-select">
                      <SelectValue
                        placeholder={
                          industriesLoading ? 'Loading industries...' : 'Select industry'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry.id} value={String(industry.id)}>
                          {industry.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Checkbox
                    id="primary-profile"
                    checked={isPrimaryProfile}
                    onCheckedChange={(checked) =>
                      setIsPrimaryProfile(Boolean(checked))
                    }
                  />
                  <Label
                    htmlFor="primary-profile"
                    className="text-sm text-muted-foreground"
                  >
                    Mark as primary profile
                  </Label>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleCreateMerchantProfile}
                    disabled={creatingProfile}
                  >
                    {creatingProfile ? 'Creating...' : 'Create Profile'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

