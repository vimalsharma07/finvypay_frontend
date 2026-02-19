/**
 * User transaction column definitions
 * Excludes merchant user and action columns
 * Modern, premium fintech design
 */

import { ColumnDef } from '@tanstack/react-table';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/lib/services/user/transaction';
import {
  formatTransactionStatus,
  formatTransactionDate,
  formatTransactionAmount,
} from './utils';
import { CheckCircle2, Clock, XCircle, AlertCircle, Copy, Check } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
 * Get user transaction table columns (without merchant user and action columns)
 */
export function getTransactionColumns(
  onViewDetails?: (transaction: Transaction) => void
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
            </div>
          </div>
        );
      },
      size: 220,
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
      size: 180,
      minSize: 150,
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
        const getFlagEmoji = (code: string) => {
          if (!code || code.length !== 2) return '🌐';
          const codePoints = code.toUpperCase().split('').map((char) => 127397 + char.charCodeAt(0));
          return String.fromCodePoint(...codePoints);
        };
        return (
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5">
            <span className="text-sm leading-none">{getFlagEmoji(country)}</span>
            <span className="text-xs font-medium text-foreground tabular-nums">{country || '—'}</span>
          </div>
        );
      },
      size: 90,
      minSize: 80,
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
      size: 140,
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
        const fullDate = (() => {
          try {
            const date = new Date(row.original.transactionDate);
            return date.toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              timeZoneName: 'short',
            });
          } catch {
            return row.original.transactionDate;
          }
        })();
        return (
          <div className="text-xs text-muted-foreground" title={fullDate}>
            {formatTransactionDate(row.original.transactionDate)}
          </div>
        );
      },
      size: 180,
      minSize: 160,
      meta: {
        headerClassName: 'text-left',
        cellClassName: 'text-left',
      },
    },
  ];
}

