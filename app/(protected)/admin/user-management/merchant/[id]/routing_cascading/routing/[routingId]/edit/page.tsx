'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Route } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
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
import {
  getUserRoutingById,
  updateUserRouting,
  type RouteRule,
} from '@/lib/services/admin/routing';
import type { Option } from '@/lib/types/common-types';
import { formatConnectorLabel } from '@/lib/utils/connector-display';
import { fetchListOfCurrencies, fetchListOfCountries } from '@/lib/fetch/fetch-options';
import {
  ROUTE_CONDITION_CATEGORIES,
  CONDITION_OPERATOR_MAP,
  CARD_TYPE_OPTIONS,
  CARD_BRAND_OPTIONS,
  CARD_WL_FT_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from '@/lib/constants/routing';
import type { ConditionOperatorInputType } from '@/lib/constants/routing';
import { MultiSelect } from '@/components/common/MultiSelect';
import {
  parseRoutingConfig,
  leafConditionToFormRow,
  serializeRoutingConfig,
  type RoutingLeafCondition,
} from '@/lib/utils/routing-config';

type Condition = {
  category: string;
  operator: string;
  value: string;
};

export default function RoutingEditPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const routingId = params.routingId as string;

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
  const [pendingConnectorId, setPendingConnectorId] = useState<string>('');

  const [conditions, setConditions] = useState<Condition[]>([
    { category: 'amount', operator: '>=', value: '' },
  ]);

  const [currencyOptions, setCurrencyOptions] = useState<Option[]>([]);
  const [countryOptions, setCountryOptions] = useState<Option[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [combineMode, setCombineMode] = useState<'AND' | 'OR'>('AND');

  const backUrl = useMemo(
    () =>
      `/admin/user-management/merchant/${userId}/routing_cascading/routing`,
    [userId],
  );

  // Fetch existing routing detail
  useEffect(() => {
    const loadDetail = async () => {
      setLoadingDetail(true);
      try {
        const response = await getUserRoutingById(userId, routingId);
        handleApiResponse(response, {
          onSuccess: (payload) => {
            const data = (payload as any)?.data ?? payload;
            if (!data) return;
            setName(data.name || '');
            setRoutingFor(data.routing_for || data.routingFor || 'CARD');
            setSplitEnable(data.split_enable ?? data.splitEnable ?? false);

            const profileId =
              data.merchantProfileId ||
              data.profile_id ||
              data.merchantProfile?.id ||
              data.merchant_profile_id;
            if (profileId) {
              setSelectedProfileId(profileId.toString());
            }

            const connectorId =
              data.merchantAcquirerAccountId ||
              data.connector_id ||
              data.merchantConnector?.id ||
              data.merchant_acquirer_account_id;
            if (connectorId) {
              setSelectedConnectorId(connectorId.toString());
              setPendingConnectorId(connectorId.toString());
            }

            const { combineMode: cm, leaves } = parseRoutingConfig(data.config);
            setCombineMode(cm);
            if (leaves.length > 0) {
              setConditions(
                leaves.map((leaf) => {
                  const row = leafConditionToFormRow(leaf);
                  let value: string;
                  if (
                    Array.isArray(row.value) &&
                    row.value.length === 2 &&
                    typeof (row.value as [number, number])[0] === 'number'
                  ) {
                    value = `${(row.value as [number, number])[0]},${(row.value as [number, number])[1]}`;
                  } else if (Array.isArray(row.value)) {
                    value = row.value.join(',');
                  } else {
                    value =
                      row.value !== undefined && row.value !== null
                        ? String(row.value)
                        : '';
                  }
                  let category = String(row.category || '');
                  if (category === 'country_customer') category = 'country';
                  if (category === 'country_issuer') category = 'bin_country';
                  const ops = CONDITION_OPERATOR_MAP[category] || [];
                  const validOperator = ops.some((o) => o.value === row.operator)
                    ? row.operator
                    : ops[0]?.value || '';
                  return { category, operator: validOperator, value };
                }),
              );
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load routing detail');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred while loading routing');
      } finally {
        setLoadingDetail(false);
      }
    };

    if (userId && routingId) {
      loadDetail();
    }
  }, [userId, routingId]);

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

            // If nothing selected yet, use primary or first
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

  // Fetch currencies for condition select
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const currencies = await fetchListOfCurrencies();
        setCurrencyOptions(
          currencies.map((c: { label?: string; code?: string; value?: string | number | null }) => {
            const label = c.label || c.code || String(c.value ?? '');
            const value = String(c.value ?? c.code ?? '');
            return { label, value };
          }),
        );
      } catch {
        // non-critical
      }
    };
    loadCurrencies();
  }, []);

  // Fetch countries for condition select
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countries = await fetchListOfCountries();
        setCountryOptions(countries);
      } catch {
        // non-critical
      }
    };
    loadCountries();
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
              label: formatConnectorLabel(conn),
            }));
            setConnectorOptions(options);

            // Sync from routing detail once: pendingConnectorId is set on load only.
            if (pendingConnectorId && options.some((o: Option) => o.value === pendingConnectorId)) {
              setSelectedConnectorId(pendingConnectorId);
              setPendingConnectorId('');
              return;
            }

            // Keep current selection if still valid; otherwise first connector.
            setSelectedConnectorId((prev) => {
              if (prev && options.some((o: Option) => o.value === prev)) {
                return prev;
              }
              return options[0]?.value || '';
            });
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
    // Do not depend on selectedConnectorId — re-running when the user picks a connector
    // would re-apply pendingConnectorId and revert the dropdown.
  }, [userId, selectedProfileId, pendingConnectorId]);

  const getInputType = (category: string, operator: string): ConditionOperatorInputType => {
    const operators = CONDITION_OPERATOR_MAP[category] || [];
    return (operators.find((op) => op.value === operator)?.inputType || 'input') as ConditionOperatorInputType;
  };

  const handleConditionChange = (
    index: number,
    field: keyof Condition,
    value: string,
  ) => {
    setConditions((prev) => {
      const updated = [...prev];
      if (field === 'category') {
        updated[index] = { ...updated[index], category: value };
        const ops = CONDITION_OPERATOR_MAP[value] || [];
        updated[index].operator = ops[0]?.value || '';
        updated[index].value = '';
      } else if (field === 'operator') {
        const prevOp = updated[index].operator;
        updated[index] = { ...updated[index], operator: value };
        const nextType = getInputType(updated[index].category, value);
        const prevType = getInputType(updated[index].category, prevOp);
        if (nextType === 'range') {
          updated[index].value = '0,0';
        } else if (prevType === 'range') {
          updated[index].value = '';
        }
      } else {
        updated[index] = { ...updated[index], [field]: value };
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

  const renderValueInput = (condition: Condition, idx: number) => {
    const inputType = getInputType(condition.category, condition.operator);

    if (inputType === 'range') {
      const parts = condition.value.split(',').map((x) => x.trim());
      const a = parts[0] ?? '';
      const b = parts[1] ?? '';
      return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={a}
            onChange={(e) => handleConditionChange(idx, 'value', `${e.target.value},${b}`)}
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="number"
            placeholder="Max"
            value={b}
            onChange={(e) => handleConditionChange(idx, 'value', `${a},${e.target.value}`)}
          />
        </div>
      );
    }

    if (inputType === 'search-select') {
      const options =
        condition.category === 'currency'
          ? currencyOptions
          : condition.category === 'country' || condition.category === 'bin_country'
            ? countryOptions
            : [];

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
          : condition.category === 'card_brand'
            ? CARD_BRAND_OPTIONS
            : condition.category === 'card_wl_ft'
              ? CARD_WL_FT_OPTIONS
              : [];

      const validValue = options.some((o) => String(o.value) === condition.value)
        ? condition.value
        : '';

      return (
        <Select
          value={validValue}
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

    if (inputType === 'multi-input') {
      return (
        <Textarea
          placeholder="Comma separated values"
          value={condition.value}
          onChange={(e) => handleConditionChange(idx, 'value', e.target.value)}
        />
      );
    }

    if (inputType === 'multi-select') {
      const options =
        condition.category === 'currency'
          ? currencyOptions
          : condition.category === 'card_type'
            ? CARD_TYPE_OPTIONS
            : condition.category === 'card_brand'
              ? CARD_BRAND_OPTIONS
              : condition.category === 'country' || condition.category === 'bin_country'
                ? countryOptions
                : [];

      if (!options || options.length === 0) {
        return (
          <Textarea
            placeholder="Comma separated values"
            value={condition.value}
            onChange={(e) => handleConditionChange(idx, 'value', e.target.value)}
          />
        );
      }

      const selectedValues = condition.value
        ? String(condition.value)
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
        : [];

      return (
        <MultiSelect
          options={options}
          selected={selectedValues}
          onChange={(selected) =>
            handleConditionChange(idx, 'value', selected.join(','))
          }
          placeholder="Select one or more values"
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
    if (
      conditions.some((c) => {
        if (!c.category || !c.operator) return true;
        if (getInputType(c.category, c.operator) === 'range') {
          const parts = c.value.split(',').map((x) => x.trim()).filter(Boolean);
          return (
            parts.length !== 2 ||
            parts.some((p) => p === '' || Number.isNaN(Number(p)))
          );
        }
        return !`${c.value}`.trim();
      })
    ) {
      toast.error('All conditions must be filled');
      return;
    }

    const leaves: RoutingLeafCondition[] = conditions.map((c) => {
      const inputType = getInputType(c.category, c.operator);
      if (c.operator === 'between' || c.operator === 'not_between') {
        const parts = c.value.split(',').map((v) => v.trim()).filter(Boolean);
        if (parts.length === 2) {
          return {
            category: c.category,
            operator: c.operator,
            value: [Number(parts[0]), Number(parts[1])],
          };
        }
      }
      if (inputType === 'multi-select' || inputType === 'multi-input') {
        return {
          category: c.category,
          operator: c.operator,
          value: c.value
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean),
        };
      }
      if (c.category === 'amount') {
        const num = Number(c.value);
        return {
          category: c.category,
          operator: c.operator,
          value: Number.isNaN(num) ? c.value : num,
        };
      }
      return { category: c.category, operator: c.operator, value: c.value };
    });
    const config = serializeRoutingConfig(leaves, combineMode);

    const payload = {
      name,
      routingFor,
    //   merchantProfileId: Number(selectedProfileId),
      merchantAcquirerAccountId: Number(selectedConnectorId),
      config,
      splitEnable,
    };

    try {
      setSubmitting(true);
      const response = await updateUserRouting(userId, routingId, payload as any);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Routing rule updated successfully');
          router.push(backUrl);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update routing rule');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = profilesLoading || loadingDetail || (selectedProfileId ? connectorsLoading : false);

  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Edit Routing Rule"
          description="Update payment routing rule conditions, priorities, and connector assignments for transaction optimization"
          icon={Route}
        />
        <ToolbarActions>
          <Button variant="outline" onClick={() => router.push(backUrl)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={submitting || isLoading} onClick={handleSubmit}>
            {submitting ? 'Updating...' : 'Update'}
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
                    setPendingConnectorId('');
                    setSelectedConnectorId('');
                  }}
                  placeholder="Select merchant profile"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Connector</Label>
                {connectorsLoading ? (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
              <div className="rounded-lg border p-4 bg-muted/30 max-w-md">
                <div className="space-y-2">
                  <Label>How conditions combine</Label>
                  <Select
                    value={combineMode}
                    onValueChange={(v) => setCombineMode(v as 'AND' | 'OR')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">All must match (AND)</SelectItem>
                      <SelectItem value="OR">Any one matches (OR)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    OR sends a single OR group to the API so any listed row can match.
                  </p>
                </div>
              </div>
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

