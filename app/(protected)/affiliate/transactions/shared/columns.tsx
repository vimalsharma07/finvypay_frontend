/**
 * Affiliate RP merchant transaction column definitions
 */

import { ColumnDef } from '@tanstack/react-table';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { Badge } from '@/components/ui/badge';
import type { AffiliateTransaction } from '@/lib/services/affiliate/transactions';
import {
  formatTransactionDate,
  formatTransactionAmount,
} from '@/app/(protected)/(merchant)/transactions/shared/utils';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

function TransactionIdCell({ transactionId }: { transactionId: string }) {
  return (
    <span className="font-mono text-sm font-medium text-primary">
      {transactionId}
    </span>
  );
}

export function getAffiliateTransactionColumns(): ColumnDef<AffiliateTransaction>[] {
  return [
    {
      id: 'user',
      accessorFn: (row) => row.user?.name ?? `${row.firstName} ${row.lastName}`.trim(),
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Merchant / User" />
      ),
      cell: ({ row }) => {
        const name = row.original.user?.name ?? `${row.original.firstName} ${row.original.lastName}`.trim();
        const email = row.original.user?.email ?? row.original.email;
        const initials = (row.original.firstName?.[0] || '') + (row.original.lastName?.[0] || '');
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {(initials || name.slice(0, 2)).toUpperCase()}
            </div>
            <div className="flex min-w-0 flex-col">
              <div className="truncate font-medium text-foreground">{name || '-'}</div>
              {email && (
                <div className="truncate text-xs text-muted-foreground">{email}</div>
              )}
            </div>
          </div>
        );
      },
      size: 220,
      minSize: 180,
    },
    {
      id: 'transactionId',
      accessorKey: 'transactionId',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Transaction ID" />
      ),
      cell: ({ row }) => (
        <TransactionIdCell transactionId={row.original.transactionId} />
      ),
      size: 180,
      minSize: 150,
    },
    {
      id: 'orderId',
      accessorKey: 'orderId',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Order ID" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground truncate max-w-[140px] block">
          {row.original.orderId || '—'}
        </span>
      ),
      size: 160,
      minSize: 120,
    },
    {
      id: 'country',
      accessorKey: 'country',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Country" />
      ),
      cell: ({ row }) => {
        const country = row.original.country ?? '';
        const codePoints = country.toUpperCase().split('').map((char) => 127397 + char.charCodeAt(0));
        const flag = country.length === 2 ? String.fromCodePoint(...codePoints) : '🌐';
        return (
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5">
            <span className="text-sm leading-none">{flag}</span>
            <span className="text-xs font-medium tabular-nums">{country || '—'}</span>
          </div>
        );
      },
      size: 90,
      minSize: 80,
    },
    {
      id: 'amountInUsd',
      accessorKey: 'amountInUsd',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Amount (USD)" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        const amountColor =
          status === 1
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
      size: 140,
      minSize: 120,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        const statusConfig: Record<number, { label: string; icon: typeof Clock; className: string }> = {
          0: { label: 'Pending', icon: Clock, className: 'text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900' },
          1: { label: 'Success', icon: CheckCircle2, className: 'text-green-700 dark:text-green-500 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900' },
          2: { label: 'Failed', icon: XCircle, className: 'text-red-700 dark:text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900' },
          3: { label: 'Blocked', icon: XCircle, className: 'text-red-700 dark:text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900' },
          4: { label: 'Abandoned', icon: AlertCircle, className: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-900' },
          5: { label: 'Redirected', icon: AlertCircle, className: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-900' },
        };
        const config = statusConfig[status] ?? { label: `Status ${status}`, icon: AlertCircle, className: '' };
        const Icon = config.icon;
        return (
          <Badge
            variant="outline"
            size="sm"
            className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-medium', config.className)}
          >
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
          </Badge>
        );
      },
      size: 110,
      minSize: 100,
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
      size: 180,
      minSize: 160,
    },
  ];
}
