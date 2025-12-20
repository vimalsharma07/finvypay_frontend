'use client';

import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Transaction } from '@/lib/services/admin/transaction';
import { formatTransactionStatus, formatTransactionDate } from './utils';

interface TransactionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

interface InfoFieldProps {
  label: string;
  value: string | number | null | undefined;
}

function InfoField({ label, value }: InfoFieldProps) {
  const displayValue = value !== null && value !== undefined ? String(value) : '-';
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="text-sm font-medium">{displayValue}</div>
    </div>
  );
}

export function TransactionDetailsDialog({
  open,
  onOpenChange,
  transaction,
}: TransactionDetailsDialogProps) {
  const statusInfo = useMemo(
    () => (transaction ? formatTransactionStatus(transaction.status) : null),
    [transaction]
  );

  const formattedDate = useMemo(() => {
    if (!transaction) return { date: '', time: '' };
    try {
      const date = new Date(transaction.transactionDate);
      const dateStr = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const timeStr = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      return { date: dateStr, time: timeStr };
    } catch {
      return { date: '', time: '' };
    }
  }, [transaction]);

  if (!transaction) return null;

  const fullName = `${transaction.firstName} ${transaction.lastName}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        <DialogBody className="overflow-y-auto flex-1">
          {/* Status Indicator */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b">
            <div className="flex flex-col items-center gap-2">
              <Badge
                variant={statusInfo?.variant || 'secondary'}
                className="size-8 rounded-full flex items-center justify-center text-white font-semibold"
              >
                1
              </Badge>
              <div className="text-sm font-medium">{statusInfo?.label || 'Unknown'}</div>
              <div className="text-xs text-muted-foreground">
                {formattedDate.date} / {formattedDate.time}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="billing" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="billing">Billing Info</TabsTrigger>
              <TabsTrigger value="card">Card Info</TabsTrigger>
              <TabsTrigger value="extra">Extra Info</TabsTrigger>
              <TabsTrigger value="bin">Bin Info</TabsTrigger>
              <TabsTrigger value="webhook">Webhook</TabsTrigger>
            </TabsList>

            {/* Billing Info Tab */}
            <TabsContent value="billing" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Name" value={fullName} />
                <InfoField label="Email ID" value={transaction.email} />
                <InfoField label="Address" value={transaction.address} />
                <InfoField label="Country" value={transaction.country} />
                <InfoField label="State" value={transaction.state} />
                <InfoField label="City" value={transaction.city} />
                <InfoField label="Zip Code" value={transaction.zip} />
                <InfoField label="IP Address" value={transaction.ipAddress} />
                <InfoField label="Phone Number" value={transaction.phoneNumber} />
              </div>
            </TabsContent>

            {/* Card Info Tab */}
            <TabsContent value="card" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Card Number" value={transaction.cardNumber} />
                <InfoField
                  label="Card Expiry"
                  value={
                    transaction.cardExpiryMonth && transaction.cardExpiryYear
                      ? `${String(transaction.cardExpiryMonth).padStart(2, '0')}/${transaction.cardExpiryYear}`
                      : null
                  }
                />
                <InfoField
                  label="Card Type"
                  value={
                    transaction.cardType !== null
                      ? transaction.cardType === 1
                        ? 'Credit'
                        : transaction.cardType === 2
                          ? 'Debit'
                          : `Type ${transaction.cardType}`
                      : null
                  }
                />
                <InfoField label="Card Bin" value={transaction.cardBin} />
                <InfoField
                  label="Is Card Whitelisted"
                  value={transaction.isCardWl ? 'Yes' : 'No'}
                />
              </div>
            </TabsContent>

            {/* Extra Info Tab */}
            <TabsContent value="extra" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Transaction ID" value={transaction.transactionId} />
                <InfoField label="Order ID" value={transaction.orderId} />
                <InfoField label="Gateway ID" value={transaction.gatewayId} />
                <InfoField label="User ID" value={transaction.userId} />
                <InfoField label="Merchant User" value={transaction.user?.name} />
                <InfoField label="Merchant Email" value={transaction.user?.email} />
                <InfoField label="Amount" value={`${transaction.amount} ${transaction.currency}`} />
                <InfoField label="Amount (USD)" value={`$${parseFloat(transaction.amountInUsd).toFixed(2)}`} />
                <InfoField
                  label="Transaction Type"
                  value={
                    transaction.transactionType !== null
                      ? `Type ${transaction.transactionType}`
                      : null
                  }
                />
                <InfoField label="Message" value={transaction.message} />
                <InfoField label="Risk Blocked" value={transaction.riskBlocked ? 'Yes' : 'No'} />
                <InfoField label="Terminal ID" value={transaction.terminalId} />
                <InfoField label="Profile ID" value={transaction.profileId} />
                <InfoField label="Connector ID" value={transaction.connectorId} />
                <InfoField label="Request API" value={transaction.requestApi} />
              </div>
            </TabsContent>

            {/* Bin Info Tab */}
            <TabsContent value="bin" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Card Bin" value={transaction.cardBin} />
                <InfoField label="Card Number" value={transaction.cardNumber} />
                <InfoField
                  label="Card Type"
                  value={
                    transaction.cardType !== null
                      ? transaction.cardType === 1
                        ? 'Credit'
                        : transaction.cardType === 2
                          ? 'Debit'
                          : `Type ${transaction.cardType}`
                      : null
                  }
                />
                <InfoField
                  label="Card Expiry"
                  value={
                    transaction.cardExpiryMonth && transaction.cardExpiryYear
                      ? `${String(transaction.cardExpiryMonth).padStart(2, '0')}/${transaction.cardExpiryYear}`
                      : null
                  }
                />
              </div>
            </TabsContent>

            {/* Webhook Tab */}
            <TabsContent value="webhook" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Webhook URL" value={transaction.webhookUrl} />
                <InfoField label="Transaction ID" value={transaction.transactionId} />
                <InfoField label="Status" value={statusInfo?.label} />
                <InfoField label="Message" value={transaction.message} />
                <InfoField label="Created At" value={formatTransactionDate(transaction.createdAt)} />
                <InfoField label="Updated At" value={formatTransactionDate(transaction.updatedAt)} />
                {transaction.refundDate && (
                  <InfoField label="Refund Date" value={formatTransactionDate(transaction.refundDate)} />
                )}
                {transaction.refundReason && (
                  <InfoField label="Refund Reason" value={transaction.refundReason} />
                )}
                {transaction.chargebackDate && (
                  <InfoField
                    label="Chargeback Date"
                    value={formatTransactionDate(transaction.chargebackDate)}
                  />
                )}
                {transaction.suspiciousDate && (
                  <InfoField
                    label="Suspicious Date"
                    value={formatTransactionDate(transaction.suspiciousDate)}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

