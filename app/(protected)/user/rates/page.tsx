'use client';

import { Fragment, useEffect, useState } from 'react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
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
            title="My Rates"
            description="View your merchant rate details"
          />
        </Toolbar>
      </Container>

      <Container>
        {loading ? (
          <div className="py-10 text-center text-muted-foreground">Loading rates...</div>
        ) : !rates ? (
          <div className="py-10 text-center text-muted-foreground">No rates available.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
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

            <Card>
              <CardHeader>
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


