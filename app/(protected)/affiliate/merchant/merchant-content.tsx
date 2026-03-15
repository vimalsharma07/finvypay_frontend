'use client';

import { useEffect, useState, useCallback } from 'react';
import { Container } from '@/components/common/container';
import {
  getAffiliateMerchants,
  type AffiliateMerchant,
} from '@/lib/services/affiliate/merchants';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  TableComp,
  TableHeader,
  TableAction,
} from '@/app/(protected)/components/table-comp';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Percent } from 'lucide-react';

export function AffiliateMerchantContent() {
  const [merchants, setMerchants] = useState<AffiliateMerchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratesModalOpen, setRatesModalOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<AffiliateMerchant | null>(null);

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const response = await getAffiliateMerchants();
      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data?.success && Array.isArray(data.data)) {
            setMerchants(data.data);
          }
        },
        onUnauthorized: () => {
          console.warn('Unauthorized: check token');
        },
      });
    } catch (error) {
      console.error('Failed to fetch affiliate merchants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const openRatesModal = useCallback((row: AffiliateMerchant) => {
    setSelectedMerchant(row);
    setRatesModalOpen(true);
  }, []);

  const actions: TableAction<AffiliateMerchant>[] = [
    {
      label: 'Show rates',
      icon: Percent,
      onClick: openRatesModal,
    },
  ];

  const headers: TableHeader<AffiliateMerchant>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'kycStatus', label: 'KYC Status', sortable: true },
    { key: 'isBlocked', label: 'Status', sortable: true },
    { key: 'rates', label: 'MDR %', sortable: false },
    { key: 'createdAt', label: 'Created At', sortable: true },
  ];

  const renderCell = (item: AffiliateMerchant, key: keyof AffiliateMerchant | string) => {
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
      case 'kycStatus':
        return (
          <Badge
            variant={
              item.kycStatus === 'approved'
                ? 'success'
                : item.kycStatus === 'rejected'
                  ? 'destructive'
                  : 'secondary'
            }
            className="capitalize"
          >
            {item.kycStatus}
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
      case 'rates':
        const mdr = item.rates?.defaultMdr ?? item.rates?.visaMdr ?? item.rates?.masterMdr ?? '—';
        return (
          <span className="text-sm tabular-nums">
            {typeof mdr === 'number' ? `${mdr}%` : mdr}
          </span>
        );
      case 'createdAt':
        return (
          <div className="text-sm text-muted-foreground">
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : '—'}
          </div>
        );
      default:
        const value = item[key as keyof AffiliateMerchant];
        return (
          <div className="text-foreground font-normal">
            {value != null ? String(value) : '—'}
          </div>
        );
    }
  };

  const rates = selectedMerchant?.rates;
  const rateRows: { label: string; value: string | number }[] = rates
    ? [
        { label: 'Default MDR (%)', value: rates.defaultMdr },
        { label: 'Visa MDR (%)', value: rates.visaMdr },
        { label: 'Master MDR (%)', value: rates.masterMdr },
        { label: 'Success Transaction Fee', value: rates.successTransactionFee },
        { label: 'Declined Transaction Fee', value: rates.declinedTransactionFee },
        { label: 'Chargeback Fee', value: rates.chargebackFee },
        { label: 'Refund Fee', value: rates.refundFee },
        { label: 'Rolling Reserve (%)', value: rates.rollingReserve },
        { label: 'Flagged Fee', value: rates.flaggedFee },
        { label: 'Setup Fee', value: rates.setupFee },
        { label: 'Min Transaction Amount', value: rates.minTxnAmount },
        { label: 'Max Transaction Amount', value: rates.maxTxnAmount },
      ]
    : [];

  return (
    <Container>
      <TableComp<AffiliateMerchant>
        data={merchants}
        headers={headers}
        renderCell={renderCell}
        actions={actions}
        enableCheckbox={false}
        searchPlaceholder="Search merchants..."
        searchKeys={['name', 'email', 'uniqueId']}
        getRowId={(row) => row.id}
        pagination={{ pageSize: 10 }}
        loading={loading}
      />

      <Dialog open={ratesModalOpen} onOpenChange={setRatesModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              Merchant rates
            </DialogTitle>
            <DialogDescription>
              {selectedMerchant
                ? `Rates for ${selectedMerchant.name || selectedMerchant.email || 'Merchant'}`
                : 'Rates'}
            </DialogDescription>
          </DialogHeader>
          {rates ? (
            <div className="grid grid-cols-2 gap-3 pt-2">
              {rateRows.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium tabular-nums">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No rates available for this merchant.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
