'use client';

import React, {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { Cpu, DollarSign, Pencil } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import {
  TableComp,
  TableHeader,
  TableAction,
} from '../../components/table-comp';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getUserAcquirerAccounts,
  updateAcquirerAccountCustomName,
  UserAcquirerAccount,
  UserAcquirerAccountListResponse,
  UserAcquirerAccountListMeta,
} from '@/lib/services/user/acquirer-accounts';
import { useAuth } from '@/hooks/use-auth';
import {
  getUserProfileId,
  getMerchantProfiles,
  type MerchantProfileListResponse,
} from '@/lib/services/user/merchant-profile';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCursorPagination } from '@/lib/hooks/use-cursor-pagination';

function RatesDialog({
  open,
  onOpenChange,
  account,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: UserAcquirerAccount | null;
}) {
  const ratesEntries = account?.rates ? Object.entries(account.rates) : [];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[520px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Rate Card — {account?.name || 'Bank Connection'}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="mt-2 grid grid-cols-2 gap-2 text-foreground">
              {ratesEntries.length > 0 ? (
                ratesEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between rounded-xl border border-sky-100 bg-sky-50/40 px-3 py-2 text-sm dark:border-sky-900/40 dark:bg-sky-950/20"
                  >
                    <span className="capitalize text-muted-foreground">{key.replace(/_/g, ' ')}</span>
                    <span className="font-semibold text-foreground">{String(value)}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-sm text-muted-foreground">
                  No rates available for this connection.
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RenameDialog({
  open,
  onOpenChange,
  account,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: UserAcquirerAccount | null;
  onSuccess: () => void;
}) {
  const [customName, setCustomName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (account) {
      setCustomName(account.customName ?? '');
    }
  }, [account, open]);

  const handleSave = async () => {
    if (!account) return;
    setSaving(true);
    try {
      const response = await updateAcquirerAccountCustomName(
        account.id,
        customName.trim() || null,
      );
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Name updated successfully');
          onOpenChange(false);
          onSuccess();
        },
        onError: (msg) => toast.error(msg || 'Failed to update name'),
      });
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Bank Connection</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="mb-3 text-sm text-muted-foreground">
            Give this connection a friendly label (e.g. &quot;2D MC&quot;, &quot;Trusted Visa&quot;).
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium">Display name</label>
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={account?.name || 'e.g. 2D MC, Trusted Visa'}
              maxLength={191}
              className="h-11 rounded-xl border-sky-200 focus-visible:ring-sky-400/40"
            />
            <p className="text-xs text-muted-foreground">
              System name: {account?.name || '-'}
            </p>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function UserAcquirerAccountsPage() {
  const { user } = useAuth();

  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<UserAcquirerAccount[]>([]);
  const [meta, setMeta] = useState<UserAcquirerAccountListMeta | null>(null);
  const { requestCursor, reset: resetCursor, goNext, goPrev, canGoPrev } =
    useCursorPagination();
  const [limit, setLimit] = useState(20);
  const [ratesDialogOpen, setRatesDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<UserAcquirerAccount | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profilesLoading, setProfilesLoading] = useState(true);

  const isTableLoading = loading || profilesLoading;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchAccounts = useCallback(
    async (
      cursor: string | undefined,
      pageLimit: number,
      currentProfileId?: string | null,
    ) => {
      if (!currentProfileId) {
        setAccounts([]);
        setMeta(null);
        return;
      }
      setLoading(true);
      try {
        const params: Record<string, string | number | undefined> = {
          ...(cursor ? { cursor } : {}),
          limit: pageLimit,
          merchantProfileId: currentProfileId,
        };

        const response = await getUserAcquirerAccounts(params);

        handleApiResponse<UserAcquirerAccountListResponse>(response, {
          onSuccess: (data) => {
            if (!data?.success) return;
            const list = Array.isArray(data.data) ? data.data : (data.data?.data ?? []);
            const metaData = data.meta ?? (data.data as any)?.meta ?? null;

            const normalized = list.map((item: any) => ({
              ...item,
              status: item.status ?? (item.isActive ? 1 : 0),
              isActive: item.isActive ?? item.status === 1,
              isPrimary: item.isPrimary ?? item.merchantProfile?.isPrimary,
              industryName: item.merchantProfile?.industry?.name,
              currency: item.currencyCode ?? item.acquirerAccount?.currency ?? 'N/A',
            }));

            setAccounts(normalized as UserAcquirerAccount[]);
            setMeta(metaData);
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load acquirer accounts');
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

  // Resolve current merchant profile ID
  useEffect(() => {
    const resolveProfile = async () => {
      setProfilesLoading(true);
      try {
        const id = getUserProfileId(null, user);
        if (id) {
          setProfileId(id);
          return;
        }

        const response = await getMerchantProfiles();
        handleApiResponse<MerchantProfileListResponse>(response, {
          onSuccess: (payload) => {
            if (!payload?.success || !payload.data) return;
            const list = Array.isArray(payload.data) ? payload.data : [];
            if (list.length > 0) {
              const primary = list.find((p: any) => p.isPrimary);
              const nextId = (primary?.id ?? list[0]?.id)?.toString() || null;
              if (nextId) setProfileId(nextId);
            }
          },
          silent: true,
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
    resetCursor();
  }, [profileId, resetCursor]);

  useEffect(() => {
    if (profileId) {
      fetchAccounts(requestCursor, limit, profileId);
    } else {
      setAccounts([]);
      setMeta(null);
    }
  }, [requestCursor, limit, profileId, fetchAccounts]);

  const handleCursorNext = useCallback(() => {
    if (meta?.nextCursor) goNext(meta.nextCursor);
  }, [meta?.nextCursor, goNext]);

  const handleCursorPrev = useCallback(() => {
    goPrev();
  }, [goPrev]);

  const headers: TableHeader<UserAcquirerAccount>[] = useMemo(
    () => [
      { key: 'customName', label: 'Display Name', sortable: false },
      { key: 'name', label: 'Bank Partner', sortable: false },
      { key: 'terminalId', label: 'Terminal ID', sortable: false },
      { key: 'industryName', label: 'Vertical', sortable: false },
      { key: 'currency', label: 'Currency', sortable: false },
      { key: 'isPrimary', label: 'Primary', sortable: false },
      { key: 'isActive', label: 'Link Status', sortable: false },
    ],
    [],
  );

  const renderCell = (item: UserAcquirerAccount, key: keyof UserAcquirerAccount | string) => {
    switch (key) {
      case 'customName':
        return (
          <div className="font-semibold text-foreground">
            {item.customName?.trim() || <span className="font-normal text-muted-foreground">—</span>}
          </div>
        );
      case 'name':
        return <div className="text-sm text-slate-700 dark:text-slate-300">{item.name}</div>;
      case 'terminalId':
        return (
          <div className="font-mono text-xs text-slate-600 dark:text-slate-400">
            {item.terminalId || '-'}
          </div>
        );
      case 'industryName':
        return <div className="text-sm">{(item as any).industryName || '-'}</div>;
      case 'currency':
        return (
          <Badge className="rounded-lg border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
            {(item as any).currency || 'N/A'}
          </Badge>
        );
      case 'isPrimary':
        return (
          <Badge
            variant={item.isPrimary ? 'success' : 'secondary'}
            className={item.isPrimary ? 'rounded-lg' : 'rounded-lg'}
          >
            {item.isPrimary ? 'Primary' : 'Secondary'}
          </Badge>
        );
      case 'isActive':
        return (
          <Badge
            variant={item.isActive ? 'success' : 'secondary'}
            className="rounded-lg"
          >
            {item.isActive ? 'Linked' : 'Paused'}
          </Badge>
        );
      default:
        const value = item[key as keyof UserAcquirerAccount];
        return <div className="font-normal text-foreground">{value != null ? String(value) : '-'}</div>;
    }
  };

  const refreshAccounts = () => {
    if (profileId) fetchAccounts(requestCursor, limit, profileId);
  };

  const actions: TableAction<UserAcquirerAccount>[] = [
    {
      label: 'Rename',
      icon: Pencil,
      onClick: (row: UserAcquirerAccount) => {
        setSelectedAccount(row);
        setRenameDialogOpen(true);
      },
    },
    {
      label: 'Rate Card',
      icon: DollarSign,
      onClick: (row: UserAcquirerAccount) => {
        setSelectedAccount(row);
        setRatesDialogOpen(true);
      },
      separator: true,
    },
  ];

  if (!isClient) return null;

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Bank Connections"
            description="Your linked bank partners, terminals, and rate cards in one place"
            icon={Cpu}
          />
          <ToolbarActions />
        </Toolbar>
      </Container>
      <Container>
        <div className="mb-4 relative overflow-hidden rounded-2xl border border-sky-200/70 bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_50%,#e0f2fe_100%)] p-4 sm:p-5 dark:border-sky-900/50 dark:bg-[linear-gradient(135deg,#0c1a24_0%,#0f172a_55%,#082f49_100%)]">
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700/80 dark:text-sky-300/80">
                Connected banks
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Rename links, check status, and open rate cards without leaving this list.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white/80 px-3 py-2 text-sm font-medium text-sky-700 shadow-sm dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
              <Cpu className="size-4" />
              {accounts.length} shown
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-sky-100 bg-card shadow-sm ring-1 ring-sky-500/5 dark:border-sky-900/40">
          <TableComp
            data={accounts}
            headers={headers}
            renderCell={renderCell}
            actions={actions}
            enableCheckbox={false}
            searchPlaceholder="Search bank connections..."
            searchKeys={['customName', 'name', 'terminalId']}
            getRowId={(row: UserAcquirerAccount) => String(row.id)}
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
            sorting={undefined}
            loading={isTableLoading}
          />
        </div>
      </Container>

      <RatesDialog
        open={ratesDialogOpen}
        onOpenChange={setRatesDialogOpen}
        account={selectedAccount}
      />
      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        account={selectedAccount}
        onSuccess={refreshAccounts}
      />
    </Fragment>
  );
}


