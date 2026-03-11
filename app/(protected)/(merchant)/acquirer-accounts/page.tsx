'use client';

import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cpu, DollarSign } from 'lucide-react';
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
          <AlertDialogTitle>Rates — {account?.name || 'Acquirer Account'}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="grid grid-cols-2 gap-2 text-foreground mt-2">
              {ratesEntries.length > 0 ? (
                ratesEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-sm text-muted-foreground">
                  No rates available for this account.
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

export default function UserAcquirerAccountsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<UserAcquirerAccount[]>([]);
  const [meta, setMeta] = useState<UserAcquirerAccountListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [ratesDialogOpen, setRatesDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<UserAcquirerAccount | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profilesLoading, setProfilesLoading] = useState(true);

  const isTableLoading = loading || profilesLoading;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchAccounts = async (
    pageNum: number,
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
      const params: any = {
        page: pageNum,
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
  };

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

  useEffect(() => {
    if (profileId) {
      fetchAccounts(page, limit, profileId);
    } else {
      setAccounts([]);
      setMeta(null);
    }
  }, [page, limit, profileId]);

  const headers: TableHeader<UserAcquirerAccount>[] = useMemo(
    () => [
      { key: 'name', label: 'Name', sortable: false },
      { key: 'terminalId', label: 'Terminal ID', sortable: false },
      { key: 'industryName', label: 'Industry', sortable: false },
      { key: 'currency', label: 'Currency', sortable: false },
      { key: 'isPrimary', label: 'Primary', sortable: false },
      { key: 'isActive', label: 'Status', sortable: false },
    ],
    [],
  );

  const renderCell = (item: UserAcquirerAccount, key: keyof UserAcquirerAccount | string) => {
    switch (key) {
      case 'name':
        return <div className="font-medium">{item.name}</div>;
      case 'terminalId':
        return <div className="text-sm">{item.terminalId || '-'}</div>;
      case 'industryName':
        return <div className="text-sm">{(item as any).industryName || '-'}</div>;
      case 'currency':
        return <Badge variant="secondary">{(item as any).currency || 'N/A'}</Badge>;
      case 'isPrimary':
        return (
          <Badge variant={item.isPrimary ? 'success' : 'secondary'}>
            {item.isPrimary ? 'Yes' : 'No'}
          </Badge>
        );
      case 'isActive':
        return (
          <Badge variant={item.isActive ? 'success' : 'secondary'}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      default:
        const value = item[key as keyof UserAcquirerAccount];
        return <div className="text-foreground font-normal">{value != null ? String(value) : '-'}</div>;
    }
  };

  const actions: TableAction<UserAcquirerAccount>[] = [
    {
      label: 'View Rates',
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
              title="Acquirer Accounts"
              description="View and manage your payment gateway acquirer accounts with configuration details and connection status"
              icon={Cpu}
            />
          <ToolbarActions />
        </Toolbar>
      </Container>
      <Container>
        <TableComp
          data={accounts}
          headers={headers}
          renderCell={renderCell}
          actions={actions}
          enableCheckbox={false}
          searchPlaceholder="Search acquirer accounts..."
          searchKeys={['name', 'terminalId']}
          getRowId={(row: UserAcquirerAccount) => String(row.id)}
          pagination={{
            pageSize: limit,
            pageIndex: page - 1,
            totalCount: meta?.total ?? 0,
            onPageChange: (pageIndex) => setPage(pageIndex + 1),
            onPageSizeChange: (newSize) => {
              setLimit(newSize);
              setPage(1);
            },
          }}
          sorting={undefined}
          loading={isTableLoading}
        />
      </Container>

      <RatesDialog
        open={ratesDialogOpen}
        onOpenChange={setRatesDialogOpen}
        account={selectedAccount}
      />
    </Fragment>
  );
}


