'use client';

import { Fragment, useEffect, useState } from 'react';
import { Percent } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { getMerchantRates, MerchantRates } from '@/lib/services/user/merchant-rates';
import { toast } from 'sonner';

export default function UserRatesPage() {
  const [rates, setRates] = useState<MerchantRates | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      try {
        const response = await getMerchantRates();
        handleApiResponse(response, {
          onSuccess: (data) => {
            if (data?.success && data.data?.merchantRates) {
              setRates(data.data.merchantRates);
            } else {
              setRates(null);
              toast.error('No rates found for your account');
            }
          },
          onError: (message) => {
            toast.error(message || 'Failed to load rates');
          },
          silent: true,
        });
      } catch (error) {
        console.error('Merchant rates fetch error:', error);
        toast.error('An unexpected error occurred while fetching rates');
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  const statusVariant = (status?: string | null) => {
    if (!status) return 'outline';
    const normalized = status.toLowerCase();
    if (normalized.includes('approved')) return 'success';
    if (normalized.includes('pending')) return 'warning';
    if (normalized.includes('reject')) return 'destructive';
    return 'outline';
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Rate Card"
            description="Your processing MDR, reserves, and per-transaction fee schedule"
            icon={Percent}
          />
        </Toolbar>
      </Container>

      <Container>
        <div className="relative mb-4 overflow-hidden rounded-2xl border border-sky-200/70 bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_55%,#e0f2fe_100%)] p-4 dark:border-sky-900/50 dark:bg-[linear-gradient(135deg,#0c1a24_0%,#0f172a_55%,#082f49_100%)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700/80 dark:text-sky-300/80">
            Workspace
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pricing assigned to your merchant account — view only.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-sky-100 bg-sky-50/40 py-10 text-center text-muted-foreground dark:border-sky-900/40 dark:bg-sky-950/20">
            Loading rates...
          </div>
        ) : !rates ? (
          <div className="rounded-2xl border border-sky-100 bg-sky-50/40 py-10 text-center text-muted-foreground dark:border-sky-900/40 dark:bg-sky-950/20">
            No rates available.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-2xl border-sky-100 shadow-sm dark:border-sky-900/40">
              <CardHeader className="flex flex-row items-center justify-between border-b border-sky-100/80 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20">
                <CardTitle>Overview</CardTitle>
                <Badge variant={statusVariant(rates.status)} className="uppercase">
                  {rates.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Default MDR</span>
                  <span className="font-medium">{rates.defaultMdr}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visa MDR</span>
                  <span className="font-medium">{rates.visaMdr}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Master MDR</span>
                  <span className="font-medium">{rates.masterMdr}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rolling Reserve</span>
                  <span className="font-medium">{rates.rollingReserve}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Setup Fee</span>
                  <span className="font-medium">{rates.setupFee}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-sky-100 shadow-sm dark:border-sky-900/40">
              <CardHeader className="border-b border-sky-100/80 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20">
                <CardTitle>Transaction Fees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success Tx Fee</span>
                  <span className="font-medium">{rates.successTransactionFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Declined Tx Fee</span>
                  <span className="font-medium">{rates.declinedTransactionFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chargeback Fee</span>
                  <span className="font-medium">{rates.chargebackFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Flagged Fee</span>
                  <span className="font-medium">{rates.flaggedFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Refund Fee</span>
                  <span className="font-medium">{rates.refundFee}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Container>
    </Fragment>
  );
}
