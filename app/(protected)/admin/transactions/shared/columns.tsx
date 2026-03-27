/**
 * Shared column definitions for transaction tables
 * Modern, premium fintech design
 */

import { ColumnDef } from '@tanstack/react-table';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/lib/services/admin/transaction';
import {
  formatTransactionStatus,
  formatTransactionDate,
  formatTransactionAmount,
} from './utils';
import { TransactionActionMenu } from './transaction-action-menu';
import { CheckCircle2, Clock, XCircle, AlertCircle, Copy, Check } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
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
  onViewDetails 
}: { 
  transactionId: string; 
  onViewDetails?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <button
      onClick={onViewDetails}
      onDoubleClick={handleCopy}
      className="group flex items-center gap-1 font-mono text-sm font-medium text-primary hover:text-primary/80 transition-colors"
    >
      <span>{transactionId}</span>
      <Copy className={cn("h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity", copied && "hidden")} />
      {copied && <Check className="h-3.5 w-3.5 text-green-600" />}
    </button>
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
  onResendWebhook?: (transaction: Transaction) => void,
  resendingWebhookTransactionId?: string | null
): ColumnDef<Transaction>[] {
  return [
    {
      id: 'user',
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="User" />
      ),
      cell: ({ row }) => {
        const fullName = `${row.original.firstName} ${row.original.lastName}`.trim();
        const initials = `${row.original.firstName?.[0] || ''}${row.original.lastName?.[0] || ''}`.toUpperCase();

        // API may return `cardType` as either number (1/2) or string (e.g. "VISA").
        const rawCardType = row.original.cardType as unknown;
        const cardTypeLabel: string | null =
          rawCardType == null
            ? null
            : typeof rawCardType === 'string'
              ? rawCardType.toUpperCase()
              : rawCardType === 1
                ? 'Credit'
                : rawCardType === 2
                  ? 'Debit'
                  : `Type ${rawCardType}`;

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
        return (
          <div className="flex min-w-0 items-center gap-1.5 text-sm">
            <span className="text-base leading-none">{getFlagEmoji(countryCode)}</span>
            {countryCode ? (
              <span className="truncate font-medium text-foreground">
                {countryName || countryCode} - {countryCode}
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        );
      },
      size: 180, // Country name + code
      minSize: 150,
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
          <div className={cn('font-semibold tabular-nums', amountColor)}>
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
        const statusConfig = {
          0: { label: 'Pending', icon: Clock, className: 'text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900' },
          1: { label: 'Success', icon: CheckCircle2, className: 'text-green-700 dark:text-green-500 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900' },
          2: { label: 'Failed', icon: XCircle, className: 'text-red-700 dark:text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900' },
          3: { label: 'Blocked', icon: XCircle, className: 'text-red-700 dark:text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900' },
          4: { label: 'Abandoned', icon: AlertCircle, className: 'text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-900' },
          5: { label: 'Redirected', icon: AlertCircle, className: 'text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-900' },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { label: `Status ${status}`, icon: AlertCircle, className: '' };
        const Icon = config.icon;
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex cursor-help">
                <Badge
                  variant="outline"
                  size="sm"
                  className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-medium', config.className)}
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
      id: 'merchantUser',
      accessorFn: (row) => row.user?.name || '',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Merchant User" />
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium text-foreground">
            {row.original.user?.name || '-'}
          </div>
        );
      },
      size: 160, // Merchant user names
      minSize: 140,
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

