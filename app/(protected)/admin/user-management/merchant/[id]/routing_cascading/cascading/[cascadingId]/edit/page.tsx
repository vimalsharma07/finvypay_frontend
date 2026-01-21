'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Link2 } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchSelect } from '@/components/ui/molecules/SearchSelect';
import { ContentLoader } from '@/components/common/content-loader';
import { toast } from 'sonner';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getMerchantProfiles,
  type MerchantProfile,
} from '@/lib/services/admin/merchant-acquirer-account';
import {
  getUserConnectors,
  type MerchantAcquirerAccount,
} from '@/lib/services/admin/connectors';
import {
  getUserCascadingById,
  updateUserCascading,
  CascadingConfigEntry,
} from '@/lib/services/admin/cascading';
import type { Option } from '@/lib/types/common-types';

const CASCADING_TYPES = [
  { label: 'Declined', value: 'DECLINED' },
  { label: 'Number', value: 'NUMBER' },
  { label: 'Timewise', value: 'TIMEWISE' },
  { label: 'Amount', value: 'AMOUNT' },
];

const CASCADING_FOR_OPTIONS = [
  { label: 'Card', value: 1 },
  { label: 'UPI', value: 2 },
  { label: 'Crypto', value: 3 },
  { label: 'APM', value: 4 },
];

type ChainEntry = {
  merchantAcquirerAccountId: string;
  merchantAcquirerAccountName: string;
};

export default function CascadingEditPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const cascadingId = params.cascadingId as string;

  const [name, setName] = useState('');
  const [type, setType] = useState('DECLINED');
  const [cascadingFor, setCascadingFor] = useState<number | undefined>(1);
  const [status, setStatus] = useState<boolean>(true);

  const [profiles, setProfiles] = useState<MerchantProfile[]>([]);
  const [profileOptions, setProfileOptions] = useState<Option[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [profilesLoading, setProfilesLoading] = useState(true);

  const [connectors, setConnectors] = useState<MerchantAcquirerAccount[]>([]);
  const [connectorOptions, setConnectorOptions] = useState<Option[]>([]);
  const [connectorsLoading, setConnectorsLoading] = useState(false);
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>('');

  const [chain, setChain] = useState<ChainEntry[]>([
    { merchantAcquirerAccountId: '', merchantAcquirerAccountName: '' },
  ]);

  const [loadingDetail, setLoadingDetail] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const backUrl = useMemo(
    () =>
      `/admin/user-management/merchant/${userId}/routing_cascading/cascading`,
    [userId],
  );

  // Load existing cascade
  useEffect(() => {
    const loadDetail = async () => {
      if (!userId || !cascadingId) return;
      setLoadingDetail(true);
      try {
        const response = await getUserCascadingById(userId, cascadingId);
        handleApiResponse(response, {
          onSuccess: (payload) => {
            const data = (payload as any)?.data ?? payload;
            if (!data) return;

            setName(data.name || '');
            setType(data.type || 'DECLINED');
            setStatus(data.status ?? true);
            const cf = data.cascadingFor ?? data.cascading_for;
            setCascadingFor(cf !== undefined ? cf : 1);

            const profileId =
              data.merchantProfileId || data.merchant_profile_id || null;
            if (profileId) {
              const nextProfileId = profileId.toString();
              if (nextProfileId !== selectedProfileId) {
                setSelectedProfileId(nextProfileId);
              }
            }

            const primaryConnector =
              data.merchantAcquirerAccountId ||
              data.connectorId ||
              data.connector_id ||
              data.merchant_acquirer_account_id ||
              null;
            if (primaryConnector) {
              const nextConnectorId = primaryConnector.toString();
              if (nextConnectorId !== selectedConnectorId) {
                setSelectedConnectorId(nextConnectorId);
              }
            }

            const cfg = Array.isArray(data.config) ? data.config : [];
            if (cfg.length > 0) {
              setChain(
                cfg.map((c: any) => ({
                  merchantAcquirerAccountId: c.merchantAcquirerAccountId?.toString() || '',
                  merchantAcquirerAccountName: c.merchantAcquirerAccountName || '',
                })),
              );
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load cascading detail');
          },
        });
      } catch {
        toast.error('An unexpected error occurred while loading cascading');
      } finally {
        setLoadingDetail(false);
      }
    };

    loadDetail();
  }, [userId, cascadingId]);

  // Fetch profiles
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

            if (!selectedProfileId) {
              const primary = list.find((p: MerchantProfile) => p.isPrimary);
              const nextProfileId =
                (primary?.id ?? list[0]?.id)?.toString() || '';
              if (nextProfileId) {
                setSelectedProfileId(nextProfileId);
              }
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load merchant profiles');
          },
        });
      } catch {
        toast.error('An unexpected error occurred while loading profiles');
      } finally {
        setProfilesLoading(false);
      }
    };

    loadProfiles();
  }, [userId]);

  // Fetch connectors when profile changes
  useEffect(() => {
    const loadConnectors = async () => {
      if (!selectedProfileId) return;
      setConnectorsLoading(true);
      try {
        const response = await getUserConnectors({
          userId,
          merchantProfileId: Number(selectedProfileId),
          page: 1,
          limit: 100,
        });
        handleApiResponse(response, {
          onSuccess: (payload) => {
            const list = (payload as any)?.data?.data || (payload as any)?.data || [];
            setConnectors(list);
            const options = list.map((conn: MerchantAcquirerAccount) => ({
              value: conn.id.toString(),
              label: conn.name || `Connector ${conn.id}`,
            }));
            setConnectorOptions(options);
            if (!selectedConnectorId && options.length > 0) {
              setSelectedConnectorId(options[0].value);
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load connectors');
          },
        });
      } catch {
        toast.error('An unexpected error occurred while loading connectors');
      } finally {
        setConnectorsLoading(false);
      }
    };

    loadConnectors();
  }, [userId, selectedProfileId]);

  const updateChainEntry = (index: number, field: keyof ChainEntry, value: string) => {
    setChain((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addChainEntry = () => {
    setChain((prev) => [...prev, { merchantAcquirerAccountId: '', merchantAcquirerAccountName: '' }]);
  };

  const removeChainEntry = (index: number) => {
    setChain((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!selectedProfileId) {
      toast.error('Merchant profile is required');
      return;
    }
    if (!selectedConnectorId) {
      toast.error('Primary connector is required');
      return;
    }
    if (chain.some((c) => !c.merchantAcquirerAccountId || !c.merchantAcquirerAccountName.trim())) {
      toast.error('All cascade connectors need id and name');
      return;
    }

    const payload = {
      name,
      // merchantProfileId: Number(selectedProfileId),
      merchantAcquirerAccountId: Number(selectedConnectorId),
      type,
      cascadingFor,
      status,
      config: chain.map((c) => ({
        merchantAcquirerAccountId: c.merchantAcquirerAccountId,
        merchantAcquirerAccountName: c.merchantAcquirerAccountName,
      })) as CascadingConfigEntry[],
    };

    try {
      setSubmitting(true);
      const response = await updateUserCascading(userId, cascadingId, payload as any);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Cascading rule updated successfully');
          router.push(backUrl);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update cascading rule');
        },
      });
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading =
    loadingDetail || profilesLoading || (selectedProfileId ? connectorsLoading : false);

  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Edit Cascading Rule"
          description="Update cascading payment rule acquirer chain sequence, priorities, and fallback settings"
          icon={Link2}
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(backUrl)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={submitting || isLoading} onClick={handleSubmit}>
            {submitting ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </Toolbar>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <ContentLoader />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter cascading name"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CASCADING_TYPES.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Cascading For (optional)</Label>
                  <Select
                    value={cascadingFor?.toString() || ''}
                    onValueChange={(val) => setCascadingFor(val ? Number(val) : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select handler" />
                    </SelectTrigger>
                    <SelectContent>
                      {CASCADING_FOR_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value.toString()}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Status</Label>
                  <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-sm text-muted-foreground">
                      {status ? 'Enabled' : 'Disabled'}
                    </span>
                    <Switch checked={status} onCheckedChange={setStatus} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile & Primary Connector</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label>Merchant Profile</Label>
                <SearchSelect
                  options={profileOptions}
                  value={selectedProfileId}
                  onChange={(val) => {
                    setSelectedProfileId(val);
                    setSelectedConnectorId('');
                    setChain([{ merchantAcquirerAccountId: '', merchantAcquirerAccountName: '' }]);
                  }}
                  placeholder="Select merchant profile"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Primary Connector</Label>
                {connectorsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ContentLoader />
                    <span>Loading connectors...</span>
                  </div>
                ) : connectorOptions.length > 0 ? (
                  <SearchSelect
                    options={connectorOptions}
                    value={selectedConnectorId}
                    onChange={(val) => setSelectedConnectorId(val)}
                    placeholder="Select connector"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground border rounded-md px-3 py-2">
                    No connectors for this profile.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cascade Chain (order matters)</CardTitle>
              <Button variant="outline" size="sm" onClick={addChainEntry}>
                Add Connector
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {chain.map((entry, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-6 gap-3 border rounded-md p-3"
                >
                  <div className="md:col-span-3 flex flex-col gap-1">
                    <Label>Connector</Label>
                    <Select
                      value={entry.merchantAcquirerAccountId}
                      onValueChange={(val) => {
                        updateChainEntry(idx, 'merchantAcquirerAccountId', val);
                        const label =
                          connectorOptions.find((o) => o.value === val)?.label || '';
                        updateChainEntry(idx, 'merchantAcquirerAccountName', label);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select connector" />
                      </SelectTrigger>
                      <SelectContent>
                        {connectorOptions.map((opt) => {
                          const value = opt.value === null ? 'null' : String(opt.value);
                          return (
                            <SelectItem key={value} value={value}>
                            {opt.label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <Label>Display Name</Label>
                    <Input
                      placeholder="e.g., Primary, Fallback"
                      value={entry.merchantAcquirerAccountName}
                      onChange={(e) =>
                        updateChainEntry(idx, 'merchantAcquirerAccountName', e.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeChainEntry(idx)}
                      disabled={chain.length === 1}
                      className="w-full"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </Container>
  );
}

