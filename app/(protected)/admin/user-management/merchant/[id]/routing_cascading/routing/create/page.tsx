'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
import { createUserRouting } from '@/lib/services/admin/routing';
import type { Option } from '@/lib/types/common-types';
import { fetchListOfCurrencies } from '@/lib/fetch/fetch-options';
import {
  ROUTE_CONDITION_CATEGORIES,
  CONDITION_OPERATOR_MAP,
  CARD_TYPE_OPTIONS,
  CARD_WL_FT_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from '@/lib/constants/routing';

type ConditionInputType =
  | 'input'
  | 'search-select'
  | 'multi-select'
  | 'multi-input'
  | 'select';

type Condition = {
  category: string;
  operator: string;
  value: string;
};

export default function RoutingCreatePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [name, setName] = useState('');
  const [routingFor, setRoutingFor] = useState('CARD');
  const [splitEnable, setSplitEnable] = useState(false);

  const [profiles, setProfiles] = useState<MerchantProfile[]>([]);
  const [profileOptions, setProfileOptions] = useState<Option[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [profilesLoading, setProfilesLoading] = useState(true);

  const [connectors, setConnectors] = useState<MerchantAcquirerAccount[]>([]);
  const [connectorOptions, setConnectorOptions] = useState<Option[]>([]);
  const [connectorsLoading, setConnectorsLoading] = useState(false);
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>('');

  const [conditions, setConditions] = useState<Condition[]>([
    { category: 'amount', operator: '>=', value: '' },
  ]);

  const [currencyOptions, setCurrencyOptions] = useState<Option[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const backUrl = useMemo(
    () =>
      `/admin/user-management/merchant/${userId}/routing_cascading/routing`,
    [userId],
  );

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
            const options = list.map((p) => ({
              value: p.id.toString(),
              label: p.industry?.name || p.merchantProfileName || `Profile ${p.id}`,
            }));
            setProfileOptions(options);

            const primary = list.find((p) => p.isPrimary);
            if (primary) {
              setSelectedProfileId(primary.id.toString());
            } else if (list.length > 0) {
              setSelectedProfileId(list[0].id.toString());
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
  }, [userId]);

  // Fetch currencies for condition select
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const currencies = await fetchListOfCurrencies();
        setCurrencyOptions(
          currencies.map((c) => ({
            label: c.label || c.code || c.value,
            value: c.value || c.code,
          })),
        );
      } catch (error) {
        // swallow; not critical
      }
    };
    loadCurrencies();
  }, []);

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
            setSelectedConnectorId(options[0]?.value || '');
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load connectors');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred while loading connectors');
      } finally {
        setConnectorsLoading(false);
      }
    };

    loadConnectors();
  }, [userId, selectedProfileId]);

  const handleConditionChange = (
    index: number,
    field: keyof Condition,
    value: string,
  ) => {
    setConditions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Reset operator/value when category changes
      if (field === 'category') {
        const operators = CONDITION_OPERATOR_MAP[value] || [];
        updated[index].operator = operators[0]?.value || '';
        updated[index].value = '';
      }

      return updated;
    });
  };

  const addCondition = () => {
    setConditions((prev) => [...prev, { category: 'amount', operator: '>=', value: '' }]);
  };

  const removeCondition = (index: number) => {
    setConditions((prev) => prev.filter((_, i) => i !== index));
  };

  const getInputType = (category: string, operator: string): ConditionInputType => {
    const operators = CONDITION_OPERATOR_MAP[category] || [];
    return operators.find((op) => op.value === operator)?.inputType || 'input';
  };

  const renderValueInput = (condition: Condition, idx: number) => {
    const inputType = getInputType(condition.category, condition.operator);

    if (inputType === 'search-select') {
      const options =
        condition.category === 'currency' ? currencyOptions : [];

      if (!options || options.length === 0) {
        return (
          <Input
            placeholder="Enter value"
            value={condition.value}
            onChange={(e) => handleConditionChange(idx, 'value', e.target.value)}
          />
        );
      }

      return (
        <SearchSelect
          options={options}
          value={condition.value}
          onChange={(val) => handleConditionChange(idx, 'value', val)}
          placeholder="Select value"
        />
      );
    }

    if (inputType === 'select') {
      const options =
        condition.category === 'card_type'
          ? CARD_TYPE_OPTIONS
          : condition.category === 'card_wl_ft'
            ? CARD_WL_FT_OPTIONS
            : [];

      return (
        <Select
          value={condition.value}
          onValueChange={(val) => handleConditionChange(idx, 'value', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (inputType === 'multi-select' || inputType === 'multi-input') {
      return (
        <Textarea
          placeholder="Comma separated values"
          value={condition.value}
          onChange={(e) => handleConditionChange(idx, 'value', e.target.value)}
        />
      );
    }

    return (
      <Input
        placeholder="Enter value"
        value={condition.value}
        onChange={(e) => handleConditionChange(idx, 'value', e.target.value)}
      />
    );
  };

  const normalizeConditionValue = (
    condition: Condition,
  ): string | number | string[] => {
    const inputType = getInputType(condition.category, condition.operator);
    if (inputType === 'multi-select' || inputType === 'multi-input') {
      return condition.value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    }

    if (condition.category === 'amount') {
      const num = Number(condition.value);
      return Number.isNaN(num) ? condition.value : num;
    }

    return condition.value;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!routingFor) {
      toast.error('Payment method is required');
      return;
    }
    if (!selectedProfileId) {
      toast.error('Merchant profile is required');
      return;
    }
    if (!selectedConnectorId) {
      toast.error('Connector is required');
      return;
    }
    if (conditions.some((c) => !c.category || !c.operator || !`${c.value}`.trim())) {
      toast.error('All conditions must be filled');
      return;
    }

    const payload = {
      name,
      routingFor,
      merchantProfileId: Number(selectedProfileId),
      merchantAcquirerAccountId: Number(selectedConnectorId),
      config: conditions.map((c) => ({
        category: c.category,
        operator: c.operator,
        value: normalizeConditionValue(c),
      })),
      splitEnable,
    };

    try {
      setSubmitting(true);
      const response = await createUserRouting(userId, payload as any);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Routing rule created successfully');
          router.push(backUrl);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to create routing rule');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = profilesLoading || (selectedProfileId ? connectorsLoading : false);

  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Create Routing Rule"
          description="Define routing conditions and connector"
        />
        <ToolbarActions className="gap-2">
          <Button variant="outline" onClick={() => router.push(backUrl)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={submitting || isLoading} onClick={handleSubmit}>
            {submitting ? 'Creating...' : 'Create'}
          </Button>
        </ToolbarActions>
      </Toolbar>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <ContentLoader />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Routing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter routing name"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Payment Method</Label>
                  <Select value={routingFor} onValueChange={setRoutingFor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHOD_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <Label>Split Routing</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable if this routing should split traffic.
                  </p>
                </div>
                <Switch checked={splitEnable} onCheckedChange={setSplitEnable} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile & Connector</CardTitle>
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
                  }}
                  placeholder="Select merchant profile"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Connector</Label>
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
              <CardTitle>Conditions</CardTitle>
              <Button variant="outline" size="sm" onClick={addCondition}>
                Add Condition
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {conditions.map((condition, idx) => {
                const operators = CONDITION_OPERATOR_MAP[condition.category] || [];
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 border rounded-md p-3"
                  >
                    <div className="md:col-span-3 flex flex-col gap-1">
                      <Label>Category</Label>
                      <Select
                        value={condition.category}
                        onValueChange={(val) =>
                          handleConditionChange(idx, 'category', val)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROUTE_CONDITION_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-3 flex flex-col gap-1">
                      <Label>Operator</Label>
                      <Select
                        value={condition.operator}
                        onValueChange={(val) =>
                          handleConditionChange(idx, 'operator', val)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-5 flex flex-col gap-1">
                      <Label>Value</Label>
                      {renderValueInput(condition, idx)}
                    </div>

                    <div className="md:col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCondition(idx)}
                        disabled={conditions.length === 1}
                        className="w-full"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </Container>
  );
}

