'use client';

import { useMemo, useState } from 'react';
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
import { Transaction } from '@/lib/services/user/transaction';
import { formatTransactionStatus, formatTransactionDate } from './utils';
import { 
  User, 
  CreditCard, 
  Info, 
  Hash, 
  Webhook,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  RotateCcw,
  Copy,
  Check
} from 'lucide-react';

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
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      <div className="text-sm font-medium text-foreground break-words">{displayValue}</div>
    </div>
  );
}

export function TransactionDetailsDialog({
  open,
  onOpenChange,
  transaction,
}: TransactionDetailsDialogProps) {
  const [copied, setCopied] = useState(false);
  
  const statusInfo = useMemo(
    () => (transaction ? formatTransactionStatus(transaction.status) : null),
    [transaction]
  );

  const handleCopyTransactionId = async () => {
    if (!transaction?.transactionId) return;
    try {
      await navigator.clipboard.writeText(transaction.transactionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy transaction ID:', error);
    }
  };

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
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-background to-muted/20 mb-0">
          <div className="flex items-center gap-3 flex-wrap">
            <DialogTitle className="text-2xl font-bold">Transaction Details</DialogTitle>
            {transaction.transactionId && (
              <div className="flex items-center gap-1">
                <Hash className="size-4 text-muted-foreground" />
                <span className="text-sm font-mono text-muted-foreground">{transaction.transactionId}</span>
                <button
                  onClick={handleCopyTransactionId}
                  className="p-1 rounded-md hover:bg-muted transition-colors group"
                  title="Copy Transaction ID"
                >
                  {copied ? (
                    <Check className="size-3.5 text-primary" />
                  ) : (
                    <Copy className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </button>
              </div>
            )}
          </div>
        </DialogHeader>

        <DialogBody className="overflow-hidden flex-1 px-6 pb-6">
          {/* Status Indicator */}
          <div className="flex items-center gap-6 pb-6 mb-6 border-b">
            <div className="flex items-center gap-4">
              <Badge
                variant={statusInfo?.variant || 'secondary'}
                className={`size-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                  statusInfo?.label === 'Refunded' ? 'bg-purple-500 hover:bg-purple-600' : ''
                }`}
              >
                {statusInfo?.variant === 'success' ? (
                  <CheckCircle2 className="size-6" />
                ) : statusInfo?.variant === 'destructive' ? (
                  <XCircle className="size-6" />
                ) : statusInfo?.variant === 'warning' ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : statusInfo?.label === 'Refunded' ? (
                  <RotateCcw className="size-6" />
                ) : (
                  <AlertCircle className="size-6" />
                )}
              </Badge>
              <div className="flex flex-col gap-1">
                <div className="text-base font-semibold">{statusInfo?.label || 'Unknown'}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="size-3" />
                  <span>{formattedDate.date}</span>
                  <Clock className="size-3 ml-2" />
                  <span>{formattedDate.time}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="billing" className="w-full flex gap-6 h-full">
            <TabsList className="flex flex-col items-start w-56 h-full bg-muted/60 p-2 rounded-lg">
              <TabsTrigger 
                value="billing" 
                className="w-full justify-start gap-3 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm [&[data-state=active]_svg]:text-primary-foreground [&[data-state=active]_svg]:!text-primary-foreground"
              >
                <User className="size-4" />
                <span>Billing Info</span>
              </TabsTrigger>
              <TabsTrigger 
                value="card" 
                className="w-full justify-start gap-3 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm [&[data-state=active]_svg]:text-primary-foreground [&[data-state=active]_svg]:!text-primary-foreground"
              >
                <CreditCard className="size-4" />
                <span>Card Info</span>
              </TabsTrigger>
              <TabsTrigger 
                value="extra" 
                className="w-full justify-start gap-3 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm [&[data-state=active]_svg]:text-primary-foreground [&[data-state=active]_svg]:!text-primary-foreground"
              >
                <Info className="size-4" />
                <span>Extra Info</span>
              </TabsTrigger>
              <TabsTrigger 
                value="bin" 
                className="w-full justify-start gap-3 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm [&[data-state=active]_svg]:text-primary-foreground [&[data-state=active]_svg]:!text-primary-foreground"
              >
                <Hash className="size-4" />
                <span>Bin Info</span>
              </TabsTrigger>
              <TabsTrigger 
                value="webhook" 
                className="w-full justify-start gap-3 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm [&[data-state=active]_svg]:text-primary-foreground [&[data-state=active]_svg]:!text-primary-foreground"
              >
                <Webhook className="size-4" />
                <span>Webhook</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              {/* Billing Info Tab */}
              <TabsContent value="billing" className="mt-0">
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
              <TabsContent value="card" className="mt-0">
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
              <TabsContent value="extra" className="mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Transaction ID" value={transaction.transactionId} />
                  <InfoField label="Order ID" value={transaction.orderId} />
                  <InfoField label="User ID" value={transaction.userId} />
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
                  <InfoField label="Merchant Profile ID" value={transaction.merchantProfileId} />
                  <InfoField label="Acquirer ID" value={transaction.acquirerId} />
                  <InfoField label="Request API" value={transaction.requestApi} />
                </div>
              </TabsContent>

              {/* Bin Info Tab */}
              <TabsContent value="bin" className="mt-0">
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
              <TabsContent value="webhook" className="mt-0">
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
            </div>
          </Tabs>
        </DialogBody>

        <DialogFooter className="px-6 pb-6 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

