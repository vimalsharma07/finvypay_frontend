/**
 * Shared column definitions for transaction tables
 * Modern, premium fintech design
 */

import { ColumnDef } from '@tanstack/react-table';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/lib/services/admin/transaction';
import {
  formatTransactionDate,
  formatTransactionAmount,
  getTransactionStatusOverride,
} from './utils';
import { TransactionActionMenu } from './transaction-action-menu';
import { CheckCircle2, Clock, XCircle, AlertCircle, Copy, Check, Ban, RotateCcw } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatCardTypeDisplay } from '@/lib/utils/format-card-type';
import { formatPaymentSourceDisplay } from '@/lib/utils/format-payment-source';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function getCountryDisplayName(code: string) {
  const normalizedCode = code?.trim().toUpperCase();
  if (!normalizedCode || normalizedCode.length !== 2) return null;
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(normalizedCode) ?? null;
  } catch {
    return null;
  }
}

// Transaction ID Cell Component
function TransactionIdCell({
  transactionId,
  onViewDetails,
}: {
  transactionId: string;
  onViewDetails?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(transactionId);
      setCopied(true);
      toast.success('Transaction ID copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };
  return (
    <div className="group flex max-w-full items-center gap-0.5">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails?.();
        }}
        className="min-w-0 truncate text-left font-mono text-sm font-medium text-primary transition-colors hover:text-primary/80"
      >
        {transactionId}
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex shrink-0 rounded p-0.5 text-muted-foreground opacity-70 transition-colors hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100"
        aria-label="Copy transaction ID"
        title="Copy transaction ID"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-600" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

/**
 * Get transaction table columns
 */
export function getTransactionColumns(
  onViewDetails?: (transaction: Transaction) => void,
  showDisabledActions: boolean = true, // Default to true for production
  onChargeback?: (transaction: Transaction) => void,
  onRefund?: (transaction: Transaction) => void,
  onSuspicious?: (transaction: Transaction) => void,
  onViewLogs?: (transaction: Transaction) => void,
  onResendWebhook?: (transaction: Transaction) => void,
  resendingWebhookTransactionId?: string | null
): ColumnDef<Transaction>[] {
  return [
    {
      id: 'user',
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Card Holder" />
      ),
      cell: ({ row }) => {
        const fullName = `${row.original.firstName} ${row.original.lastName}`.trim();
        const initials = `${row.original.firstName?.[0] || ''}${row.original.lastName?.[0] || ''}`.toUpperCase();

        const cardTypeLabel = formatCardTypeDisplay(row.original.cardType);

        const cardTypeBadgeClassName = (() => {
          const label = cardTypeLabel ?? '';
          const upper = label.toUpperCase();

          if (upper.includes('VISA')) {
            return 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900';
          }
          // API sometimes returns "MASTER" (not "MASTERCARD")
          if (upper.includes('MASTERCARD') || upper.includes('MASTER')) {
            return 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900';
          }
          if (upper.includes('AMEX') || upper.includes('AMERICAN EXPRESS')) {
            return 'text-primary bg-primary/10 border-primary/30 dark:bg-primary/15 dark:border-primary/40';
          }
          // Fallback
          return 'text-muted-foreground bg-muted/40 border-border';
        })();

        const cardFlowLabel = row.original.isCardWl ? 'STD' : 'FTD';
        const cardFlowBadgeClassName = row.original.isCardWl
          ? 'text-green-700 dark:text-green-500 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900'
          : 'text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900';

        const paymentSourceLabel = formatPaymentSourceDisplay(row.original.paymentSource);
        const paymentSourceKey = String(row.original.paymentSource ?? 'api').toLowerCase();
        const paymentSourceBadgeClassName =
          paymentSourceKey === 'payment_link'
            ? 'text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-900'
            : paymentSourceKey === 'api' || paymentSourceKey === ''
              ? 'text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900'
              : 'text-muted-foreground bg-muted/40 border-border';

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {initials}
            </div>
            <div className="flex min-w-0 flex-col">
              <div className="truncate font-medium text-foreground">{fullName || '-'}</div>
              {row.original.email && (
                <div className="truncate text-xs text-muted-foreground">{row.original.email}</div>
              )}

              <div className="mt-1 flex flex-wrap gap-2">
                {cardTypeLabel && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'inline-flex h-5 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                      cardTypeBadgeClassName
                    )}
                  >
                    {cardTypeLabel}
                  </Badge>
                )}

                <Badge
                  variant="outline"
                  className={cn(
                    'inline-flex h-5 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                    cardFlowBadgeClassName
                  )}
                >
                  {cardFlowLabel}
                </Badge>

                <Badge
                  variant="outline"
                  className={cn(
                    'inline-flex h-5 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                    paymentSourceBadgeClassName
                  )}
                >
                  {paymentSourceLabel}
                </Badge>
              </div>
            </div>
          </div>
        );
      },
      size: 220, // Name + email on two lines
      minSize: 180,
      meta: {
        headerClassName: 'text-left',
        cellClassName: 'text-left',
      },
    },
    {
      id: 'transactionId',
      accessorKey: 'transactionId',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Transaction ID" />
      ),
      cell: ({ row }) => {
        return (
          <TransactionIdCell
            transactionId={row.original.transactionId}
            onViewDetails={() => onViewDetails?.(row.original)}
          />
        );
      },
      size: 180, // Transaction IDs like "TXN-20251220-871A07"
      minSize: 150,
      meta: {
        headerClassName: 'text-left',
        cellClassName: 'text-left',
      },
    },
    {
      id: 'acquirerName',
      accessorKey: 'acquirerName',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Acquirer" />
      ),
      cell: ({ row }) => {
        const name = row.original.acquirerName;
        const formatted = name
          ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
          : '—';
        return <span className="font-medium">{formatted}</span>;
      },
      size: 120,
      minSize: 100,
      meta: {
        headerClassName: 'text-left',
        cellClassName: 'text-left',
      },
    },
    {
      id: 'country',
      accessorKey: 'country',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Country" />
      ),
      cell: ({ row }) => {
        const country = row.original.country ?? '';
        const countryCode = country.trim().toUpperCase();
        const countryName = getCountryDisplayName(countryCode);
        const getFlagEmoji = (code: string) => {
          if (!code || code.length !== 2) return '🌐';
          const codePoints = code.toUpperCase().split('').map((char) => 127397 + char.charCodeAt(0));
          return String.fromCodePoint(...codePoints);
        };
        const tooltipLabel = countryName || countryCode || '—';
        return (
          <div className="flex min-w-0 items-center">
            {countryCode ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    className="inline-flex max-w-full cursor-default items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
                  >
                    <span className="text-[15px] leading-none" aria-hidden>
                      {getFlagEmoji(countryCode)}
                    </span>
                    <span className="font-mono tracking-tight">{countryCode}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  {tooltipLabel}
                </TooltipContent>
              </Tooltip>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        );
      },
      size: 100,
      minSize: 88,
      meta: {
        headerClassName: 'text-left',
        cellClassName: 'text-left',
      },
    },
    {
      id: 'amountInUsd',
      accessorKey: 'amountInUsd',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Amount (USD)" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        // PENDING=0, SUCCESS=1, FAILED=2, BLOCKED=3, ABANDONED=4, REDIRECTED=5
        const amountColor = status === 1
          ? 'text-green-700 dark:text-green-500'
          : status === 2 || status === 3
          ? 'text-red-700 dark:text-red-500'
          : status === 0
          ? 'text-amber-700 dark:text-amber-500'
          : 'text-foreground';
        return (
          <div className={cn('text-left font-semibold tabular-nums', amountColor)}>
            {formatTransactionAmount(row.original.amountInUsd)}
          </div>
        );
      },
      size: 140, // Currency formatted amounts
      minSize: 120,
      meta: {
        headerClassName: 'text-left',
        cellClassName: 'text-left',
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        const message = row.original.message?.trim();
        const messageTooltip = message && message.length > 0 ? message : 'No message available';
        // PENDING=0, SUCCESS=1, FAILED=2, BLOCKED=3, ABANDONED=4, REDIRECTED=5
        // chargebackDate present → treat as Chargeback
        const statusConfig = {
          0: { label: 'Pending', icon: Clock, className: 'text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900' },
          1: { label: 'Success', icon: CheckCircle2, className: 'text-green-700 dark:text-green-500 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900' },
          2: { label: 'Failed', icon: XCircle, className: 'text-red-700 dark:text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900' },
          3: { label: 'Blocked', icon: XCircle, className: 'text-red-700 dark:text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900' },
          4: { label: 'Abandoned', icon: AlertCircle, className: 'text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-900' },
          5: { label: 'Redirected', icon: AlertCircle, className: 'text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-900' },
        };
        const override = getTransactionStatusOverride(row.original);
        const config =
          override === 'chargeback'
            ? {
                label: 'Chargeback',
                icon: Ban,
                className:
                  'text-orange-700 dark:text-orange-500 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900',
              }
            : override === 'refund'
              ? {
                  label: 'Refunded',
                  icon: RotateCcw,
                  className:
                    'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900',
                }
              : statusConfig[status as keyof typeof statusConfig] || {
                  label: `Status ${status}`,
                  icon: AlertCircle,
                  className: '',
                };
        const Icon = config.icon;
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex cursor-help">
                <Badge
                  variant="outline"
                  size="sm"
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-medium shadow-sm',
                    config.className
                  )}
                >
                  <Icon className="h-3 w-3" />
                  <span>{config.label}</span>
                </Badge>
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[360px] break-words">
              {messageTooltip}
            </TooltipContent>
          </Tooltip>
        );
      },
      size: 110, // Status badges
      minSize: 100,
      meta: {
        headerClassName: 'text-left',
        cellClassName: 'text-left',
      },
    },
    {
      id: 'merchantUser',
      accessorFn: (row) => row.user?.name || '',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Merchant" />
      ),
      cell: ({ row }) => {
        const profileName = row.original.merchantProfileName?.trim();
        const industryName = row.original.industryName?.trim();
        const industryBadgeClassName =
          'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900';
        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="font-medium text-foreground">{row.original.user?.name || '-'}</div>
            {profileName ? (
              <div className="truncate text-xs text-muted-foreground" title={profileName}>
                {profileName}
              </div>
            ) : null}
            {industryName ? (
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'inline-flex h-5 max-w-full items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                    industryBadgeClassName
                  )}
                  title={industryName}
                >
                  <span className="truncate">{industryName}</span>
                </Badge>
              </div>
            ) : null}
          </div>
        );
      },
      size: 180,
      minSize: 150,
      meta: {
        headerClassName: 'text-left',
        cellClassName: 'text-left',
      },
    },
    {
      id: 'transactionDate',
      accessorKey: 'transactionDate',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Transaction Date" />
      ),
      cell: ({ row }) => {
        const formatted = formatTransactionDate(row.original.transactionDate);
        return (
          <div className="text-xs text-muted-foreground" title={formatted}>
            {formatted}
          </div>
        );
      },
      size: 180, // Formatted date/time
      minSize: 160,
      meta: {
        headerClassName: 'text-left',
        cellClassName: 'text-left',
      },
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Action" />
      ),
      cell: ({ row }) => (
        <TransactionActionMenu
          transaction={row.original}
          onChargeback={onChargeback}
          onRefund={onRefund}
          onSuspicious={onSuspicious}
          onViewLogs={onViewLogs}
          onResendWebhook={onResendWebhook}
          resendingWebhookTransactionId={resendingWebhookTransactionId}
          showDisabledActions={showDisabledActions}
        />
      ),
      enableSorting: false,
      size: 80, // Three dots button
      minSize: 70,
      meta: {
        headerClassName: 'text-left',
        cellClassName: 'text-left',
      },
    },
  ];
}

